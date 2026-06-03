import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { apiFetch, photoUrl } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

export default function AdminPanel({ user, token, onLogout }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [residents, setResidents] = useState([]);
  const [familyLinks, setFamilyLinks] = useState([]);
  const [staffData, setStaffData] = useState({ staff: [], pendingInvites: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [residentForm, setResidentForm] = useState(null);
  const [familyEmail, setFamilyEmail] = useState({});
  const [familyRel, setFamilyRel] = useState({});
  const [staffEmail, setStaffEmail] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, res, links, staff] = await Promise.all([
        apiFetch('/api/admin/dashboard', { token }),
        apiFetch('/api/admin/residents', { token }),
        apiFetch('/api/admin/family-links', { token }),
        apiFetch('/api/admin/staff', { token }),
      ]);
      setDashboard(dash.dashboard);
      setResidents(res.residents);
      setFamilyLinks(links.links);
      setStaffData(staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const tabs = [
    { id: 'dashboard', label: t('dashboard') },
    { id: 'residents', label: t('residents') },
    { id: 'family', label: t('familyLinks') },
    { id: 'staff', label: t('staff') },
  ];

  const saveResident = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const isEdit = residentForm?.id;
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/residents/${residentForm.id}`, {
          token,
          method: 'PUT',
          body: form,
          isFormData: true,
        });
      } else {
        await apiFetch('/api/admin/residents', {
          token,
          method: 'POST',
          body: form,
          isFormData: true,
        });
      }
      setResidentForm(null);
      setMessage(isEdit ? 'Saved' : t('addResident'));
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeResident = async (id) => {
    if (!window.confirm(t('confirmRemove'))) return;
    try {
      await apiFetch(`/api/admin/residents/${id}`, { token, method: 'DELETE' });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const inviteFamily = async (residentId) => {
    const email = familyEmail[residentId];
    if (!email) return;
    try {
      await apiFetch('/api/admin/invite-family', {
        token,
        method: 'POST',
        body: { email, residentId, relationship: familyRel[residentId] || 'Family' },
      });
      setMessage(t('inviteSent'));
      setFamilyEmail((p) => ({ ...p, [residentId]: '' }));
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const inviteStaff = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/invite-staff', {
        token,
        method: 'POST',
        body: { email: staffEmail },
      });
      setMessage(t('inviteSent'));
      setStaffEmail('');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} title={t('adminTitle')}>
      <nav className="flex gap-1 overflow-x-auto mb-4 -mx-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={`min-h-[44px] px-3 text-sm font-medium rounded-lg whitespace-nowrap ${
              tab === tb.id ? 'bg-kinness-primary text-white' : 'bg-kinness-accent/40 text-kinness-text'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </nav>

      {message && <p className="mb-3 text-kinness-primary text-base">{message}</p>}
      {error && <p className="mb-3 text-red-600 text-base" role="alert">{error}</p>}
      {loading && <p className="text-base">{t('loading')}</p>}

      {!loading && tab === 'dashboard' && dashboard && (
        <div className="space-y-3">
          <div className="p-4 bg-kinness-accent/30 rounded-xl">
            <p className="text-sm text-kinness-text/70">{t('facility')}</p>
            <p className="text-xl font-semibold text-kinness-text">{dashboard.facilityName}</p>
            <p className="text-sm text-kinness-text/70 mt-1">Code: {dashboard.facilityCode}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Stat label={t('residentsCount')} value={dashboard.residentCount} />
            <Stat label={t('familyLinked')} value={dashboard.familyCount} />
            <Stat label={t('updatesToday')} value={dashboard.updatesToday} />
          </div>
        </div>
      )}

      {!loading && tab === 'residents' && (
        <div>
          <button
            type="button"
            onClick={() => setResidentForm({})}
            className="mb-4 w-full min-h-[48px] bg-kinness-primary text-white font-semibold rounded-xl"
          >
            {t('addResident')}
          </button>

          {residentForm && (
            <form onSubmit={saveResident} className="mb-6 p-4 border-2 border-kinness-accent rounded-xl space-y-3">
              <input name="firstName" placeholder={t('firstName')} required defaultValue={residentForm.first_name} className="w-full min-h-[44px] px-3 border rounded-lg text-base" />
              <input name="lastName" placeholder={t('lastName')} required defaultValue={residentForm.last_name} className="w-full min-h-[44px] px-3 border rounded-lg text-base" />
              <input name="roomNumber" placeholder={t('room')} defaultValue={residentForm.room_number} className="w-full min-h-[44px] px-3 border rounded-lg text-base" />
              <input type="file" name="photo" accept="image/*" className="text-base" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 min-h-[44px] bg-kinness-primary text-white rounded-lg">{t('save')}</button>
                <button type="button" onClick={() => setResidentForm(null)} className="min-h-[44px] px-4">{t('cancel')}</button>
              </div>
            </form>
          )}

          {residents.length === 0 && <p className="text-base text-kinness-text/70">{t('noResidents')}</p>}
          <ul className="space-y-3">
            {residents.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-3 border border-kinness-accent/60 rounded-xl">
                {r.photo_url ? (
                  <img src={photoUrl(r.photo_url)} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-kinness-accent flex items-center justify-center font-semibold text-kinness-primary">
                    {r.first_name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base">{r.first_name} {r.last_name}</p>
                  {r.room_number && <p className="text-sm text-kinness-text/70">{t('roomLabel')} {r.room_number}</p>}
                </div>
                <button type="button" onClick={() => setResidentForm(r)} className="min-h-[44px] px-2 text-kinness-primary text-sm">{t('editResident')}</button>
                <button type="button" onClick={() => removeResident(r.id)} className="min-h-[44px] px-2 text-red-600 text-sm">{t('removeResident')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && tab === 'family' && (
        <ul className="space-y-6">
          {familyLinks.map((r) => (
            <li key={r.id} className="border border-kinness-accent/60 rounded-xl p-4">
              <p className="font-semibold text-base mb-2">{r.first_name} {r.last_name}</p>
              {r.familyMembers?.length > 0 && (
                <ul className="mb-3 text-sm space-y-1">
                  {r.familyMembers.map((m) => (
                    <li key={m.id} className="text-kinness-text/80">
                      {m.name} ({m.email}) — {m.relationship}
                    </li>
                  ))}
                </ul>
              )}
              {r.pendingInvites?.map((p, i) => (
                <p key={i} className="text-sm text-kinness-text/60">{t('pendingInvite')}: {p.email}</p>
              ))}
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="email"
                  placeholder={t('email')}
                  value={familyEmail[r.id] || ''}
                  onChange={(e) => setFamilyEmail((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  className="min-h-[44px] px-3 border rounded-lg text-base"
                />
                <input
                  type="text"
                  placeholder={t('relationship')}
                  value={familyRel[r.id] || ''}
                  onChange={(e) => setFamilyRel((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  className="min-h-[44px] px-3 border rounded-lg text-base"
                />
                <button
                  type="button"
                  onClick={() => inviteFamily(r.id)}
                  className="min-h-[44px] bg-kinness-primary text-white rounded-lg text-base"
                >
                  {t('addFamilyEmail')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && tab === 'staff' && (
        <div>
          <form onSubmit={inviteStaff} className="mb-6 flex flex-col gap-2">
            <input
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder={t('email')}
              required
              className="min-h-[48px] px-4 border-2 border-kinness-accent rounded-xl text-base"
            />
            <button type="submit" className="min-h-[48px] bg-kinness-primary text-white font-semibold rounded-xl">
              {t('addStaffEmail')}
            </button>
          </form>
          {staffData.staff.length === 0 && staffData.pendingInvites.length === 0 && (
            <p className="text-base text-kinness-text/70">{t('noStaff')}</p>
          )}
          <ul className="space-y-2">
            {staffData.staff.map((s) => (
              <li key={s.id} className="p-3 border rounded-xl text-base">
                {s.name} — {s.email}
              </li>
            ))}
            {staffData.pendingInvites.map((p, i) => (
              <li key={i} className="p-3 border border-dashed rounded-xl text-sm text-kinness-text/70">
                {t('pendingInvite')}: {p.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 bg-white border border-kinness-accent/60 rounded-xl flex justify-between items-center">
      <span className="text-base text-kinness-text">{label}</span>
      <span className="text-2xl font-bold text-kinness-primary">{value}</span>
    </div>
  );
}
