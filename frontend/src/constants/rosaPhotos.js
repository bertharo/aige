/** Keep in sync with backend/rosaPhotos.js — one model for all Rosa demo imagery. */
const ROSA_PORTRAIT =
  'https://plus.unsplash.com/premium_photo-1759736277895-3660f626b408';
const ROSA_PROFILE =
  'https://plus.unsplash.com/premium_photo-1759736277962-beab931a0f77';
const ROSA_CLOSE =
  'https://plus.unsplash.com/premium_photo-1759736277883-2ab8e12e4dd8';

export const ROSA_AVATAR = `${ROSA_PORTRAIT}?w=400&h=400&q=80&fit=crop&crop=faces`;

export const ROSA_PHOTOS = {
  patio: `${ROSA_PORTRAIT}?w=800&h=560&q=80&fit=crop&crop=faces`,
  garden: `${ROSA_PROFILE}?w=800&h=600&q=80&fit=crop`,
  lunch: `${ROSA_CLOSE}?w=800&h=540&q=80&fit=crop&crop=faces`,
  pt: `${ROSA_PORTRAIT}?w=800&h=640&q=80&fit=crop&fp-y=0.55`,
};
