import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiFetch } from '../../api/client';
import { useAdminDark } from './AdminShell';
import { ACCENT, glassField } from '../../theme';

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

export function mapApiToStaffList(staff = [], pendingInvites = []) {
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

function AddStaffRow({ email, setEmail, onAdd, dark, t, adding }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-2 max-w-[390px] mx-auto">
      <p className={`text-[14px] font-medium mb-1.5 ${dark ? 'text-white/50' : 'text-black/45'}`}>
        {t('addStaffEmail')}
      </p>
      <div className={`flex items-stretch overflow-hidden ${glassField(dark)}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          className={`flex-1 min-h-[46px] px-4 text-[16px] font-normal bg-transparent outline-none ${
            dark ? 'text-white placeholder:text-white/30' : 'text-[#0a0a0a] placeholder:text-black/30'
          }`}
        />
        <button
          type="submit"
          disabled={adding || !email.trim()}
          className="px-5 text-[15px] font-medium text-white disabled:opacity-40 min-w-[72px] transition-opacity"
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
        className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-colors ${
          dark ? 'hover:bg-white/[0.06]' : 'hover:bg-white/40'
        }`}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-medium shrink-0"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[17px] font-medium truncate ${dark ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}>
            {member.name}
            {member.pending && (
              <span className={`ml-2 text-[12px] font-normal ${dark ? 'text-white/40' : 'text-black/40'}`}>
                pending
              </span>
            )}
          </p>
          <p className={`text-[15px] font-normal truncate ${dark ? 'text-white/45' : 'text-black/45'}`}>
            {member.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(member.id)}
          aria-label="Remove"
          className={`opacity-0 group-hover:opacity-100 focus:opacity-100 w-9 h-9 rounded-full flex items-center justify-center text-[20px] leading-none transition-opacity duration-150 ${
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
    <div className="px-4 pt-1 pb-5 max-w-[390px] mx-auto">
      <p className={`text-[14px] font-medium mb-2 ${dark ? 'text-white/50' : 'text-black/45'}`}>
        {t('staffCount', { count: staff.length })}
      </p>
      {staff.length === 0 ? (
        <p className={`text-[16px] font-normal py-6 text-center ${dark ? 'text-white/40' : 'text-black/40'}`}>
          {t('noStaff')}
        </p>
      ) : (
        <ul>
          {staff.map((m) => (
            <StaffItem key={m.id} member={m} onRemove={onRemove} dark={dark} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StaffTabContent({ token, apiStaff, apiPending, onStaffMutated }) {
  const { t } = useLanguage();
  const dark = useAdminDark();
  const [email, setEmail] = useState('');
  const [staff, setStaff] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setStaff(mapApiToStaffList(apiStaff, apiPending));
  }, [apiStaff, apiPending]);

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

  return (
    <>
      <AddStaffRow email={email} setEmail={setEmail} onAdd={handleAdd} dark={dark} t={t} adding={adding} />
      <StaffList staff={staff} onRemove={handleRemove} dark={dark} t={t} />
    </>
  );
}
