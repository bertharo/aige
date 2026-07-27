import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import { FONT_STACK } from '../theme';

const VIEWS = [
  { role: 'admin', label: 'Admin' },
  { role: 'staff', label: 'Staff' },
  { role: 'family', label: 'Family' },
];

/**
 * Floating control for the demo superuser — switches JWT + role home without re-login.
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
      className="fixed top-[52px] left-1/2 z-[90] -translate-x-1/2 px-3 pointer-events-none"
      style={{ fontFamily: FONT_STACK }}
    >
      <div className="pointer-events-auto rounded-2xl border border-black/10 bg-[#1a1a1a]/92 backdrop-blur-xl shadow-lg px-2 py-1.5 flex flex-col items-center gap-1 min-w-[260px]">
        <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-medium px-1">
          Demo view
        </p>
        <div className="flex items-center gap-0.5 w-full">
          {VIEWS.map(({ role, label }) => {
            const active = currentRole === role;
            return (
              <button
                key={role}
                type="button"
                disabled={loading}
                onClick={() => handleSwitch(role)}
                className={`flex-1 h-8 rounded-xl text-[13px] font-medium transition-colors disabled:opacity-50 ${
                  active
                    ? 'bg-white text-[#0a0a0a]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {error ? (
          <p className="text-[11px] text-red-300 px-1 pb-0.5 text-center" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
