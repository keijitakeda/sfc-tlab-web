import { cmsConfigured, cmsGet, cmsGetAll, localized, safeExternalUrl } from '../cms/client';
import type { CmsMember, CmsPost, CmsResearchArea, CmsSite } from '../cms/client';
import { plainRichText } from '../cms/rich-text';
import { categoryLabel, roleLabel } from '../cms/labels';

const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
const t = (ja: string, en: string) => lang === 'ja' ? ja : en;
const el = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);
const make = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

async function loadSite() {
  const site = await cmsGet<CmsSite>('site');
  for (const element of document.querySelectorAll<HTMLElement>('[data-cms-field]')) {
    const key = element.dataset.cmsField;
    if (!key) continue;
    const value = localized(site, key, lang);
    if (value) element.textContent = value;
  }
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-cms-href]')) {
    const field = link.dataset.cmsHref as keyof CmsSite | undefined;
    const url = field ? safeExternalUrl(site[field]) : null;
    if (url) link.href = url;
  }
  const title = localized(site, 'labName', lang);
  if (title) document.title = `${title} | Takeda Lab.`;
}

function researchItem(area: CmsResearchArea, index: number) {
  const item = make('details', 'research-detail');
  item.id = `research-${area.id}`;
  const summary = make('summary');
  summary.append(make('span', 'area-number', String(index + 1).padStart(2, '0')));
  const name = make('div', 'area-name');
  name.append(make('h3', undefined, localized(area, 'name', lang)));
  const alternate = (lang === 'ja' ? area.nameEn : area.nameJa)?.trim();
  if (alternate) name.append(make('small', undefined, alternate));
  summary.append(name, make('p', 'area-summary', localized(area, 'summary', lang)));
  const plus = make('span', 'plus', '＋');
  plus.setAttribute('aria-hidden', 'true');
  summary.append(plus);
  const detail = make('div', 'detail-copy');
  detail.append(make('p', undefined, plainRichText(localized(area, 'description', lang))));
  const links = make('div', 'detail-links');
  for (const [href, ja, en] of [
    ['#outputs', '関連する成果・活動', 'Works & activities'],
    ['#collaboration', 'この領域について相談する', 'Discuss this research area'],
  ]) {
    const link = make('a', 'text-link', t(ja, en));
    link.href = href;
    links.append(link);
  }
  detail.append(links);
  item.append(summary, detail);
  return item;
}

async function loadResearch() {
  const areas = await cmsGetAll<CmsResearchArea>('research-areas');
  if (!areas.length) return; // Keep syllabus-based content until the first area is published.
  areas.sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
  const list = el<HTMLElement>('[data-cms-list="research-areas"]');
  list?.replaceChildren(...areas.map(researchItem));
  let target: HTMLElement | null = null;
  try { if (location.hash) target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
  catch { /* Ignore malformed fragments. */ }
  if (target instanceof HTMLDetailsElement) target.open = true;
}

function postItem(post: CmsPost) {
  const item = make('li', 'post-item');
  const date = make('span', 'post-date');
  const iso = post.date?.slice(0, 10) || post.publishedAt?.slice(0, 10) || '';
  date.textContent = iso ? iso.replaceAll('-', '.') : '—';
  const article = make('article');
  const tags = make('div', 'post-tags');
  const labels = [...(post.category ?? []).map(value => categoryLabel(value, lang)), ...(post.tags ?? []).map(tag => localized(tag, 'name', lang))];
  for (const label of labels.filter(Boolean)) tags.append(make('span', 'post-tag', label));
  const heading = make('h3');
  const link = make('a', 'post-title-link', localized(post, 'title', lang));
  const prefix = import.meta.env.BASE_URL.replace(/\/$/, '');
  link.href = `${prefix}/${lang === 'en' ? 'en/' : ''}posts/?id=${encodeURIComponent(post.id)}`;
  heading.append(link);
  article.append(tags, heading);
  const summary = localized(post, 'summary', lang);
  if (summary) article.append(make('p', 'post-summary', summary));
  item.append(date, article);
  return item;
}

async function loadPosts() {
  const posts = await cmsGetAll<CmsPost>('posts');
  const list = el<HTMLUListElement>('#post-list');
  const filters = el<HTMLElement>('.post-filters');
  const count = el<HTMLElement>('.post-count');
  const status = el<HTMLElement>('[data-cms-status="posts"]');
  if (!list || !filters || !count || !status) return;
  posts.sort((a, b) => (b.date || b.publishedAt || '').localeCompare(a.date || a.publishedAt || ''));
  list.replaceChildren(...posts.map(postItem));
  count.textContent = `${posts.length}${count.dataset.suffix ?? ''}`;
  status.hidden = posts.length > 0;
  if (!posts.length) return;

  const options = [
    { key: 'all', label: t('すべて', 'All'), match: (_post: CmsPost) => true },
    ...[...new Set(posts.flatMap(post => post.category ?? []))].map(value => ({
      key: `category:${value}`, label: categoryLabel(value, lang), match: (post: CmsPost) => (post.category ?? []).includes(value),
    })),
    ...[...new Map(posts.flatMap(post => post.tags ?? []).map(tag => [tag.id, tag])).values()].map(tag => ({
      key: `tag:${tag.id}`, label: `#${localized(tag, 'name', lang)}`,
      match: (post: CmsPost) => (post.tags ?? []).some(value => value.id === tag.id),
    })),
  ];
  const items = [...list.children] as HTMLLIElement[];
  for (const option of options) {
    const button = make('button', undefined, option.label);
    button.type = 'button';
    button.dataset.filter = option.key;
    button.setAttribute('aria-pressed', String(option.key === 'all'));
    button.setAttribute('aria-controls', 'post-list');
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
      let visible = 0;
      posts.forEach((post, index) => {
        items[index].hidden = !option.match(post);
        if (!items[index].hidden) visible++;
      });
      count.textContent = `${visible}${count.dataset.suffix ?? ''}`;
    });
    filters.append(button);
  }
  filters.hidden = options.length <= 1;
}

