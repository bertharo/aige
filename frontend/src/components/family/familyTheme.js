export const FAMILY_ACCENT = '#5B4FE8';
export const FAMILY_ACCENT_LIGHT = '#EEEDFE';
export const FAMILY_BG = '#F0EFFB';
export const FAMILY_BORDER = 'rgba(91, 79, 232, 0.08)';
export const FAMILY_BORDER_NAV = 'rgba(91, 79, 232, 0.10)';
export const FAMILY_TEXT = '#1A1835';
export const FAMILY_MUTED = '#6B6888';
export const FAMILY_WORDMARK = '#3C3489';
export const FAMILY_NOTE_BG = '#FAFAFE';
export const FAMILY_INACTIVE = '#9E9E9E';

export const FAMILY_FONT =
  '-apple-system, "SF Pro Rounded", system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const familyCardClass =
  'bg-white rounded-2xl border-[0.5px] border-[rgba(91,79,232,0.08)]';

export const familyCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  border: '0.5px solid rgba(91, 79, 232, 0.08)',
};

export function staffAvatarColor(name = '') {
  const palette = ['#5B4FE8', '#7C6CF0', '#9B8FF5', '#4A6CF7', '#6B5CE8'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
