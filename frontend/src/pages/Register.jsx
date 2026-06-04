import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import AuthLayout, { authButtonClass, authButtonStyle, authFieldWrapClass, authInputClass } from '../components/AuthLayout';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT } from '../theme';

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
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || t('registerError'));
      }
      onRegister(data.user, data.token, data.redirect);
    } catch (err) {
      setError(err.message || t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  const field = (label, input) => (
    <div>
      <label className="block text-[14px] font-medium text-black/45 mb-1.5">{label}</label>
      <div className={authFieldWrapClass()}>{input}</div>
    </div>
  );

  return (
    <AuthLayout>
      <h1 className="text-[22px] font-medium text-[#0a0a0a] text-center mb-5">{t('welcomeNew')}</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {field(
          t('name'),
          <input
            type="text"
            className={authInputClass()}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        {field(
          t('email'),
          <input
            type="email"
            className={authInputClass()}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        {field(
          t('password'),
          <input
            type="password"
            className={authInputClass()}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        )}
        {field(
          t('facilityCode'),
          <input
            type="text"
            className={`${authInputClass()} uppercase`}
            value={facilityCode}
            onChange={(e) => setFacilityCode(e.target.value)}
            required
          />
        )}
        <p className="text-[13px] font-normal text-black/40 -mt-1">{t('facilityCodeHint')}</p>
        {error && (
          <p className="text-[15px] text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={authButtonClass()} style={authButtonStyle()}>
          {loading ? t('creatingAccount') : t('signUp')}
        </button>
      </form>

      <p className="mt-5 text-center text-[15px] text-black/45">
        {t('haveAccount')}{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-medium min-h-[44px]" style={{ color: ACCENT }}>
          {t('signIn')}
        </button>
      </p>
    </AuthLayout>
  );
}
