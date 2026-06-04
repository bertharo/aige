import React from 'react';
import { ACCENT_SOFT, pageBg } from '../theme';

export default function GlassBackground({ dark, children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-x-hidden ${pageBg(dark)} ${className}`}>
      <div className="pointer-events-none fixed inset-0 max-w-[390px] mx-auto" aria-hidden>
        <div
          className="absolute -top-20 right-0 w-56 h-56 rounded-full opacity-60"
          style={{ background: ACCENT_SOFT, filter: 'blur(48px)' }}
        />
        <div
          className="absolute top-1/3 -left-16 w-48 h-48 rounded-full opacity-40"
          style={{ background: dark ? 'rgba(255,255,255,0.06)' : ACCENT_SOFT, filter: 'blur(40px)' }}
        />
        <div
          className="absolute bottom-24 right-8 w-40 h-40 rounded-full opacity-50"
          style={{ background: ACCENT_SOFT, filter: 'blur(56px)' }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
