import React from 'react';
import GlassBackground from './GlassBackground';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/languages';
import { FONT_STACK, glassPanel } from '../theme';
import KinessLogo from './KinessLogo';

const ACCENT = '#5B4FE8';

export default function LanguagePicker({ onChoose, onClose }) {
  const { t, lang } = useLanguage();

  return (
    <GlassBackground dark={false}>
      <div
        className="min-h-screen flex flex-col justify-end sm:justify-center px-4 pb-6 sm:px-6 max-w-[390px] mx-auto"
        style={{ fontFamily: FONT_STACK }}
      >
        <div className={`w-full p-4 sm:p-5 ${glassPanel(false)} bg-white/80`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <KinessLogo size="sm" />
              <h1 className="text-[20px] font-medium text-[#0a0a0a] leading-tight mt-0.5">
                {t('chooseLanguage')}
              </h1>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 text-black/50 text-lg leading-none"
                aria-label={t('cancel')}
              >
                ×
              </button>
            ) : null}
          </div>
          <p className="text-[14px] font-normal text-black/45 mb-4">{t('chooseLanguageSub')}</p>

          <ul className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-hide" role="listbox">
            {LANGUAGES.map(({ code, label }) => {
              const active = lang === code;
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => onChoose(code)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-colors ${
                      active ? 'bg-[#EEEDFE]' : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    <span className="text-[16px] font-medium text-[#0a0a0a]">{label}</span>
                    {active ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 12l5 5L20 7"
                          stroke={ACCENT}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="w-[18px]" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="text-[12px] text-black/35 text-center mt-4">{t('changeLanguageHint')}</p>
        </div>
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
