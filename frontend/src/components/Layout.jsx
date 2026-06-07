import React from 'react';
import GlassBackground from './GlassBackground';
import { LangChangeButton } from './LanguagePicker';
import { useLanguage } from '../i18n/LanguageContext';
import { AdminThemeContext, useAdminTheme } from './admin/AdminShell';
import KinessLogo from './KinessLogo';
import { FONT_STACK, glassBar } from '../theme';

export default function Layout({ onLogout, children, title }) {
  const { t, openLanguagePicker } = useLanguage();
  const { dark, toggleTheme } = useAdminTheme();

  return (
    <GlassBackground dark={dark}>
      <div className="min-h-screen" style={{ fontFamily: FONT_STACK }}>
        <header className={`sticky top-0 z-50 border-b ${glassBar(dark)}`}>
          <div className="flex items-center justify-between h-11 px-4 max-w-[390px] mx-auto">
            <KinessLogo size="sm" variant={dark ? 'white' : 'color'} />
            <div className="flex items-center gap-1">
              <LangChangeButton dark={dark} onClick={openLanguagePicker} />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={dark ? 'Light mode' : 'Dark mode'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  dark ? 'bg-white/10 text-amber-300' : 'bg-black/5 text-[#1a1a1a]'
                }`}
              >
                <span className="text-sm leading-none">{dark ? '☀️' : '🌙'}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className={`text-[13px] font-medium h-8 px-1.5 ${dark ? 'text-white/65' : 'text-black/50'}`}
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </header>
        {title ? (
          <div
            className={`px-4 pt-2.5 pb-1 max-w-[390px] mx-auto ${dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}
          >
            <h1 className="text-[18px] font-medium tracking-tight">{title}</h1>
          </div>
        ) : null}
        <AdminThemeContext.Provider value={{ dark }}>
          <main className="max-w-[390px] mx-auto px-4 py-3 pb-8">{children}</main>
        </AdminThemeContext.Provider>
      </div>
    </GlassBackground>
  );
}
