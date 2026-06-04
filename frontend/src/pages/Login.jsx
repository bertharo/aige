import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import AuthLayout, { authButtonClass, authButtonStyle, authFieldWrapClass, authInputClass } from '../components/AuthLayout';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT } from '../theme';

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
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || t('loginError'));
      }
      onLogin(data.user, data.token, data.redirect);
    } catch (err) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-[22px] font-medium text-[#0a0a0a] text-center mb-6">{t('welcomeBack')}</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[14px] font-medium text-black/45 mb-1.5">{t('email')}</label>
          <div className={authFieldWrapClass()}>
            <input
              type="email"
              className={authInputClass()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="block text-[14px] font-medium text-black/45 mb-1.5">{t('password')}</label>
          <div className={authFieldWrapClass()}>
            <input
              type="password"
              className={authInputClass()}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </div>
        {error && (
          <p className="text-[15px] text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className={authButtonClass()}
          style={authButtonStyle()}
        >
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>

      <p className="mt-5 text-center text-[15px] text-black/45">
        {t('noAccount')}{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium min-h-[44px]"
          style={{ color: ACCENT }}
        >
          {t('signUp')}
        </button>
      </p>
    </AuthLayout>
  );
}
