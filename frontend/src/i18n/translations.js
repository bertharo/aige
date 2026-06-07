import en from './locales/en';
import es from './locales/es';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import tl from './locales/tl';
import vi from './locales/vi';
import ko from './locales/ko';

export const translations = {
  en,
  es,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  tl,
  vi,
  ko,
};

export function t(lang, key, vars = {}) {
  let str = translations[lang]?.[key] || translations.en[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v);
  });
  return str;
}
