import React, { useState, useEffect, useCallback } from 'react';
import AdminShell, { useAdminDark } from '../components/admin/AdminShell';
import { ACCENT, glassField, glassPanel } from '../theme';
import StaffTabContent from '../components/admin/StaffTab';
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

function sec(dark) {
  return dark ? 'text-white/50' : 'text-black/45';
}

function body(dark) {
  return dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]';
}

function card(dark) {
  return glassPanel(dark);
}

function btnPrimary() {
  return 'min-h-[46px] px-5 text-[15px] font-medium text-white rounded-2xl disabled:opacity-40 w-full';
}

function GlassInput({ dark, className = '', ...props }) {
  return (
    <div className={glassField(dark)}>
      <input
        className={`w-full min-h-[44px] px-3 text-[16px] bg-transparent outline-none ${
          dark ? 'text-white placeholder:text-white/30' : 'text-[#0a0a0a] placeholder:text-black/30'
        } ${className}`}
        {...props}
      />
    </div>
  );
}

function DashboardEmpty({ t, onAddResident }) {
  const dark = useAdminDark();
  return (
    <div className="px-4 py-10 text-center">
      <p className={`text-[17px] font-medium ${body(dark)}`}>{t('dashboardSettingUp')}</p>
      <p className={`text-[15px] mt-2 ${sec(dark)}`}>{t('dashboardEmptyHint')}</p>
      <button
        type="button"
        onClick={onAddResident}
        className={`mt-6 ${btnPrimary()}`}
        style={{ backgroundColor: ACCENT }}
      >
        {t('addResident')}
      </button>
    </div>
  );
}

function Stat({ label, value, dark }) {
  return (
    <div className={`px-4 py-2.5 flex justify-between items-center ${card(dark)}`}>
      <span className={`text-[16px] font-normal ${body(dark)}`}>{label}</span>
      <span className="text-[26px] font-medium" style={{ color: ACCENT }}>
        {value}
      </span>
    </div>
  );
}

