import type { Locale } from '../data/types';

const categories: Record<string, string> = {
  '研究成果': 'Research',
  '活動報告': 'Lab notes',
  '展示・発表': 'Exhibitions & presentations',
};
const roles: Record<string, string> = {
  '教員': 'Faculty',
  '学生': 'Student',
  '卒業生': 'Alumni',
};

export const categoryLabel = (value: string, lang: Locale) => lang === 'en' ? categories[value] ?? value : value;
export const roleLabel = (value: string, lang: Locale) => lang === 'en' ? roles[value] ?? value : value;
