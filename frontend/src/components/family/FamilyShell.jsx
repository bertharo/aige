import React from 'react';
import { LangChangeButton } from '../LanguagePicker';
import { useLanguage } from '../../i18n/LanguageContext';
import FamilyBottomNav from './FamilyBottomNav';
import { FAMILY_BG, FAMILY_FONT, FAMILY_MUTED } from './familyTheme';
import { RESIDENT_NAME } from './familyPlaceholderData';

const TAB_TITLES = {
  feed: 'Family feed',
  calendar: 'Calendar',
  record: 'Daily record',
  photos: 'Photos',
};

export default function FamilyShell({ activeTab, onTabChange, onLogout, children }) {
  const { openLanguagePicker, t } = useLanguage();
  const title = TAB_TITLES[activeTab] || 'Family feed';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: FAMILY_BG, fontFamily: FAMILY_FONT }}>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b" style={{ borderColor: '#E5E3F8' }}>
        <div className="flex items-center justify-between h-11 px-4 max-w-[390px] mx-auto">
          <div>
            <span className="text-[17px] font-medium tracking-tight text-[#1a1a24]">Kiness</span>
          </div>
          <div className="flex items-center gap-1">
            <LangChangeButton dark={false} onClick={openLanguagePicker} />
            <button
              type="button"
              onClick={onLogout}
              className="text-[13px] font-medium h-8 px-1.5"
              style={{ color: FAMILY_MUTED }}
            >
              {t('signOut')}
            </button>
          </div>
        </div>
        <div className="px-4 pb-2 max-w-[390px] mx-auto">
          <h1 className="text-[18px] font-medium text-[#1a1a24]">{title}</h1>
          <p className="text-[13px] font-normal" style={{ color: FAMILY_MUTED }}>
            {RESIDENT_NAME}
          </p>
        </div>
      </header>

      <main
        className="flex-1 max-w-[390px] mx-auto w-full px-4 py-3"
        style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 12px)' }}
        role="tabpanel"
      >
        {children}
      </main>

      <FamilyBottomNav active={activeTab} onChange={onTabChange} />
    </div>
  );
}
