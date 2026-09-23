import { writeFileSync, mkdirSync } from 'node:fs';

const directory = new URL('./schemas/', import.meta.url);
mkdirSync(directory, { recursive: true });

const field = (fieldId, name, kind, required = false, extra = {}) => ({ fieldId, name, kind, required, ...extra });
const text = (id, name, required = false, extra = {}) => field(id, name, 'text', required, extra);
const area = (id, name, required = false) => field(id, name, 'textArea', required);
const rich = (id, name, required = false) => field(id, name, 'richEditorV2', required, {
  richEditorV2Options: ['headerTwo', 'headerThree', 'paragraph', 'bold', 'italic', 'blockquote', 'listBullet', 'listOrdered', 'link', 'image'],
});
const relationList = (id, name, endpoint, displayField) => field(id, name, 'relationList', false, {
  referencedApiEndpoint: endpoint,
  listViewFieldId: displayField,
});
const sortOrder = () => field('sortOrder', '表示順', 'number', false, { numberSizeLimitValidation: { numberSize: { min: 0 } } });
const choice = (id, name, values) => field(id, name, 'select', true, {
  selectItems: values.map((value) => ({ value })),
  multipleSelect: false,
});

const schemas = {
  tags: [
    text('nameJa', 'タグ名（日本語）', true),
    text('nameEn', 'タグ名（英語）'),
  ],
  'research-areas': [
    text('nameJa', '領域名（日本語）', true),
    text('nameEn', '領域名（英語）'),
    area('summaryJa', '短い説明（日本語）'),
    area('summaryEn', '短い説明（英語）'),
    rich('descriptionJa', '詳細（日本語）'),
    rich('descriptionEn', '詳細（英語）'),
    sortOrder(),
  ],
  members: [
    text('nameJa', '氏名（日本語）', true),
    text('nameEn', '氏名（英語）'),
    choice('role', '区分', ['教員', '学生', '卒業生']),
    text('affiliationJa', '所属（日本語）'),
    text('affiliationEn', '所属（英語）'),
    area('bioJa', '紹介文（日本語）'),
    area('bioEn', '紹介文（英語）'),
    relationList('researchAreas', '研究領域', 'research-areas', 'nameJa'),
    sortOrder(),
  ],
  posts: [
    text('titleJa', 'タイトル（日本語）', true),
    text('titleEn', 'タイトル（英語）'),
    area('summaryJa', '一覧用要約（日本語）'),
    area('summaryEn', '一覧用要約（英語）'),
    rich('bodyJa', '本文（日本語）', true),
    rich('bodyEn', '本文（英語）'),
    field('date', '表示日', 'date', true, { dateFormat: true }),
    choice('category', 'カテゴリ', ['研究成果', '活動報告', '展示・発表']),
    relationList('researchAreas', '研究領域', 'research-areas', 'nameJa'),
    relationList('tags', 'タグ', 'tags', 'nameJa'),
    relationList('contributors', '関係するメンバー', 'members', 'nameJa'),
  ],
  site: [
    text('labNameJa', '研究会名（日本語）'),
    text('labNameEn', '研究会名（英語）'),
    text('affiliationJa', '所属（日本語）'),
    text('affiliationEn', '所属（英語）'),
    area('introJa', '研究会紹介（日本語）'),
    area('introEn', '研究会紹介（英語）'),
    area('collaborationJa', '対外交流の案内（日本語）'),
    area('collaborationEn', '対外交流の案内（英語）'),
    area('joiningJa', '参加案内（日本語）'),
    area('joiningEn', '参加案内（英語）'),
    area('entryNoteJa', '参加に関する補足（日本語）'),
    area('entryNoteEn', '参加に関する補足（英語）'),
    text('syllabusUrl', 'シラバスURL'),
    text('campusUrl', 'キャンパス案内URL'),
    text('mapUrl', 'GoogleマップURL'),
    area('addressJa', '所在地（日本語）'),
    area('addressEn', '所在地（英語）'),
    area('accessJa', 'アクセス案内（日本語）'),
    area('accessEn', 'アクセス案内（英語）'),
  ],
};

for (const [endpoint, apiFields] of Object.entries(schemas)) {
  writeFileSync(new URL(`${endpoint}.json`, directory), `${JSON.stringify({ apiFields, customFields: [] }, null, 2)}\n`);
}
