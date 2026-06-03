import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

export default function Login({ onLogin, onSwitchToRegister }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      onLogin(data.user, data.token, data.redirect);
    } catch (err) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-kinness-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-kinness-primary">{t('appName')}</h1>
            <p className="text-base text-kinness-text/80 mt-1">{t('tagline')}</p>
            <p className="text-lg text-kinness-text mt-4">{t('welcomeBack')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium text-kinness-text mb-2">{t('email')}</label>
              <input
                type="email"
                className="w-full min-h-[48px] px-4 text-base border-2 border-kinness-accent rounded-xl focus:border-kinness-primary focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-kinness-text mb-2">{t('password')}</label>
              <input
                type="password"
                className="w-full min-h-[48px] px-4 text-base border-2 border-kinness-accent rounded-xl focus:border-kinness-primary focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-600 text-base text-center" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-kinness-primary text-white text-lg font-semibold rounded-xl hover:opacity-95 disabled:opacity-60"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-kinness-text/80">
            {t('noAccount')}{' '}
            <button type="button" onClick={onSwitchToRegister} className="text-kinness-primary font-semibold underline min-h-[44px]">
              {t('signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
