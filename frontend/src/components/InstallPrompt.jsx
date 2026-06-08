import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT } from '../theme';

const DISMISS_KEY = 'kinness_install_dismissed';
const DISMISS_DAYS = 7;

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isMobile() {
  return isIOS() || /Android/i.test(navigator.userAgent);
}

function isSafariIOS() {
  const ua = navigator.userAgent;
  return isIOS() && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

function isInAppBrowser() {
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp/i.test(navigator.userAgent);
}

function isInstalledPwa() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isDismissed() {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  if (raw === '1') return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function saveDismiss() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export default function InstallPrompt() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [ios] = useState(isIOS);
  const [mobile] = useState(isMobile);

  const onPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const onFamilyRoute = pathname.startsWith('/family');

  useEffect(() => {
    if (!visible || !onFamilyRoute) {
      document.documentElement.style.removeProperty('--kinness-install-offset');
      return undefined;
    }
    document.documentElement.style.setProperty('--kinness-install-offset', '132px');
    return () => document.documentElement.style.removeProperty('--kinness-install-offset');
  }, [visible, onFamilyRoute]);

  useEffect(() => {
    if (onPublicPage || isDismissed() || isInstalledPwa()) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (mobile) {
      const timer = setTimeout(() => {
        setVisible(true);
        if (ios) setShowManualSteps(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [onPublicPage, ios, mobile]);

  const dismiss = () => {
    saveDismiss();
    setVisible(false);
    setShowManualSteps(false);
  };

  const install = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === 'accepted') dismiss();
        else setShowManualSteps(true);
      } catch {
        setShowManualSteps(true);
      }
      return;
    }
    setShowManualSteps(true);
  };

  if (!visible || onPublicPage) return null;

  let manualHint = ios ? t('installIosSteps') : t('installAndroidManual');
  if (ios && isInAppBrowser()) manualHint = t('installOpenSafari');
  else if (ios && !isSafariIOS()) manualHint = t('installOpenSafari');

  const bottomOffset = onFamilyRoute
    ? 'calc(64px + env(safe-area-inset-bottom, 0px))'
    : 'env(safe-area-inset-bottom, 0px)';

  const panel = (
    <div
      className="fixed left-0 right-0 z-[120] p-4 border-t border-[#EEEDFE] bg-white/98 backdrop-blur-xl shadow-[0_-8px_32px_rgba(91,79,232,0.12)]"
      style={{ bottom: bottomOffset }}
      role="dialog"
      aria-label={t('installTitle')}
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
              className="flex-1 h-11 rounded-xl text-white text-[14px] font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              {t('installGotIt')}
            </button>
          ) : (
            <button
              type="button"
              onClick={install}
              className="flex-1 h-11 rounded-xl text-white text-[14px] font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              {t('installButton')}
            </button>
          )}
          {!showManualSteps ? (
            <button
              type="button"
              onClick={dismiss}
              className="h-11 px-4 text-[14px] font-medium text-[#6B6B68]"
            >
              {t('installDismiss')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
