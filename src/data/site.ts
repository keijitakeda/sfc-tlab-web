import type { Locale, Localized } from './types';

export const navItems: { id: string; label: Localized }[] = [
  { id: 'about', label: { ja: '研究会について', en: 'About' } },
  { id: 'research-details', label: { ja: '研究領域', en: 'Research' } },
  { id: 'outputs', label: { ja: '成果・活動', en: 'Works' } },
  { id: 'members', label: { ja: 'メンバー', en: 'Members' } },
  { id: 'connect', label: { ja: '交流・参加', en: 'Connect' } },
  { id: 'access', label: { ja: 'アクセス・お問い合わせ', en: 'Access / Contact' } },
];
export const lab = {
  name: { ja: '武田圭史研究室', en: 'Keiji Takeda Laboratory' },
  affiliation: { ja: '慶應義塾大学 湘南藤沢キャンパス', en: 'Keio University, Shonan Fujisawa Campus' },
  introduction: {
    ja: 'CG・映像・光・音響を用いたメディア表現を研究しています。生成AI・ドローン・VR/AR/XRの実践的な応用にも取り組んでいます。',
    en: 'We explore expression through computer graphics, film, light and sound, alongside practical applications of generative AI, drones and VR/AR/XR.',
  },
} satisfies Record<string, Localized>;

export const translate = (lang: Locale) => (ja: string, en: string) => lang === 'ja' ? ja : en;
export const withBase = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const homePath = (lang: Locale) => withBase(lang === 'en' ? 'en/' : '');
