import React from 'react';
import GlassBackground from './GlassBackground';
import { useLanguage } from '../i18n/LanguageContext';
import { FONT_STACK, glassPanel } from '../theme';

const OPTIONS = [
  { code: 'en', title: 'English', subtitle: 'United States' },
  { code: 'zh', title: '中文', subtitle: '简体中文' },
];

export default function LanguagePicker({ onChoose }) {
  const { t } = useLanguage();

  return (
    <GlassBackground dark={false}>
      <div
        className="min-h-screen flex flex-col justify-center px-6 max-w-[390px] mx-auto"
        style={{ fontFamily: FONT_STACK }}
      >
        <p className="text-[13px] font-medium text-black/40 text-center tracking-wide uppercase mb-2">
          Kiness
        </p>
        <h1 className="text-[26px] font-medium text-[#0a0a0a] text-center leading-tight mb-1">
          {t('chooseLanguage')}
        </h1>
        <p className="text-[17px] font-normal text-black/45 text-center mb-8">{t('chooseLanguageSub')}</p>

        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => onChoose(opt.code)}
              className={`w-full text-left px-4 py-3 transition-transform active:scale-[0.99] ${glassPanel(false)}`}
            >
              <span className="block text-[18px] font-medium text-[#0a0a0a]">{opt.title}</span>
              <span className="block text-[14px] font-normal text-black/45 mt-0.5">{opt.subtitle}</span>
            </button>
          ))}
        </div>

        <p className="text-[13px] text-black/35 text-center mt-8">{t('changeLanguageHint')}</p>
      </div>
    </GlassBackground>
  );
}

export function LangChangeButton({ dark, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] transition-colors ${
        dark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-black/5 text-black/55 hover:bg-black/8'
      }`}
      aria-label="Change language"
      title="Language"
    >
      <span aria-hidden>🌐</span>
    </button>
  );
}
