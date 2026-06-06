import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAdminDark } from '../components/admin/AdminShell';
import { apiFetch } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT, btnAccentClass, glassField, glassPanel } from '../theme';

function StaffPostForm({ user, token }) {
  const { t } = useLanguage();
  const dark = useAdminDark();
  const [residents, setResidents] = useState([]);
  const [residentId, setResidentId] = useState('');
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const label = dark ? 'text-white/70' : 'text-black/55';
  const inputClass = `w-full min-h-[44px] px-3.5 text-[15px] outline-none bg-transparent ${dark ? 'text-white' : 'text-[#0a0a0a]'}`;

  useEffect(() => {
    apiFetch('/api/staff/residents', { token })
      .then((data) => {
        setResidents(data.residents);
        if (data.residents.length === 1) setResidentId(data.residents[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const selected = residents.find((r) => r.id === residentId);
  const residentName = selected ? `${selected.first_name} ${selected.last_name}` : '';

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    setSuccess(false);
    try {
      const form = new FormData();
      form.append('residentId', residentId);
      form.append('content', content);
      if (photo) form.append('photo', photo);

      await apiFetch('/api/updates', { token, method: 'POST', body: form, isFormData: true });
      setSuccess(true);
      setContent('');
      setPhoto(null);
      setPhotoPreview(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || t('postError'));
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <p className={`text-[15px] ${label}`}>{t('loading')}</p>;
  }

  return (
    <>
      {success ? (
        <div
          className={`mb-4 px-3.5 py-2.5 text-[14px] font-medium ${glassPanel(dark)}`}
          style={{ color: ACCENT }}
          role="status"
        >
          {t('postSuccess')}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resident" className={`block text-[14px] font-medium mb-1.5 ${label}`}>
            {t('selectResident')}
          </label>
          <div className={glassField(dark)}>
            <select
              id="resident"
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
              required
              className={`${inputClass} appearance-none`}
            >
              <option value="">—</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.first_name} {r.last_name}
                  {r.room_number ? ` (${t('roomLabel')} ${r.room_number})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="content" className={`block text-[14px] font-medium mb-1.5 ${label}`}>
            {t('newUpdate')}
          </label>
          <div className={glassField(dark)}>
            <textarea
              id="content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('updatePlaceholder', { name: residentName || '…' })}
              required
              className={`${inputClass} py-3 resize-none`}
            />
          </div>
        </div>

        <div>
          <label className={`block w-full min-h-[44px] ${glassField(dark)} cursor-pointer`}>
            <span
              className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-medium"
              style={{ color: ACCENT }}
            >
              {t('addPhoto')}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="sr-only"
            />
          </label>
          {photoPreview ? (
            <img src={photoPreview} alt="" className="mt-3 w-full rounded-xl max-h-48 object-cover" />
          ) : null}
        </div>

        {error ? (
          <p className="text-[15px] text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={posting || !residentId}
          className={`w-full ${btnAccentClass()}`}
          style={{ backgroundColor: ACCENT }}
        >
          {posting ? t('posting') : t('postUpdate')}
        </button>
      </form>
    </>
  );
}

export default function StaffPost({ user, token, onLogout }) {
  const { t } = useLanguage();

  return (
    <Layout user={user} onLogout={onLogout} title={t('staffPostTitle')}>
      <StaffPostForm user={user} token={token} />
    </Layout>
  );
}
