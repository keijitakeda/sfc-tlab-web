export type Locale = 'ja' | 'en';
export type Localized = Record<Locale, string>;
export interface ResearchArea {
  id: string;
  name: Localized;
  subtitle: Localized;
  summary: Localized;
  description: Localized;
}
