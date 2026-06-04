export const ACCENT = '#5A4FF7';
export const ACCENT_SOFT = 'rgba(90, 79, 247, 0.35)';

export const FONT_STACK = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';

/** Frosted glass panel */
export function glassPanel(dark) {
  return dark
    ? 'rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl backdrop-saturate-150'
    : 'rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl backdrop-saturate-150';
}

/** Compact primary CTA */
export function btnAccentClass() {
  return 'h-10 px-4 text-[14px] font-medium text-white rounded-xl disabled:opacity-40';
}

/** Uniform dashboard / list row */
export const CARD_INNER = 'px-3.5 py-2.5 min-h-[44px]';

/** Sticky header / nav chrome */
export function glassBar(dark) {
  return dark
    ? 'border-white/[0.08] bg-[#141414]/75 backdrop-blur-2xl backdrop-saturate-150'
    : 'border-black/[0.05] bg-white/60 backdrop-blur-2xl backdrop-saturate-150';
}

/** Inputs and unified add rows */
export function glassField(dark) {
  return dark
    ? 'rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-lg'
    : 'rounded-xl border border-white/80 bg-white/35 backdrop-blur-lg';
}

export function pageBg(dark) {
  return dark ? 'bg-[#121212]' : 'bg-[#f4f3ff]';
}