function AdminTabContent({
  token,
  tab,
  loading,
  message,
  dashboard,
  residents,
  familyLinks,
  staffData,
  showDashboardEmpty,
  goToAddResident,
  residentForm,
  setResidentForm,
  familyEmail,
  setFamilyEmail,
  familyRel,
  setFamilyRel,
  saveResident,
  removeResident,
  inviteFamily,
  loadStaff,
}) {
  const { t } = useLanguage();
  const dark = useAdminDark();

  if (tab === 'staff') {
    return (
      <StaffTabContent
        token={token}
        apiStaff={staffData.staff}
        apiPending={staffData.pendingInvites}
        onStaffMutated={loadStaff}
      />
    );
  }

  return (
    <div className="px-4 pt-2 pb-5">
      {message && (
        <p className="text-[15px] font-medium mb-2" style={{ color: ACCENT }}>
          {message}
        </p>
      )}

      {loading && tab === 'dashboard' && (
        <p className={`text-[16px] py-6 text-center ${sec(dark)}`}>{t('loading')}</p>
      )}

      {showDashboardEmpty && <DashboardEmpty t={t} onAddResident={goToAddResident} />}

      {!loading && tab === 'dashboard' && dashboard && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={goToAddResident}
            className={`text-[15px] font-medium mb-1 ${sec(dark)} hover:opacity-80`}
            style={{ color: ACCENT }}
          >
            {t('addResident')}
          </button>
          <div className={`px-4 py-3 ${card(dark)}`}>
            <p className={`text-[14px] font-medium ${sec(dark)}`}>{t('facility')}</p>
            <p className={`text-[20px] font-medium mt-0.5 ${body(dark)}`}>{dashboard.facilityName}</p>
            <p className={`text-[14px] font-medium mt-1 ${sec(dark)}`}>Code: {dashboard.facilityCode}</p>
          </div>
          <div className="space-y-2">
            <Stat label={t('residentsCount')} value={dashboard.residentCount} dark={dark} />
            <Stat label={t('familyLinked')} value={dashboard.familyCount} dark={dark} />
            <Stat label={t('updatesToday')} value={dashboard.updatesToday} dark={dark} />
          </div>
        </div>
      )}

      {tab === 'residents' && (
        <div>
          {loading && <p className={`text-[16px] mb-2 ${sec(dark)}`}>{t('loading')}</p>}
          <button
            type="button"
            onClick={() => setResidentForm({})}
            className={`mb-2 ${btnPrimary()}`}
            style={{ backgroundColor: ACCENT }}
          >
            {t('addResident')}
          </button>

          {residentForm && (
            <form onSubmit={saveResident} className={`mb-3 p-3 space-y-2 ${card(dark)}`}>
              <GlassInput dark={dark} name="firstName" placeholder={t('firstName')} required defaultValue={residentForm.first_name} />
              <GlassInput dark={dark} name="lastName" placeholder={t('lastName')} required defaultValue={residentForm.last_name} />
              <GlassInput dark={dark} name="roomNumber" placeholder={t('room')} defaultValue={residentForm.room_number} />
              <input type="file" name="photo" accept="image/*" className={`text-[15px] ${sec(dark)}`} />
              <div className="flex gap-2">
                <button type="submit" className={`flex-1 ${btnPrimary()}`} style={{ backgroundColor: ACCENT }}>
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setResidentForm(null)}
                  className={`min-h-[46px] px-4 text-[15px] font-medium rounded-2xl ${sec(dark)}`}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}

          {!loading && residents.length === 0 && (
            <p className={`text-[16px] ${sec(dark)}`}>{t('noResidents')}</p>
          )}
          <ul>
            {residents.map((r) => (
              <li
                key={r.id}
                className={`flex items-center gap-3 py-2 rounded-2xl ${dark ? 'hover:bg-white/5' : 'hover:bg-black/[0.03]'}`}
              >
                {r.photo_url ? (
                  <img src={photoUrl(r.photo_url)} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-medium shrink-0"
                    style={{ backgroundColor: '#E8E7FF', color: '#2D2A6E' }}
                  >
                    {r.first_name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-[17px] font-medium truncate ${body(dark)}`}>
                    {r.first_name} {r.last_name}
                  </p>
                  {r.room_number && (
                    <p className={`text-[15px] font-normal ${sec(dark)}`}>
                      {t('roomLabel')} {r.room_number}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setResidentForm(r)}
                  className="text-[14px] font-medium min-h-[40px] px-1"
                  style={{ color: ACCENT }}
                >
                  {t('editResident')}
                </button>
                <button
                  type="button"
                  onClick={() => removeResident(r.id)}
                  className={`text-[14px] font-medium min-h-[40px] px-1 ${sec(dark)}`}
                >
                  {t('removeResident')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'family' && (
        <div>
          {loading && <p className={`text-[16px] mb-2 ${sec(dark)}`}>{t('loading')}</p>}
          <ul className="space-y-2">
            {familyLinks.map((r) => (
              <li key={r.id} className={`px-4 py-3 ${card(dark)}`}>
                <p className={`text-[17px] font-medium mb-1.5 ${body(dark)}`}>
                  {r.first_name} {r.last_name}
                </p>
                {r.familyMembers?.length > 0 && (
                  <ul className="mb-2 space-y-1">
                    {r.familyMembers.map((m) => (
                      <li key={m.id} className={`text-[15px] font-normal ${sec(dark)}`}>
                        {m.name} ({m.email}) — {m.relationship}
                      </li>
                    ))}
                  </ul>
                )}
                {r.pendingInvites?.map((p, i) => (
                  <p key={i} className={`text-[14px] font-normal mb-2 ${sec(dark)}`}>
                    {t('pendingInvite')}: {p.email}
                  </p>
                ))}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className={`flex items-stretch overflow-hidden ${glassField(dark)}`}>
                    <input
                      type="email"
                      placeholder={t('email')}
                      value={familyEmail[r.id] || ''}
                      onChange={(e) => setFamilyEmail((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      className={`flex-1 min-h-[44px] px-3 text-[16px] bg-transparent outline-none ${
                        dark ? 'text-white placeholder:text-white/30' : 'text-[#0a0a0a] placeholder:text-black/30'
                      }`}
                    />
                  </div>
                  <GlassInput
                    dark={dark}
                    type="text"
                    placeholder={t('relationship')}
                    value={familyRel[r.id] || ''}
                    onChange={(e) => setFamilyRel((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => inviteFamily(r.id)}
                    className={btnPrimary()}
                    style={{ backgroundColor: ACCENT }}
                  >
                    {t('addFamilyEmail')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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

  const hasDashboardData = Boolean(dashboard?.facilityName);
  const showDashboardEmpty = !loading && tab === 'dashboard' && !hasDashboardData;

  return (
    <AdminShell
      onLogout={onLogout}
      tab={tab}
      setTab={setTab}
      tabs={tabs}
      pageTitle={t('adminTitle')}
    >
      <AdminTabContent
        token={token}
        tab={tab}
        loading={loading}
        message={message}
        dashboard={dashboard}
        residents={residents}
        familyLinks={familyLinks}
        staffData={staffData}
        showDashboardEmpty={showDashboardEmpty}
        goToAddResident={goToAddResident}
        residentForm={residentForm}
        setResidentForm={setResidentForm}
        familyEmail={familyEmail}
        setFamilyEmail={setFamilyEmail}
        familyRel={familyRel}
        setFamilyRel={setFamilyRel}
        saveResident={saveResident}
        removeResident={removeResident}
        inviteFamily={inviteFamily}
        loadStaff={loadStaff}
      />
    </AdminShell>
  );
}
