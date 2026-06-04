import React from 'react';
import GlassBackground from './GlassBackground';
import { LangChangeButton } from './LanguagePicker';
import { ACCENT, FONT_STACK, glassField, glassPanel } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

export default function AuthLayout({ children }) {
  const { t, openLanguagePicker } = useLanguage();

  return (
    <GlassBackground dark={false}>
      <div
        className="min-h-screen flex flex-col max-w-[390px] mx-auto w-full"
        style={{ fontFamily: FONT_STACK }}
      >
        <header className={`sticky top-0 z-40 flex items-center justify-between h-12 px-4 border-b border-black/[0.05] bg-white/50 backdrop-blur-2xl`}>
          <span className="text-[18px] font-medium tracking-tight text-[#0a0a0a]">Kinness</span>
          <LangChangeButton dark={false} onClick={openLanguagePicker} />
        </header>
        <div className="flex-1 flex flex-col justify-center px-4 py-5 pb-10">
          <div className={`${glassPanel(false)} px-5 py-6`}>
            <p className="text-[14px] font-medium text-black/45 mb-5 text-center">{t('tagline')}</p>
            {children}
          </div>
        </div>
      </div>
    </GlassBackground>
  );
}

export function authInputClass() {
  return 'w-full min-h-[48px] px-4 text-[16px] font-normal bg-transparent outline-none text-[#0a0a0a] placeholder:text-black/30';
}

export function authFieldWrapClass() {
  return glassField(false);
}

export function authButtonClass() {
  return 'w-full min-h-[48px] text-[16px] font-medium text-white rounded-2xl disabled:opacity-40';
}

export function authButtonStyle() {
  return { backgroundColor: ACCENT };
}
