import React from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

export default function Layout({ user, onLogout, children, title }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const homePath =
    user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff/post' : '/family/feed';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-kinness-accent/50 shadow-sm">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between h-14">
          <button
            type="button"
            onClick={() => navigate(homePath)}
            className="text-left min-h-[44px] flex flex-col justify-center"
          >
            <span className="font-semibold text-kinness-primary text-lg leading-tight">{t('appName')}</span>
            <span className="text-xs text-kinness-text/70 hidden sm:block">{t('tagline')}</span>
          </button>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={onLogout}
              className="min-h-[44px] px-3 text-sm text-kinness-text hover:text-kinness-primary"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
        {title && (
          <div className="max-w-lg mx-auto px-4 pb-3">
            <h1 className="text-xl font-semibold text-kinness-text">{title}</h1>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">{children}</main>
    </div>
  );
}
