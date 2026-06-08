import React, { useState } from 'react';
import { LangChangeButton } from '../LanguagePicker';
import { useLanguage } from '../../i18n/LanguageContext';
import FamilyBottomNav from './FamilyBottomNav';
import KinessLogo from '../KinessLogo';
import { FAMILY_BG, FAMILY_FONT, FAMILY_MUTED } from './familyTheme';
import './familyStyles.css';

function DarkModeToggle() {
  return (
    <button
      type="button"
      className="w-9 h-9 flex items-center justify-center rounded-full"
      style={{ color: FAMILY_MUTED }}
      aria-label="Dark mode"
      disabled
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function FamilyShell({ activeTab, onTabChange, onLogout, children }) {
  const { openLanguagePicker, t } = useLanguage();
  const [tabKey, setTabKey] = useState(0);

  const handleTabChange = (tab) => {
    setTabKey((k) => k + 1);
    onTabChange(tab);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: FAMILY_BG, fontFamily: FAMILY_FONT }}>
      <header className="sticky top-0 z-40" style={{ backgroundColor: FAMILY_BG }}>
        <div
          className="flex items-center justify-between px-4 max-w-[390px] mx-auto"
          style={{ height: '52px' }}
        >
          <KinessLogo size="sm" />
          <div className="flex items-center gap-0.5">
            <LangChangeButton dark={false} onClick={openLanguagePicker} />
            <DarkModeToggle />
            <button
              type="button"
              onClick={onLogout}
              className="text-[12px] font-normal px-1.5"
              style={{ color: FAMILY_MUTED }}
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </header>

      <main
        className="flex-1 max-w-[390px] mx-auto w-full px-4"
        style={{
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 8px + var(--kinness-install-offset, 0px))',
        }}
        role="tabpanel"
      >
        <div key={`${activeTab}-${tabKey}`} className="family-tab-enter py-1">
          {children}
        </div>
      </main>

      <FamilyBottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
}
