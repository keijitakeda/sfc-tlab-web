// Render microCMS rich text with a small HTML allowlist. No styles, event handlers,
// embeds, SVG, or script-bearing URLs are copied into the live document.
const allowedTags = new Set([
  'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'blockquote',
  'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'hr', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);
const droppedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'input', 'button', 'video', 'audio']);

function allowedUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.href;
  } catch { return null; }
}

function copyNode(source: Node): Node | null {
  if (source.nodeType === Node.TEXT_NODE) return document.createTextNode(source.textContent ?? '');
  if (!(source instanceof Element)) return null;
  const tag = source.localName.toLowerCase();
  if (droppedTags.has(tag)) return null;
  if (!allowedTags.has(tag)) {
    const fragment = document.createDocumentFragment();
    for (const child of source.childNodes) {
      const copied = copyNode(child);
      if (copied) fragment.append(copied);
    }
    return fragment;
  }

  const node = document.createElement(tag);
  if (tag === 'a') {
    const href = allowedUrl(source.getAttribute('href'));
    if (href) {
      node.setAttribute('href', href);
      if (new URL(href).origin !== window.location.origin) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }
  if (tag === 'img') {
    const src = allowedUrl(source.getAttribute('src'));
    if (!src) return null;
    node.setAttribute('src', src);
    node.setAttribute('alt', source.getAttribute('alt') ?? '');
    node.setAttribute('loading', 'lazy');
    for (const size of ['width', 'height']) {
      const value = source.getAttribute(size);
      if (value && /^\d{1,4}$/.test(value)) node.setAttribute(size, value);
    }
    return node;
  }
  for (const child of source.childNodes) {
    const copied = copyNode(child);
    if (copied) node.append(copied);
  }
  return node;
}

export function renderRichText(html: string): DocumentFragment {
  const output = document.createDocumentFragment();
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  for (const child of parsed.body.childNodes) {
    const copied = copyNode(child);
    if (copied) output.append(copied);
  }
  return output;
}

export function plainRichText(html: string): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? '';
}
