import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const base = process.env.GITHUB_PAGES === 'true' ? '/sfc-tlab-web/' : '/';
const origin = 'http://localhost:4321';
const documents = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filename);
    else if (filename.endsWith('.html')) documents.push(filename);
  }
}
async function exists(filename) {
  try { return await stat(filename); } catch { return null; }
}
async function resolveFile(url) {
  let filename = path.join(dist, decodeURIComponent(url.pathname.slice(base.length)));
  if ((await exists(filename))?.isDirectory()) filename = path.join(filename, 'index.html');
  return await exists(filename) ? filename : null;
}
const attributes = (html, name) => [...html.matchAll(new RegExp(`(?:^|[\\s<])${name}="([^"]*)"`, 'g'))].map(match => match[1]);
const cache = new Map();
async function read(filename) {
  if (!cache.has(filename)) cache.set(filename, await readFile(filename, 'utf8'));
  return cache.get(filename);
}
await walk(dist);
let checkedLinks = 0;
for (const filename of documents) {
  const html = await read(filename);
  const pageUrl = new URL(base + path.relative(dist, filename), origin);
  const ids = attributes(html, 'id');
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs in ${filename}`);
  for (const value of [...attributes(html, 'href'), ...attributes(html, 'src')]) {
    const url = new URL(value.replaceAll('&amp;', '&'), pageUrl);
    if (url.origin !== origin) continue;
    assert.ok(url.pathname.startsWith(base), `${filename}: link outside deployment path: ${value}`);
    const target = await resolveFile(url);
    assert.ok(target, `${filename}: missing ${value}`);
    if (url.hash && target.endsWith('.html')) {
      assert.ok(attributes(await read(target), 'id').includes(decodeURIComponent(url.hash.slice(1))), `${filename}: missing anchor ${value}`);
    }
    checkedLinks++;
  }
}
for (const route of ['index.html', 'en/index.html', 'takeda-kinetic-g.html', 'takeda-kinetic-g-en.html']) {
  const html = await read(path.join(dist, route));
  assert.match(html, /name="generator" content="Astro/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/class="research-detail"/g) ?? []).length, 6);
  assert.equal((html.match(/class="post-item"/g) ?? []).length, 0);
  assert.match(html, /data-cms-list="research-areas"/);
  assert.match(html, /data-cms-status="posts"/);
  assert.match(html, /<details class="student-members">/);
  assert.doesNotMatch(html, /id="practice"|<img\b/);
  assert.match(html, /class="campus-map"/);
  assert.ok(html.includes(`href="${base}en/"`), `${route}: missing English navigation`);
}
for (const route of ['posts/index.html', 'en/posts/index.html']) {
  const html = await read(path.join(dist, route));
  assert.match(html, /data-cms-post-page/);
  assert.match(html, /data-cms-post-body/);
}
// Check local font references used by the G stylesheets.
for (const stylesheet of ['takeda-visual.css', 'takeda-kinetic.css', 'takeda-page.css', 'takeda-editorial.css', 'takeda-list.css']) {
  const css = await read(path.join(dist, stylesheet));
  for (const [, value] of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
    if (/^(https?:|data:)/.test(value)) continue;
    assert.ok(await exists(path.join(dist, value)), `Missing CSS asset: ${value}`);
  }
}
console.log(`Verified ${documents.length} HTML pages and ${checkedLinks} internal links/assets; CMS routes intact.`);
