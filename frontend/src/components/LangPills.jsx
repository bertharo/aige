import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/languages';
import { ACCENT } from '../theme';

export default function LangPills({ dark = false, compact = false }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`flex flex-wrap gap-1 rounded-full p-0.5 font-medium ${compact ? 'text-[12px]' : 'text-[13px]'} ${
        dark ? 'bg-white/10' : 'bg-black/5'
      }`}
      role="group"
      aria-label={t('language')}
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`px-2 py-1 rounded-full transition-colors duration-200 ${
            compact ? 'min-h-[28px]' : 'min-h-[30px]'
          } ${lang === code ? 'text-white' : dark ? 'text-white/50' : 'text-black/45'}`}
          style={lang === code ? { backgroundColor: ACCENT } : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
