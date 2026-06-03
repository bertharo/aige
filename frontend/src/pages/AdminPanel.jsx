import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { apiFetch, photoUrl } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

async function fetchSilent(path, options) {
  try {
    return await apiFetch(path, options);
  } catch (err) {
    console.error(`[admin] ${path}`, err);
    return null;
  }
}

function DashboardEmpty({ t, onAddResident }) {
  return (
    <div className="py-16 px-4 text-center">
      <p className="text-lg text-kinness-text font-medium">{t('dashboardSettingUp')}</p>
      <p className="text-sm text-[#6B6B6B] mt-2">{t('dashboardEmptyHint')}</p>
      <button
        type="button"
        onClick={onAddResident}
        className="mt-8 min-h-[48px] px-8 bg-kinness-primary text-white text-base font-semibold rounded-xl"
      >
        {t('addResident')}
      </button>
    </div>
  );
}

export default function AdminPanel({ user, token, onLogout }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [residents, setResidents] = useState([]);
  const [familyLinks, setFamilyLinks] = useState([]);
  const [staffData, setStaffData] = useState({ staff: [], pendingInvites: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [residentForm, setResidentForm] = useState(null);
  const [familyEmail, setFamilyEmail] = useState({});
  const [familyRel, setFamilyRel] = useState({});
  const [staffEmail, setStaffEmail] = useState('');

  const loadDashboard = useCallback(async () => {
    const data = await fetchSilent('/api/admin/dashboard', { token });
    setDashboard(data?.dashboard ?? null);
  }, [token]);

  const loadResidents = useCallback(async () => {
    const data = await fetchSilent('/api/admin/residents', { token });
    setResidents(data?.residents ?? []);
  }, [token]);

  const loadFamilyLinks = useCallback(async () => {
    const data = await fetchSilent('/api/admin/family-links', { token });
    setFamilyLinks(data?.links ?? []);
  }, [token]);

  const loadStaff = useCallback(async () => {
    const data = await fetchSilent('/api/admin/staff', { token });
    setStaffData({
      staff: data?.staff ?? [],
      pendingInvites: data?.pendingInvites ?? [],
    });
  }, [token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadDashboard(), loadResidents(), loadFamilyLinks(), loadStaff()]);
    setLoading(false);
  }, [loadDashboard, loadResidents, loadFamilyLinks, loadStaff]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const goToAddResident = () => {
    setTab('residents');
    setResidentForm({});
  };

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
      console.error('[admin] save resident', err);
    }
  };

  const removeResident = async (id) => {
    if (!window.confirm(t('confirmRemove'))) return;
    try {
      await apiFetch(`/api/admin/residents/${id}`, { token, method: 'DELETE' });
      await loadAll();
    } catch (err) {
      console.error('[admin] remove resident', err);
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
      console.error('[admin] invite family', err);
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
      console.error('[admin] invite staff', err);
    }
  };

  const hasDashboardData = Boolean(dashboard?.facilityName);
  const showDashboardEmpty = !loading && tab === 'dashboard' && !hasDashboardData;

  return (
    <Layout user={user} onLogout={onLogout} title={t('adminTitle')}>
      <nav className="admin-tabs -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={tab === tb.id ? 'tab active' : 'tab'}
          >
            {tb.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {message && <p className="mb-3 text-kinness-primary text-base">{message}</p>}
        {loading && tab === 'dashboard' && (
          <p className="text-base text-kinness-text/70 py-8 text-center">{t('loading')}</p>
        )}

        {showDashboardEmpty && <DashboardEmpty t={t} onAddResident={goToAddResident} />}

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

        {tab === 'residents' && (
          <div>
            {loading && <p className="text-base text-kinness-text/70 mb-4">{t('loading')}</p>}
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

            {!loading && residents.length === 0 && (
              <p className="text-base text-kinness-text/70">{t('noResidents')}</p>
            )}
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
                  <button type="button" onClick={() => removeResident(r.id)} className="min-h-[44px] px-2 text-kinness-text/60 text-sm">{t('removeResident')}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'family' && (
          <div>
            {loading && <p className="text-base text-kinness-text/70 mb-4">{t('loading')}</p>}
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
          </div>
        )}

        {tab === 'staff' && (
          <div>
            {loading && <p className="text-base text-kinness-text/70 mb-4">{t('loading')}</p>}
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
            {!loading && staffData.staff.length === 0 && staffData.pendingInvites.length === 0 && (
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
      </div>
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
