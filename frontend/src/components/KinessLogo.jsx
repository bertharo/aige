import React from 'react';

export default function KinessLogo({ size = 'md', variant = 'color', className = '' }) {
  const heights = { sm: 24, md: 32, lg: 48 };
  const h = heights[size] || heights.md;
  const w = h * 4;

  const heartColor = variant === 'white' ? '#FFFFFF' : '#5B4FE8';
  const textColor = variant === 'white' ? '#FFFFFF' : '#3C3489';

  return (
    <svg
      viewBox="0 0 160 40"
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="Kiness"
      className={className}
    >
      <path
        d="M8 20 C8 16, 12 13, 16 17 C20 13, 24 16, 24 20 C24 25, 16 30, 16 30 C16 30, 8 25, 8 20 Z"
        fill={heartColor}
        opacity="0.15"
      />
      <path
        d="M10 20 C10 17, 13 15, 16 18 C19 15, 22 17, 22 20 C22 24, 16 28, 16 28 C16 28, 10 24, 10 20 Z"
        fill={heartColor}
      />
      <text
        x="30"
        y="27"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="400"
        letterSpacing="0.5"
        fill={textColor}
      >
        Kiness
      </text>
    </svg>
  );
}
