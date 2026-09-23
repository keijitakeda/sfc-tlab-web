export interface CmsList<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface CmsTag {
  id: string;
  nameJa: string;
  nameEn?: string;
}

export interface CmsResearchArea {
  id: string;
  nameJa: string;
  nameEn?: string;
  summaryJa?: string;
  summaryEn?: string;
  descriptionJa?: string;
  descriptionEn?: string;
  sortOrder?: number;
}

export interface CmsMember {
  id: string;
  nameJa: string;
  nameEn?: string;
  role: string[];
  affiliationJa?: string;
  affiliationEn?: string;
  bioJa?: string;
  bioEn?: string;
  researchAreas?: CmsResearchArea[];
  sortOrder?: number;
}

export interface CmsPost {
  id: string;
  titleJa: string;
  titleEn?: string;
  summaryJa?: string;
  summaryEn?: string;
  bodyJa: string;
  bodyEn?: string;
  date: string;
  category: string[];
  tags?: CmsTag[];
  researchAreas?: CmsResearchArea[];
  contributors?: CmsMember[];
  publishedAt?: string;
}

export interface CmsSite {
  labNameJa?: string;
  labNameEn?: string;
  affiliationJa?: string;
  affiliationEn?: string;
  introJa?: string;
  introEn?: string;
  collaborationJa?: string;
  collaborationEn?: string;
  joiningJa?: string;
  joiningEn?: string;
  entryNoteJa?: string;
  entryNoteEn?: string;
  syllabusUrl?: string;
  campusUrl?: string;
  mapUrl?: string;
  addressJa?: string;
  addressEn?: string;
  accessJa?: string;
  accessEn?: string;
}

const serviceId = import.meta.env.PUBLIC_MICROCMS_SERVICE_ID || 't-lab';
const apiKey = import.meta.env.PUBLIC_MICROCMS_API_KEY;

function endpointUrl(endpoint: string, query?: URLSearchParams) {
  if (!/^[a-z0-9-]+(?:\/[a-zA-Z0-9_-]+)?$/.test(endpoint)) throw new Error('Invalid CMS endpoint');
  if (!/^[a-z0-9-]+$/.test(serviceId)) throw new Error('Invalid CMS service ID');
  const url = new URL(`https://${serviceId}.microcms.io/api/v1/${endpoint}`);
  if (query) url.search = query.toString();
  return url;
}

export function cmsConfigured() {
  return Boolean(apiKey);
}

export async function cmsGet<T>(endpoint: string, query?: URLSearchParams): Promise<T> {
  if (!apiKey) throw new Error('microCMS API key is not configured');
  const response = await fetch(endpointUrl(endpoint, query), {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
  });
  if (!response.ok) throw new Error(`microCMS ${endpoint}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function cmsGetAll<T>(endpoint: string, depth = 1): Promise<T[]> {
  const output: T[] = [];
  let total = Infinity;
  while (output.length < total) {
    const params = new URLSearchParams({ limit: '100', offset: String(output.length), depth: String(depth) });
    const page = await cmsGet<CmsList<T>>(endpoint, params);
    if (!Array.isArray(page.contents)) throw new Error(`Invalid microCMS response: ${endpoint}`);
    output.push(...page.contents);
    total = page.totalCount;
    if (page.contents.length === 0) break;
  }
  return output;
}

export function localized(item: object, base: string, lang: 'ja' | 'en'): string {
  const values = item as Record<string, unknown>;
  const japanese = values[`${base}Ja`];
  const english = values[`${base}En`];
  const value = lang === 'en' && typeof english === 'string' && english.trim() ? english : japanese;
  return typeof value === 'string' ? value.trim() : '';
}

export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}
