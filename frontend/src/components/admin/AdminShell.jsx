import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import GlassBackground from '../GlassBackground';
import { LangChangeButton } from '../LanguagePicker';
import KinessLogo from '../KinessLogo';
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
      <div className="flex items-center justify-between h-11 px-4 max-w-[390px] mx-auto">
        <KinessLogo size="sm" variant={dark ? 'white' : 'color'} />
        <div className="flex items-center gap-1">
          <LangChangeButton dark={dark} onClick={onLanguage} />
          <button
            type="button"
            onClick={onToggleTheme}
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
  );
}

export function NavTabs({ tabs, active, onChange, dark }) {
  const inactive = dark ? 'text-white/45 hover:text-white/70' : 'text-black/40 hover:text-black/60';
  const activeColor = dark ? '#fafafa' : ACCENT;

  return (
    <nav
      className={`flex gap-5 overflow-x-auto px-4 max-w-[390px] mx-auto border-b ${
        dark ? 'border-white/[0.08]' : 'border-black/[0.06]'
      }`}
    >
      {tabs.map((tb) => {
        const isActive = active === tb.id;
        return (
          <button
            key={tb.id}
            type="button"
            onClick={() => onChange(tb.id)}
            className={`shrink-0 pb-2 pt-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              isActive ? '' : `border-transparent ${inactive}`
            }`}
            style={
              isActive
                ? { color: activeColor, borderBottomColor: ACCENT }
                : undefined
            }
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
        <div className={`px-4 pt-2.5 pb-0 max-w-[390px] mx-auto ${dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}>
          <h1 className="text-[18px] font-medium tracking-tight">{pageTitle}</h1>
        </div>
        <NavTabs tabs={tabs} active={tab} onChange={setTab} dark={dark} />
        <AdminThemeContext.Provider value={{ dark }}>
          <div className="max-w-[390px] mx-auto pb-6">{children}</div>
        </AdminThemeContext.Provider>
      </div>
    </GlassBackground>
  );
}
