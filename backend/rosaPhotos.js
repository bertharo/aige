/**
 * Rosa Haro demo imagery — one elderly woman across all posts (Eduardo Ramos series).
 * Premium Unsplash URLs are publicly hotlinkable; do not swap in unrelated stock portraits.
 */
const ROSA_PORTRAIT =
  'https://plus.unsplash.com/premium_photo-1759736277895-3660f626b408';
const ROSA_PROFILE =
  'https://plus.unsplash.com/premium_photo-1759736277962-beab931a0f77';
const ROSA_CLOSE =
  'https://plus.unsplash.com/premium_photo-1759736277883-2ab8e12e4dd8';

/** Resident avatar + feed header */
const ROSA_AVATAR = `${ROSA_PORTRAIT}?w=400&h=400&q=80&fit=crop&crop=faces`;

const CROPS = {
  patio: `${ROSA_PORTRAIT}?w=800&h=560&q=80&fit=crop&crop=faces`,
  garden: `${ROSA_PROFILE}?w=800&h=600&q=80&fit=crop`,
  lunch: `${ROSA_CLOSE}?w=800&h=540&q=80&fit=crop&crop=faces`,
  pt: `${ROSA_PORTRAIT}?w=800&h=640&q=80&fit=crop&fp-y=0.55`,
  reading: `${ROSA_CLOSE}?w=800&h=620&q=80&fit=crop`,
  music: `${ROSA_PORTRAIT}?w=800&q=80&fit=crop`,
  visit: `${ROSA_PROFILE}?w=800&h=580&q=80&fit=crop&crop=faces`,
  stretch: `${ROSA_PROFILE}?w=800&h=600&q=80&fit=crop`,
};

function rosaPhoto(key) {
  return CROPS[key] || CROPS.music;
}

module.exports = { ROSA_AVATAR, rosaPhoto, CROPS };
