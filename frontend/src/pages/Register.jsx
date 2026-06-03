import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

export default function Register({ onRegister, onSwitchToLogin }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facilityCode, setFacilityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: { name, email, password, facilityCode },
      });
      onRegister(data.user, data.token, data.redirect);
    } catch (err) {
      setError(err.message || t('registerError'));
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-kinness-primary">{t('appName')}</h1>
            <p className="text-lg text-kinness-text mt-2">{t('welcomeNew')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium text-kinness-text mb-2">{t('name')}</label>
              <input
                type="text"
                className="w-full min-h-[48px] px-4 text-base border-2 border-kinness-accent rounded-xl focus:border-kinness-primary focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-kinness-text mb-2">{t('email')}</label>
              <input
                type="email"
                className="w-full min-h-[48px] px-4 text-base border-2 border-kinness-accent rounded-xl focus:border-kinness-primary focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-base font-medium text-kinness-text mb-2">{t('facilityCode')}</label>
              <input
                type="text"
                className="w-full min-h-[48px] px-4 text-base border-2 border-kinness-accent rounded-xl focus:border-kinness-primary focus:outline-none uppercase"
                value={facilityCode}
                onChange={(e) => setFacilityCode(e.target.value)}
                required
              />
              <p className="text-sm text-kinness-text/70 mt-1">{t('facilityCodeHint')}</p>
            </div>
            {error && <p className="text-red-600 text-base text-center" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-kinness-primary text-white text-lg font-semibold rounded-xl disabled:opacity-60"
            >
              {loading ? t('creatingAccount') : t('signUp')}
            </button>
          </form>

          <p className="mt-6 text-center text-base">
            {t('haveAccount')}{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-kinness-primary font-semibold underline min-h-[44px]">
              {t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
