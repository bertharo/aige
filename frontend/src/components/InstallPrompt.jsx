import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT } from '../theme';

export default function InstallPrompt() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  const onPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (onPublicPage || localStorage.getItem('kinness_install_dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone && !localStorage.getItem('kinness_install_dismissed')) {
      setTimeout(() => setVisible(true), 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [onPublicPage]);

  const dismiss = () => {
    localStorage.setItem('kinness_install_dismissed', '1');
    setVisible(false);
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    dismiss();
  };

  if (!visible || onPublicPage) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-[#EEEDFE] bg-white/95 backdrop-blur-xl"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-[390px] mx-auto">
        <p className="font-medium text-[15px] text-[#1a1a18] mb-0.5">{t('installTitle')}</p>
        <p className="text-[13px] text-[#6B6B68] mb-3">{t('installBody')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={install}
            className="flex-1 h-10 rounded-xl text-white text-[14px] font-medium"
            style={{ backgroundColor: ACCENT }}
          >
            {t('installButton')}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="h-10 px-4 text-[14px] font-medium text-[#6B6B68]"
          >
            {t('installDismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
