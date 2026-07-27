import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import { FONT_STACK } from '../theme';

const VIEWS = [
  { role: 'admin', label: 'Admin' },
  { role: 'staff', label: 'Staff' },
  { role: 'family', label: 'Family' },
];

/**
 * Sticky banner for demo superusers — switches JWT + role home without re-login.
 */
export default function DemoViewSwitcher({ currentRole, token, onSwitch }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSwitch = async (role) => {
    if (role === currentRole || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/switch-view', {
        method: 'POST',
        token,
        body: { role },
      });
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || 'Could not switch view');
      }
      onSwitch(data.user, data.token, data.redirect);
    } catch (err) {
      setError(err.message || 'Could not switch view');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="sticky top-0 z-[95] border-b border-black/10"
      style={{ fontFamily: FONT_STACK, background: '#1a1a1a' }}
    >
      <div className="max-w-[390px] mx-auto px-3 py-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-white/70 shrink-0">Demo view</p>
          <div className="flex items-center gap-0.5 flex-1 justify-end">
            {VIEWS.map(({ role, label }) => {
              const active = currentRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSwitch(role)}
                  className={`h-8 min-w-[68px] px-2.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50 ${
                    active
                      ? 'bg-white text-[#0a0a0a]'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {error ? (
          <p className="text-[11px] text-red-300 text-center" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
