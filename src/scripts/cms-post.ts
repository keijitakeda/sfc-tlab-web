import { cmsGet, localized } from '../cms/client';
import type { CmsPost } from '../cms/client';
import { renderRichText } from '../cms/rich-text';
import { categoryLabel } from '../cms/labels';

const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
const t = (ja: string, en: string) => lang === 'ja' ? ja : en;
const status = document.querySelector<HTMLElement>('[data-cms-post-status]');
const content = document.querySelector<HTMLElement>('[data-cms-post-content]');
const id = new URLSearchParams(location.search).get('id');

async function loadPost() {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid article ID');
  const post = await cmsGet<CmsPost>(`posts/${id}`);
  const title = localized(post, 'title', lang);
  const body = localized(post, 'body', lang);
  if (!title || !body) throw new Error('Article is incomplete');

  const titleElement = document.querySelector<HTMLElement>('[data-cms-post-title]');
  if (titleElement) titleElement.textContent = title;
  document.title = `${title} | Takeda Lab.`;
  const date = document.querySelector<HTMLTimeElement>('[data-cms-post-date]');
  if (date && post.date) {
    date.dateTime = post.date;
    date.textContent = post.date.slice(0, 10).replaceAll('-', '.');
  }
  const tags = document.querySelector<HTMLElement>('[data-cms-post-tags]');
  if (tags) for (const label of [...(post.category ?? []).map(value => categoryLabel(value, lang)), ...(post.tags ?? []).map(tag => localized(tag, 'name', lang))]) {
    if (!label) continue;
    const pill = document.createElement('span');
    pill.className = 'post-tag';
    pill.textContent = label;
    tags.append(pill);
  }
  const bodyElement = document.querySelector<HTMLElement>('[data-cms-post-body]');
  bodyElement?.replaceChildren(renderRichText(body));
  if (status) status.hidden = true;
  if (content) content.hidden = false;
}

void loadPost().catch(() => {
  if (status) status.textContent = t('記事を表示できませんでした。公開状態をご確認ください。', 'This article could not be displayed. Please check its publication status.');
});
