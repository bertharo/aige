import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { FAMILY_ACCENT, FAMILY_BORDER_NAV, FAMILY_INACTIVE } from './familyTheme';

function IconFeed({ active }) {
  const c = active ? FAMILY_ACCENT : FAMILY_INACTIVE;
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c} aria-hidden>
        <rect x="3" y="5" width="18" height="3" rx="1" />
        <rect x="3" y="10.5" width="18" height="3" rx="1" />
        <rect x="3" y="16" width="12" height="3" rx="1" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar({ active }) {
  const c = active ? FAMILY_ACCENT : FAMILY_INACTIVE;
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c} aria-hidden>
        <path d="M7 2v3M17 2v3M3 8h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        <rect x="3" y="8" width="18" height="13" rx="2" fill={c} />
        <path d="M3 11h18" stroke="#fff" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function IconRecord({ active }) {
  const c = active ? FAMILY_ACCENT : FAMILY_INACTIVE;
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c} aria-hidden>
        <path d="M8 4H6a2 2 0 00-2 2v14h16V6a2 2 0 00-2-2h-2" />
        <rect x="8" y="2" width="8" height="5" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function IconPhotos({ active }) {
  const c = active ? FAMILY_ACCENT : FAMILY_INACTIVE;
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c} aria-hidden>
        <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <circle cx="8.5" cy="9.5" r="1.5" fill="#fff" />
        <path d="M20 17l-5-5-4 4-2-2-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" fill={c} stroke="none" />
      <path d="M21 16l-5.5-5.5a1 1 0 00-1.4 0L7 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TABS = [
  { id: 'feed', labelKey: 'tabFeed', fallback: 'Feed', Icon: IconFeed },
  { id: 'record', labelKey: 'tabRecord', fallback: 'Record', Icon: IconRecord },
  { id: 'calendar', labelKey: 'tabCalendar', fallback: 'Calendar', Icon: IconCalendar },
  { id: 'photos', labelKey: 'tabPhotos', fallback: 'Photos', Icon: IconPhotos },
];

export default function FamilyBottomNav({ active, onChange }) {
  const { t } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white max-w-[390px] mx-auto"
      style={{
        borderTop: `0.5px solid ${FAMILY_BORDER_NAV}`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="tablist"
      aria-label="Family sections"
    >
      <div className="flex" style={{ height: '64px' }}>
        {TABS.map(({ id, labelKey, fallback, Icon }) => {
          const isActive = active === id;
          const label = t(labelKey) !== labelKey ? t(labelKey) : fallback;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {isActive ? (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-sm"
                  style={{ backgroundColor: FAMILY_ACCENT }}
                />
              ) : null}
              <Icon active={isActive} />
              <span
                className="text-[11px]"
                style={{
                  color: isActive ? FAMILY_ACCENT : FAMILY_INACTIVE,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
