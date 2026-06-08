import React from 'react';

const MOMENTS = [
  { emoji: '🌸', label: 'Morning in the garden' },
  { emoji: '☕', label: 'Coffee on the patio' },
  { emoji: '🎵', label: 'Music Wednesday' },
  { emoji: '🌿', label: 'Afternoon walk' },
  { emoji: '📖', label: 'Reading in the sunroom' },
  { emoji: '🤝', label: "Jenny's visit" },
  { emoji: '💪', label: 'Physical therapy' },
  { emoji: '🌅', label: 'Sunrise morning' },
];

export function isLikelyBrokenPhotoUrl(url) {
  if (!url) return true;
  const lower = String(url).toLowerCase();
  if (lower.includes('/rosa/')) return false;
  return lower.includes('unsplash') || lower.includes('picsum');
}

export default function PhotoPlaceholder({ index = 0, height = 200, borderRadius = 12, className = '' }) {
  const moment = MOMENTS[index % MOMENTS.length];

  return (
    <div
      className={`photo-placeholder ${className}`.trim()}
      style={{
        height,
        borderRadius,
        background: 'linear-gradient(135deg, #EEEDFE, #E0DEFF, #EEEDFE)',
        backgroundSize: '200% 200%',
        animation: 'shimmerWarm 3s ease-in-out infinite alternate',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
      }}
    >
      <span style={{ fontSize: 28 }} aria-hidden>
        {moment.emoji}
      </span>
      <span
        style={{
          fontSize: 11,
          color: '#8B87CC',
          textAlign: 'center',
          maxWidth: 80,
          lineHeight: 1.4,
        }}
      >
        {moment.label}
      </span>
    </div>
  );
}
