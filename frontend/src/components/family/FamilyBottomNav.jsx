import React from 'react';
import { FAMILY_ACCENT, FAMILY_BORDER } from './familyTheme';

function IconFeed({ active }) {
  const c = active ? FAMILY_ACCENT : '#9B9BB0';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar({ active }) {
  const c = active ? FAMILY_ACCENT : '#9B9BB0';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function IconRecord({ active }) {
  const c = active ? FAMILY_ACCENT : '#9B9BB0';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function IconPhotos({ active }) {
  const c = active ? FAMILY_ACCENT : '#9B9BB0';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" fill={c} stroke="none" />
      <path d="M21 16l-5.5-5.5a1 1 0 00-1.4 0L7 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TABS = [
  { id: 'feed', label: 'Feed', Icon: IconFeed },
  { id: 'calendar', label: 'Calendar', Icon: IconCalendar },
  { id: 'record', label: 'Daily Record', Icon: IconRecord },
  { id: 'photos', label: 'Photos', Icon: IconPhotos },
];

export default function FamilyBottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t max-w-[390px] mx-auto"
      style={{ borderColor: FAMILY_BORDER, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
      aria-label="Family sections"
    >
      <div className="flex h-14">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative min-h-[44px]"
            >
              <Icon active={isActive} />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? FAMILY_ACCENT : '#9B9BB0' }}
              >
                {label}
              </span>
              {isActive ? (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: FAMILY_ACCENT }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
