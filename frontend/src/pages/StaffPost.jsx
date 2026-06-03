import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

export default function StaffPost({ user, token, onLogout }) {
  const { t } = useLanguage();
  const [residents, setResidents] = useState([]);
  const [residentId, setResidentId] = useState('');
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    return (
      <Layout user={user} onLogout={onLogout} title={t('staffPostTitle')}>
        <p className="text-base text-kinness-text/70">{t('loading')}</p>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} title={t('staffPostTitle')}>
      {success && (
        <div className="mb-4 p-4 bg-kinness-accent/50 border-2 border-kinness-primary rounded-xl text-kinness-primary text-base font-medium" role="status">
          {t('postSuccess')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="resident" className="block text-base font-medium text-kinness-text mb-2">
            {t('selectResident')}
          </label>
          <select
            id="resident"
            value={residentId}
            onChange={(e) => setResidentId(e.target.value)}
            required
            className="w-full min-h-[48px] px-4 text-base border-2 border-kinness-accent rounded-xl bg-white"
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

        <div>
          <label htmlFor="content" className="block text-base font-medium text-kinness-text mb-2">
            {t('newUpdate')}
          </label>
          <textarea
            id="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('updatePlaceholder', { name: residentName || '…' })}
            required
            className="w-full px-4 py-3 text-base border-2 border-kinness-accent rounded-xl focus:border-kinness-primary focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block w-full min-h-[48px]">
            <span className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-kinness-primary text-kinness-primary text-base font-medium rounded-xl cursor-pointer">
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
          {photoPreview && (
            <img src={photoPreview} alt="" className="mt-3 w-full rounded-xl max-h-48 object-cover" />
          )}
        </div>

        {error && <p className="text-red-600 text-base" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={posting || !residentId}
          className="w-full min-h-[52px] bg-kinness-primary text-white text-lg font-bold rounded-xl disabled:opacity-50"
        >
          {posting ? t('posting') : t('postUpdate')}
        </button>
      </form>
    </Layout>
  );
}
