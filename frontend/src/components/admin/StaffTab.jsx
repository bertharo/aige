import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiFetch } from '../../api/client';

const ACCENT = '#5A4FF7';

const AVATAR_PALETTES = [
  { bg: '#E8E7FF', text: '#2D2A6E' },
  { bg: '#D4F5E9', text: '#1A4D3A' },
  { bg: '#FFE8D1', text: '#5C3D1E' },
  { bg: '#FFD6E8', text: '#5C1A3A' },
  { bg: '#D6EEFF', text: '#1A3A5C' },
];

function parseNameFromEmail(email) {
  const local = email.split('@')[0] || '';
  return local
    .replace(/[._+-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || email;
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) || '?').toUpperCase();
}

function mapApiToStaffList(staff = [], pendingInvites = []) {
  const rows = staff.map((s, i) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    initials: getInitials(s.name),
    colorIndex: i % AVATAR_PALETTES.length,
    pending: false,
  }));
  pendingInvites.forEach((p, i) => {
    const email = p.email;
    const name = parseNameFromEmail(email);
    rows.push({
      id: `pending-${email}`,
      name,
      email,
      initials: getInitials(name),
      colorIndex: (staff.length + i) % AVATAR_PALETTES.length,
      pending: true,
    });
  });
  return rows;
}

