import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAdminDark } from '../components/admin/AdminShell';
import { apiFetch } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT, btnAccentClass, glassField, glassPanel } from '../theme';
import VoiceCaptureButton from '../components/staff/VoiceCaptureButton';
import VoiceReviewModal from '../components/staff/VoiceReviewModal';

const MEAL_OPTIONS = [
  { value: 'ate_well', label: 'Ate well' },
  { value: 'partial', label: 'Partial' },
  { value: 'skipped', label: 'Skipped' },
];

const HYDRATION_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'low', label: 'Low' },
];

const MOOD_OPTIONS = [
  { value: 'good', emoji: '😊' },
  { value: 'okay', emoji: '😐' },
  { value: 'low', emoji: '😔' },
  { value: 'tired', emoji: '😴' },
];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ToggleGroup({ options, value, onChange, renderLabel }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors"
            style={
              selected
                ? { backgroundColor: ACCENT, color: '#fff', borderColor: ACCENT }
                : { borderColor: 'rgba(0,0,0,0.12)', color: 'inherit' }
            }
          >
            {renderLabel ? renderLabel(opt) : opt.label}
          </button>
        );
      })}
    </div>
  );
}

function DailyRecordSection({ residentId, token, dark }) {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [hydration, setHydration] = useState('');
  const [moodMorning, setMoodMorning] = useState('');
  const [moodEvening, setMoodEvening] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const label = dark ? 'text-white/70' : 'text-black/55';

  useEffect(() => {
    if (!residentId) return;
    apiFetch('/api/staff/today-activities', { token })
      .then((data) => {
        const list = data.activities || [];
        setActivities(list);
        setSelectedActivities(list.map((a) => a.title));
      })
      .catch(() => {
        setActivities([]);
        setSelectedActivities([]);
      });
  }, [residentId, token]);

  const toggleActivity = (title) => {
    setSelectedActivities((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await apiFetch('/api/staff/daily-record', {
        token,
        method: 'POST',
        body: {
          resident_id: residentId,
          record_date: todayKey(),
          breakfast: breakfast || undefined,
          lunch: lunch || undefined,
          dinner: dinner || undefined,
          hydration: hydration || undefined,
          mood_morning: moodMorning || undefined,
          mood_evening: moodEvening || undefined,
          activities_attended: selectedActivities,
        },
      });
      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!residentId) return null;

  return (
    <div className={`${glassPanel(dark)} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3.5 py-3 text-left"
      >
        <span className="text-[15px] font-medium">Log today&apos;s record</span>
        <span className="text-[18px]" style={{ color: ACCENT }}>
          {open ? '−' : '+'}
        </span>
      </button>

      {open ? (
        <div className="px-3.5 pb-4 space-y-4 border-t border-black/5">
          <div>
            <p className={`text-[13px] font-medium mb-2 ${label}`}>Meals</p>
            {[
              { key: 'breakfast', value: breakfast, set: setBreakfast, label: 'Breakfast' },
              { key: 'lunch', value: lunch, set: setLunch, label: 'Lunch' },
              { key: 'dinner', value: dinner, set: setDinner, label: 'Dinner' },
            ].map((meal) => (
              <div key={meal.key} className="mb-3">
                <p className={`text-[12px] mb-1.5 ${label}`}>{meal.label}</p>
                <ToggleGroup options={MEAL_OPTIONS} value={meal.value} onChange={meal.set} />
              </div>
            ))}
          </div>

          <div>
            <p className={`text-[13px] font-medium mb-2 ${label}`}>Hydration</p>
            <ToggleGroup options={HYDRATION_OPTIONS} value={hydration} onChange={setHydration} />
          </div>

          <div>
            <p className={`text-[13px] font-medium mb-2 ${label}`}>Mood</p>
            <p className={`text-[12px] mb-1.5 ${label}`}>Morning</p>
            <ToggleGroup
              options={MOOD_OPTIONS}
              value={moodMorning}
              onChange={setMoodMorning}
              renderLabel={(opt) => opt.emoji}
            />
            <p className={`text-[12px] mb-1.5 mt-3 ${label}`}>Evening</p>
            <ToggleGroup
              options={MOOD_OPTIONS}
              value={moodEvening}
              onChange={setMoodEvening}
              renderLabel={(opt) => opt.emoji}
            />
          </div>

          {activities.length > 0 ? (
            <div>
              <p className={`text-[13px] font-medium mb-2 ${label}`}>Activities today</p>
              <ul className="space-y-2">
                {activities.map((a) => (
                  <li key={a.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(a.title)}
                        onChange={() => toggleActivity(a.title)}
                        className="rounded"
                        style={{ accentColor: ACCENT }}
                      />
                      <span className="text-[14px]">
                        {a.title}
                        <span className={`ml-1 text-[12px] ${label}`}>{a.start_time}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {saved ? (
            <p className="text-[14px] font-medium" style={{ color: ACCENT }}>
              Record saved ✓
            </p>
          ) : null}
          {error ? (
            <p className="text-[14px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`w-full ${btnAccentClass()}`}
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? 'Saving…' : 'Save record'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

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
  const [showTypedForm, setShowTypedForm] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const label = dark ? 'text-white/70' : 'text-black/55';
  const inputClass = `w-full min-h-[44px] px-3.5 text-[15px] outline-none bg-transparent ${dark ? 'text-white' : 'text-[#0a0a0a]'}`;

  const voiceLabels = {
    holdToTalk: t('voiceHoldToTalk'),
    release: t('voiceRelease'),
    processing: t('voiceProcessing'),
    selectFirst: t('voiceSelectFirst'),
    hint: t('voiceHint'),
  };

  const reviewLabels = {
    title: t('voiceReviewTitle'),
    subtitle: t('voiceReviewSubtitle'),
    transcript: t('voiceTranscript'),
    careNote: t('voiceCareNote'),
    familyUpdate: t('voiceFamilyUpdate'),
    approve: t('voiceApprove'),
    approving: t('voiceApproving'),
    cancel: t('voiceCancel'),
    parseFailed: t('voiceParseFailed'),
  };

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

  const handleRecordingComplete = useCallback(
    async (blob, mimeType) => {
      if (!residentId) return;
      setVoiceProcessing(true);
      setError('');
      try {
        const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a' : 'webm';
        const form = new FormData();
        form.append('residentId', residentId);
        form.append('audio', blob, `recording.${ext}`);
        const data = await apiFetch('/api/staff/voice/draft', {
          token,
          method: 'POST',
          body: form,
          isFormData: true,
        });
        setVoiceDraft(data);
        setReviewOpen(true);
      } catch (err) {
        setError(err.message || t('postError'));
      } finally {
        setVoiceProcessing(false);
      }
    },
    [residentId, token, t]
  );

  const handleVoiceApprove = async ({ careNote, familyUpdate, transcript, audioUrl }) => {
    setApproving(true);
    setError('');
    try {
      await apiFetch('/api/staff/voice/approve', {
        token,
        method: 'POST',
        body: {
          residentId,
          careNote,
          familyUpdate,
          transcript,
          audioUrl,
        },
      });
      setReviewOpen(false);
      setVoiceDraft(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || t('postError'));
    } finally {
      setApproving(false);
    }
  };

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

      <div className="space-y-4">
        <div>
          <label htmlFor="resident" className={`block text-[14px] font-medium mb-1.5 ${label}`}>
            {t('selectResident')}
          </label>
          <div className={glassField(dark)}>
            <select
              id="resident"
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
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

        {residentId ? (
          <>
            <div className={`${glassPanel(dark)} py-4`}>
              <VoiceCaptureButton
                disabled={!residentId}
                processing={voiceProcessing}
                onRecordingComplete={handleRecordingComplete}
                onError={(msg) => setError(msg)}
                labels={voiceLabels}
              />
            </div>

            {residentId ? <DailyRecordSection residentId={residentId} token={token} dark={dark} /> : null}

            <button
              type="button"
              onClick={() => setShowTypedForm((v) => !v)}
              className="w-full text-[14px] font-medium py-2"
              style={{ color: ACCENT }}
            >
              {showTypedForm ? '−' : '+'} {t('typeInstead')}
            </button>

            {showTypedForm ? (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-black/5">
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

                <button
                  type="submit"
                  disabled={posting || !residentId}
                  className={`w-full ${btnAccentClass()}`}
                  style={{ backgroundColor: ACCENT }}
                >
                  {posting ? t('posting') : t('postUpdate')}
                </button>
              </form>
            ) : null}
          </>
        ) : null}

        {error ? (
          <p className="text-[15px] text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <VoiceReviewModal
        open={reviewOpen}
        draft={voiceDraft}
        dark={dark}
        labels={reviewLabels}
        approving={approving}
        onClose={() => {
          if (!approving) {
            setReviewOpen(false);
            setVoiceDraft(null);
          }
        }}
        onApprove={handleVoiceApprove}
      />
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
