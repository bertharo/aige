import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label={t('language')}>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`min-h-[44px] min-w-[44px] px-2 rounded-lg transition ${
          lang === 'en' ? 'bg-kinness-primary text-white font-medium' : 'text-kinness-text hover:bg-kinness-accent/40'
        }`}
      >
        {t('english')}
      </button>
      <span className="text-kinness-text/40">|</span>
      <button
        type="button"
        onClick={() => setLang('zh')}
        className={`min-h-[44px] min-w-[44px] px-2 rounded-lg transition ${
          lang === 'zh' ? 'bg-kinness-primary text-white font-medium' : 'text-kinness-text hover:bg-kinness-accent/40'
        }`}
      >
        {t('chinese')}
      </button>
    </div>
  );
}
