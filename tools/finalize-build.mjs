import { readFile, rm, writeFile } from 'node:fs/promises';

// Astro's directory output appends /index.html even to legacy .html routes.
// Publish those two routes as real files so existing Pages URLs stay identical.
for (const name of ['takeda-kinetic-g.html', 'takeda-kinetic-g-en.html']) {
  const directory = new URL(`../dist/${name}/`, import.meta.url);
  const html = await readFile(new URL('index.html', directory));
  await rm(directory, { recursive: true });
  await writeFile(new URL(`../dist/${name}`, import.meta.url), html);
}
