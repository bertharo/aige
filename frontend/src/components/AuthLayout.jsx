import React from 'react';
import LangPills from './LangPills';
import { ACCENT, FONT_STACK } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

export default function AuthLayout({ children }) {
  const { t } = useLanguage();

  return (
    <div
      className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto w-full"
      style={{ fontFamily: FONT_STACK }}
    >
      <header className="flex items-center justify-between h-12 px-4 border-b border-black/8">
        <span className="text-[18px] font-medium tracking-tight text-[#0a0a0a]">Kinness</span>
        <LangPills />
      </header>
      <div className="flex-1 flex flex-col justify-center px-4 py-6 pb-10">
        <p className="text-[14px] font-medium text-black/45 mb-4 text-center">{t('tagline')}</p>
        {children}
      </div>
    </div>
  );
}

export function authInputClass() {
  return 'w-full min-h-[48px] px-4 text-[16px] font-normal bg-transparent outline-none text-[#0a0a0a] placeholder:text-black/30';
}

export function authFieldWrapClass() {
  return 'rounded-2xl overflow-hidden border-2 border-black/10 bg-black/[0.02]';
}

export function authButtonClass() {
  return 'w-full min-h-[48px] text-[16px] font-medium text-white rounded-2xl disabled:opacity-40';
}

export function authButtonStyle() {
  return { backgroundColor: ACCENT };
}