function memberItem(member: CmsMember) {
  const card = make('article', 'member-card student-card');
  card.append(make('p', 'member-role', member.role?.map(value => roleLabel(value, lang)).join(' / ') || t('メンバー', 'Member')));
  card.append(make('h3', undefined, localized(member, 'name', lang)));
  const alternate = (lang === 'ja' ? member.nameEn : member.nameJa)?.trim();
  if (alternate) card.append(make('p', 'member-english', alternate));
  const affiliation = localized(member, 'affiliation', lang);
  if (affiliation) card.append(make('p', 'member-description', affiliation));
  const bio = localized(member, 'bio', lang);
  if (bio) card.append(make('p', 'member-description', bio));
  return card;
}

async function loadMembers() {
  const members = await cmsGetAll<CmsMember>('members');
  members.sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
  const faculty = members.find(member => member.role?.includes('教員'));
  if (faculty) {
    const name = localized(faculty, 'name', lang);
    if (name) {
      const target = el<HTMLElement>('[data-cms-member="faculty-name"]');
      if (target) target.textContent = name;
    }
    const alternate = (lang === 'ja' ? faculty.nameEn : faculty.nameJa)?.trim();
    if (alternate) {
      const target = el<HTMLElement>('[data-cms-member="faculty-alternate"]');
      if (target) target.textContent = alternate;
    }
    const affiliation = localized(faculty, 'affiliation', lang);
    if (affiliation) {
      const target = el<HTMLElement>('[data-cms-member="faculty-affiliation"]');
      if (target) target.textContent = affiliation;
    }
    const bio = localized(faculty, 'bio', lang);
    if (bio) {
      const target = el<HTMLElement>('[data-cms-member="faculty-bio"]');
      if (target) { target.textContent = bio; target.hidden = false; }
    }
  }
  const others = members.filter(member => member !== faculty);
  el<HTMLElement>('[data-cms-list="members"]')?.replaceChildren(...others.map(memberItem));
  const status = el<HTMLElement>('[data-cms-status="members"]');
  if (status) status.hidden = others.length > 0;
}

function showError(section: 'posts' | 'members') {
  const status = el<HTMLElement>(`[data-cms-status="${section}"]`);
  if (!status) return;
  status.hidden = false;
  status.textContent = section === 'posts'
    ? t('記事を読み込めませんでした。時間をおいて再度お試しください。', 'Articles could not be loaded. Please try again later.')
    : t('メンバー情報を読み込めませんでした。', 'Member information could not be loaded.');
}

if (cmsConfigured()) {
  void Promise.allSettled([
    loadSite().catch(error => { console.warn('Site content could not be loaded', error); }),
    loadResearch().catch(error => { console.warn('Research areas could not be loaded', error); }),
    loadPosts().catch(error => { console.warn('Posts could not be loaded', error); showError('posts'); }),
    loadMembers().catch(error => { console.warn('Members could not be loaded', error); showError('members'); }),
  ]);
} else {
  // Keep the static review state when a local preview has no key yet.
  console.info('microCMS is not configured for this build.');
}
