/** Supported languages — label shown in native script in the switcher */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'tl', label: 'Filipino (Tagalog)' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ko', label: '한국어' },
];

export function normalizeLangCode(code) {
  if (!code) return 'en';
  if (code === 'zh') return 'zh-CN';
  return code;
}
