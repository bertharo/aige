export default function HeroMockup() {
  return (
    <div
      className="hero-mockup-enter mx-auto w-[280px] max-w-full hidden min-[380px]:block"
      aria-hidden
    >
      <div
        className="relative overflow-hidden bg-white rounded-[36px] border-[1.5px] border-[#EEEDFE]"
        style={{
          width: 280,
          height: 520,
          boxShadow: '0 24px 64px rgba(91, 79, 232, 0.12)',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2 px-3">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#5B4FE8] shrink-0"
            aria-hidden
          />
          <span className="text-[12px] font-medium text-[#3C3489]">Kiness</span>
        </div>

        {/* Feed */}
        <div className="px-3 pb-0 flex flex-col gap-2 overflow-hidden" style={{ height: 460 }}>
          {/* Card 1 */}
          <article className="hero-mockup-card hero-mockup-card-1 bg-white border border-[#EEEDFE] rounded-xl p-3 -mt-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                style={{ background: '#EEEDFE', color: '#5B4FE8' }}
              >
                EH
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a18] leading-tight">Eleanor H.</p>
                <p className="text-[11px] text-[#6B6B68] leading-tight">Today, 2:14 PM</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {[
                { icon: '🍽', label: 'Lunch — ate well' },
                { icon: '😊', label: 'Mood — good' },
                { icon: '🚶', label: 'Garden walk' },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#F7F7F6] text-[10px] text-[#1a1a18]/80 whitespace-nowrap"
                >
                  <span aria-hidden>{icon}</span>
                  {label}
                </span>
              ))}
            </div>

            <div className="w-full h-20 rounded-lg bg-[#EEEDFE] flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="10" r="4" fill="#AFA9EC" />
                <path
                  d="M8 18c1.5-2 3-3 4-3s2.5 1 4 3"
                  stroke="#AFA9EC"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M6 14c-1-1.5-1.5-3-1-4.5S6.5 7 8 7"
                  stroke="#AFA9EC"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 14c1-1.5 1.5-3 1-4.5S17.5 7 16 7"
                  stroke="#AFA9EC"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex items-center gap-1">
              <span className="hero-mockup-heart-pulse inline-flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#5B4FE8" aria-hidden>
                  <path d="M12 20.5l-1.2-1.1C6.4 15.4 3 12.3 3 8.5 3 5.9 5.1 4 7.5 4c1.5 0 2.9.7 3.8 1.8.9-1.1 2.3-1.8 3.8-1.8 2.4 0 4.5 1.9 4.5 4.5 0 3.8-3.4 6.9-7.8 10.9L12 20.5z" />
                </svg>
              </span>
              <span className="text-[11px] font-medium text-[#6B6B68]">3</span>
            </div>
          </article>

          {/* Card 2 */}
          <article className="hero-mockup-card hero-mockup-card-2 bg-white border border-[#EEEDFE] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                style={{ background: '#E1F5EE', color: '#0F6E56' }}
              >
                ML
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a18] leading-tight">Margaret L.</p>
                <p className="text-[11px] text-[#6B6B68] leading-tight">Today, 11:30 AM</p>
              </div>
            </div>

            <p className="text-[12px] italic text-[#6B6B68] leading-snug mb-2">
              Joined morning music session. Was singing along.
            </p>

            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4C4C0" strokeWidth="1.5" aria-hidden>
                <path
                  d="M12 20.5l-1.2-1.1C6.4 15.4 3 12.3 3 8.5 3 5.9 5.1 4 7.5 4c1.5 0 2.9.7 3.8 1.8.9-1.1 2.3-1.8 3.8-1.8 2.4 0 4.5 1.9 4.5 4.5 0 3.8-3.4 6.9-7.8 10.9L12 20.5z"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </article>

          {/* Card 3 — cropped */}
          <article className="hero-mockup-card hero-mockup-card-3 bg-white border border-[#EEEDFE] rounded-xl p-3 mb-0">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                style={{ background: '#FAEEDA', color: '#854F0B' }}
              >
                RJ
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a18] leading-tight">Robert J.</p>
                <p className="text-[11px] text-[#6B6B68] leading-tight">Today, 9:00 AM</p>
              </div>
            </div>
          </article>
        </div>

        {/* Bottom scroll fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-[36px]"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
