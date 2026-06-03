import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('kinness_install_dismissed')) return;

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
  }, []);

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

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-kinness-primary text-white shadow-lg">
      <div className="max-w-lg mx-auto">
        <p className="font-semibold text-base mb-1">{t('installTitle')}</p>
        <p className="text-sm text-white/90 mb-3">{t('installBody')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={install}
            className="flex-1 min-h-[44px] bg-white text-kinness-primary font-semibold rounded-lg"
          >
            {t('installButton')}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="min-h-[44px] px-4 text-white/90 underline"
          >
            {t('installDismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
