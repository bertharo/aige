import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import GlassBackground from '../GlassBackground';
import { LangChangeButton } from '../LanguagePicker';
import { ACCENT, FONT_STACK, glassBar } from '../../theme';

export { ACCENT };

export const AdminThemeContext = createContext({ dark: false });
export function useAdminDark() {
  return useContext(AdminThemeContext).dark;
}

export function useAdminTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('kinness_theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('kinness_theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('admin-dark', dark);
    return () => document.documentElement.classList.remove('admin-dark');
  }, [dark]);

  const toggleTheme = useCallback(() => setDark((d) => !d), []);
  return { dark, toggleTheme };
}

function TopBar({ dark, onToggleTheme, onLogout, t, onLanguage }) {
  return (
    <header className={`sticky top-0 z-50 border-b ${glassBar(dark)}`}>
      <div className="flex items-center justify-between h-12 px-4 max-w-[390px] mx-auto">
        <span
          className="text-[18px] font-medium tracking-tight"
          style={{ color: dark ? '#fafafa' : '#0a0a0a' }}
        >
          Kinness
        </span>
        <div className="flex items-center gap-1.5">
          <LangChangeButton dark={dark} onClick={onLanguage} />
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={dark ? 'Light mode' : 'Dark mode'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
              dark ? 'bg-white/10 text-amber-300' : 'bg-black/5 text-[#1a1a1a]'
            }`}
          >
            <span className="text-base leading-none">{dark ? '☀️' : '🌙'}</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`text-[14px] font-medium min-h-[36px] px-1 ${dark ? 'text-white/70' : 'text-black/55'}`}
          >
            {t('signOut')}
          </button>
        </div>
      </div>
    </header>
  );
}

export function NavTabs({ tabs, active, onChange, dark }) {
  return (
    <nav className={`flex gap-1.5 overflow-x-auto px-4 py-2 max-w-[390px] mx-auto ${glassBar(dark)} border-b`}>
      {tabs.map((tb) => {
        const isActive = active === tb.id;
        return (
          <button
            key={tb.id}
            type="button"
            onClick={() => onChange(tb.id)}
            className={`relative shrink-0 px-3 py-1.5 text-[14px] font-medium transition-all rounded-full min-h-[34px] ${
              isActive ? 'text-white' : dark ? 'text-white/50' : 'text-black/45'
            }`}
            style={isActive ? { backgroundColor: ACCENT } : undefined}
          >
            {tb.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ onLogout, tab, setTab, tabs, children, pageTitle }) {
  const { t, openLanguagePicker } = useLanguage();
  const { dark, toggleTheme } = useAdminTheme();

  return (
    <GlassBackground dark={dark}>
      <div className="min-h-screen" style={{ fontFamily: FONT_STACK }}>
        <TopBar
          dark={dark}
          onToggleTheme={toggleTheme}
          onLogout={onLogout}
          t={t}
          onLanguage={openLanguagePicker}
        />
        <div className={`px-4 pt-3 pb-1 max-w-[390px] mx-auto ${dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}>
          <h1 className="text-[22px] font-medium tracking-tight">{pageTitle}</h1>
        </div>
        <NavTabs tabs={tabs} active={tab} onChange={setTab} dark={dark} />
        <AdminThemeContext.Provider value={{ dark }}>
          <div className="max-w-[390px] mx-auto pb-6">{children}</div>
        </AdminThemeContext.Provider>
      </div>
    </GlassBackground>
  );
}
