const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector<HTMLDetailsElement>('.menu');

function findHash(hash: string): HTMLElement | null {
  try { return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; }
  catch { return null; }
}
function openHash() {
  const target = findHash(location.hash);
  if (target instanceof HTMLDetailsElement) target.open = true;
  return target;
}
function syncLanguageLinks() {
  const isPost = location.pathname.includes('/posts/');
  document.querySelectorAll<HTMLAnchorElement>('.language-nav a').forEach(link => {
    const locale = link.getAttribute('lang') === 'en' ? 'en' : 'ja';
    const prefix = import.meta.env.BASE_URL.replace(/\/$/, '');
    link.href = `${prefix}/${locale === 'en' ? 'en/' : ''}${isPost ? `posts/${location.search}` : ''}${location.hash}`;
  });
}
document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
  if (!link) return;
  const target = findHash(link.hash);
  if (!target) return;
  const fromMenu = menu?.contains(link);
  if (menu) menu.open = false;
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      target.querySelector('summary')?.focus({ preventScroll: true });
    });
  } else if (fromMenu) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.open) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
});
matchMedia('(min-width: 981px)').addEventListener('change', event => { if (event.matches && menu) menu.open = false; });
window.addEventListener('hashchange', () => { openHash(); syncLanguageLinks(); });
syncLanguageLinks();
const target = openHash();
if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
