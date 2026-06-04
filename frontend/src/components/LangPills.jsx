import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT } from '../theme';

export default function LangPills({ dark = false, compact = false }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`flex rounded-full p-0.5 font-medium ${compact ? 'text-[13px]' : 'text-[14px]'} ${
        dark ? 'bg-white/10' : 'bg-black/5'
      }`}
      role="group"
      aria-label={t('language')}
    >
      {['en', 'zh'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`px-2.5 py-1 rounded-full transition-colors duration-200 ${
            compact ? 'min-h-[30px]' : 'min-h-[32px]'
          } ${lang === code ? 'text-white' : dark ? 'text-white/50' : 'text-black/45'}`}
          style={lang === code ? { backgroundColor: ACCENT } : undefined}
        >
          {code === 'en' ? 'EN' : '中文'}
        </button>
      ))}
    </div>
  );
}
