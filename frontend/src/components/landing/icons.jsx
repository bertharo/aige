/** Tabler-style inline icons — no external library */
export function IconCheck({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClock({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" />
    </svg>
  );
}

export function IconMicrophone({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 5a3 3 0 016 0v6a3 3 0 01-6 0V5z" />
      <path d="M5 10a7 7 0 0014 0M12 17v4M8 21h8" strokeLinecap="round" />
    </svg>
  );
}

export function IconSparkles({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinejoin="round" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClipboard({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  );
}

export function IconBell({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 5a2 2 0 114 0c0 3-2 4-2 8H8c0-4-2-5-2-8z" strokeLinejoin="round" />
      <path d="M9 17h6M10 20h4" strokeLinecap="round" />
    </svg>
  );
}

export function IconUsers({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-1a4 4 0 014-4h4a4 4 0 014 4v1" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-1a4 4 0 00-3-3.85" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M12 20.5l-1.2-1.1C6.4 15.4 3 12.3 3 8.5 3 5.9 5.1 4 7.5 4c1.5 0 2.9.7 3.8 1.8.9-1.1 2.3-1.8 3.8-1.8 2.4 0 4.5 1.9 4.5 4.5 0 3.8-3.4 6.9-7.8 10.9L12 20.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCalendar({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M4 11h16" strokeLinecap="round" />
    </svg>
  );
}