function TopBar({ dark, onToggleTheme, onLogout, t, lang, setLang }) {
  return (
    <header
      className={`sticky top-0 z-50 border-b ${dark ? 'border-white/10 bg-[#1a1a1a]' : 'border-black/8 bg-white'}`}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-[390px] mx-auto">
        <span
          className="text-[17px] font-medium tracking-tight"
          style={{ color: dark ? '#fafafa' : '#0a0a0a', fontFamily: 'ui-rounded, system-ui, sans-serif' }}
        >
          Kinness
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`flex rounded-full p-0.5 text-[12px] font-medium ${dark ? 'bg-white/10' : 'bg-black/5'}`}
            role="group"
            aria-label={t('language')}
          >
            {['en', 'zh'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 rounded-full transition-colors duration-200 min-h-[32px] ${
                  lang === code
                    ? 'text-white'
                    : dark
                      ? 'text-white/50'
                      : 'text-black/45'
                }`}
                style={lang === code ? { backgroundColor: ACCENT } : undefined}
              >
                {code === 'en' ? 'EN' : '中文'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={dark ? 'Light mode' : 'Dark mode'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              dark ? 'bg-white/10 text-amber-300' : 'bg-black/5 text-[#1a1a1a]'
            }`}
          >
            <span className="text-lg leading-none transition-transform duration-300">{dark ? '☀️' : '🌙'}</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`text-[13px] font-medium min-h-[40px] px-1 ${dark ? 'text-white/70' : 'text-black/55'}`}
          >
            {t('signOut')}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavTabs({ tabs, active, onChange, dark }) {
  return (
    <nav
      className={`flex gap-1 overflow-x-auto px-4 py-2 max-w-[390px] mx-auto border-b ${
        dark ? 'border-white/10' : 'border-black/8'
      }`}
    >
      {tabs.map((tb) => {
        const isActive = active === tb.id;
        return (
          <button
            key={tb.id}
            type="button"
            onClick={() => onChange(tb.id)}
            className={`relative shrink-0 px-3 py-2 text-[13px] font-medium transition-colors rounded-full min-h-[36px] ${
              isActive
                ? 'text-white'
                : dark
                  ? 'text-white/50'
                  : 'text-black/45'
            }`}
            style={isActive ? { backgroundColor: ACCENT } : undefined}
          >
            {tb.label}
          </button>
        );
      })}
    </nav>
  );
}

function AddStaffRow({ email, setEmail, onAdd, dark, t, adding }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-4 max-w-[390px] mx-auto">
      <p className={`text-[13px] font-medium mb-2 ${dark ? 'text-white/50' : 'text-black/45'}`}>
        {t('addStaffEmail')}
      </p>
      <div
        className={`flex items-stretch rounded-2xl overflow-hidden border-2 ${
          dark ? 'border-white/15 bg-white/5' : 'border-black/10 bg-black/[0.02]'
        }`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          className={`flex-1 min-h-[48px] px-4 text-[15px] font-normal bg-transparent outline-none ${
            dark ? 'text-white placeholder:text-white/30' : 'text-[#0a0a0a] placeholder:text-black/30'
          }`}
          style={{ fontFamily: 'ui-rounded, system-ui, sans-serif' }}
        />
        <button
          type="submit"
          disabled={adding || !email.trim()}
          className="px-5 text-[14px] font-medium text-white disabled:opacity-40 min-w-[72px] transition-opacity"
          style={{ backgroundColor: ACCENT }}
        >
          {t('staffAdd')}
        </button>
      </div>
    </form>
  );
}

function StaffItem({ member, onRemove, dark }) {
  const palette = AVATAR_PALETTES[member.colorIndex % AVATAR_PALETTES.length];
  return (
    <li className="group relative">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
          dark ? 'hover:bg-white/5' : 'hover:bg-black/[0.03]'
        }`}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-medium shrink-0"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-medium truncate ${dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}>
            {member.name}
            {member.pending && (
              <span className={`ml-2 text-[11px] font-normal ${dark ? 'text-white/40' : 'text-black/40'}`}>
                pending
              </span>
            )}
          </p>
          <p className={`text-[13px] font-normal truncate ${dark ? 'text-white/45' : 'text-black/45'}`}>
            {member.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(member.id)}
          aria-label="Remove"
          className={`opacity-0 group-hover:opacity-100 focus:opacity-100 w-9 h-9 rounded-full flex items-center justify-center text-[18px] leading-none transition-opacity duration-150 ${
            dark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-black/40 hover:text-black hover:bg-black/5'
          }`}
        >
          ×
        </button>
      </div>
    </li>
  );
}

function StaffList({ staff, onRemove, dark, t }) {
  return (
    <div className="px-4 pt-2 pb-8 max-w-[390px] mx-auto">
      <p className={`text-[13px] font-medium mb-3 ${dark ? 'text-white/50' : 'text-black/45'}`}>
        {t('staffCount', { count: staff.length })}
      </p>
      {staff.length === 0 ? (
        <p className={`text-[15px] font-normal py-8 text-center ${dark ? 'text-white/40' : 'text-black/40'}`}>
          {t('noStaff')}
        </p>
      ) : (
        <ul className="space-y-1">
          {staff.map((m) => (
            <StaffItem key={m.id} member={m} onRemove={onRemove} dark={dark} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StaffTab({
  token,
  onLogout,
  tab,
  setTab,
  tabs,
  apiStaff,
  apiPending,
  onStaffMutated,
}) {
  const { t, lang, setLang } = useLanguage();
  const [dark, setDark] = useState(() => localStorage.getItem('kinness_theme') === 'dark');
  const [email, setEmail] = useState('');
  const [staff, setStaff] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('kinness_theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('staff-tab-dark', dark);
    return () => document.documentElement.classList.remove('staff-tab-dark');
  }, [dark]);

  useEffect(() => {
    setStaff(mapApiToStaffList(apiStaff, apiPending));
  }, [apiStaff, apiPending]);

  const toggleTheme = useCallback(() => setDark((d) => !d), []);

  const handleAdd = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    if (staff.some((s) => s.email.toLowerCase() === trimmed)) {
      setEmail('');
      return;
    }

    const name = parseNameFromEmail(trimmed);
    const optimistic = {
      id: `local-${Date.now()}`,
      name,
      email: trimmed,
      initials: getInitials(name),
      colorIndex: staff.length % AVATAR_PALETTES.length,
      pending: true,
    };

    setStaff((prev) => [...prev, optimistic]);
    setEmail('');
    setAdding(true);

    try {
      await apiFetch('/api/admin/invite-staff', {
        token,
        method: 'POST',
        body: { email: trimmed },
      });
      onStaffMutated?.();
    } catch (err) {
      console.error('[staff] invite', err);
      setStaff((prev) => prev.filter((s) => s.id !== optimistic.id));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const pageTitle = useMemo(() => t('adminTitle'), [t]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#1a1a1a]' : 'bg-white'}`}
      style={{ fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif' }}
    >
      <TopBar dark={dark} onToggleTheme={toggleTheme} onLogout={onLogout} t={t} lang={lang} setLang={setLang} />
      <div className={`px-4 pt-3 pb-1 max-w-[390px] mx-auto ${dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}>
        <h1 className="text-[20px] font-medium tracking-tight">{pageTitle}</h1>
      </div>
      <NavTabs tabs={tabs} active={tab} onChange={setTab} dark={dark} />
      <AddStaffRow email={email} setEmail={setEmail} onAdd={handleAdd} dark={dark} t={t} adding={adding} />
      <StaffList staff={staff} onRemove={handleRemove} dark={dark} t={t} />
    </div>
  );
}
