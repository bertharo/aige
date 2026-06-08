import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT } from '../theme';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isInstalledPwa() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [ios] = useState(isIOS);

  const onPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (onPublicPage || localStorage.getItem('kinness_install_dismissed') || isInstalledPwa()) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (ios && !localStorage.getItem('kinness_install_dismissed')) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [onPublicPage, ios]);

  const dismiss = () => {
    localStorage.setItem('kinness_install_dismissed', '1');
    setVisible(false);
    setShowManualSteps(false);
  };

  const install = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
          dismiss();
        }
      } catch {
        setShowManualSteps(true);
      }
      return;
    }

    setShowManualSteps(true);
  };

  if (!visible || onPublicPage) return null;

  const manualHint = ios ? t('installIosSteps') : t('installAndroidManual');

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-[#EEEDFE] bg-white/95 backdrop-blur-xl"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-[390px] mx-auto">
        <p className="font-medium text-[15px] text-[#1a1a18] mb-0.5">{t('installTitle')}</p>
        <p className="text-[13px] text-[#6B6B68] mb-3">{t('installBody')}</p>

        {showManualSteps ? (
          <p className="text-[13px] text-[#3C3489] mb-3 leading-relaxed rounded-xl bg-[#F0EFFB] px-3 py-2.5">
            {manualHint}
          </p>
        ) : null}

        <div className="flex gap-2">
          {showManualSteps ? (
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 h-10 rounded-xl text-white text-[14px] font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              {t('installGotIt')}
            </button>
          ) : (
            <button
              type="button"
              onClick={install}
              className="flex-1 h-10 rounded-xl text-white text-[14px] font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              {t('installButton')}
            </button>
          )}
          {!showManualSteps ? (
            <button
              type="button"
              onClick={dismiss}
              className="h-10 px-4 text-[14px] font-medium text-[#6B6B68]"
            >
              {t('installDismiss')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
