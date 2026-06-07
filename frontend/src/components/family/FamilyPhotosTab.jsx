import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PHOTO_TIMELINE, RESIDENT_NAME } from './familyPlaceholderData';
import { FAMILY_ACCENT, FAMILY_MUTED } from './familyTheme';

function photoUrl(seed) {
  return `https://picsum.photos/seed/${seed}/400/400`;
}

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  const touchStartX = useRef(0);
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, onNavigate]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) onNavigate(dx > 0 ? -1 : 1);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white text-xl font-normal"
        aria-label="Close"
      >
        ×
      </button>
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={photoUrl(photo.seed)}
          alt={photo.caption}
          className="max-w-full max-h-[60vh] object-contain rounded-lg"
        />
      </div>
      <div className="p-5 text-center text-white" onClick={(e) => e.stopPropagation()}>
        <p className="text-[15px] font-medium">{photo.caption}</p>
        <p className="text-[12px] font-normal mt-1 text-white/60">
          {formatDate(photo.date)} · {photo.staff}
        </p>
      </div>
    </div>
  );
}

export default function FamilyPhotosTab() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const photos = PHOTO_TIMELINE;

  const grouped = photos.reduce((acc, p) => {
    if (!acc[p.monthLabel]) acc[p.monthLabel] = [];
    acc[p.monthLabel].push(p);
    return acc;
  }, {});

  const navigate = useCallback(
    (dir) => {
      setLightboxIndex((i) => {
        if (i === null) return null;
        const next = i + dir;
        if (next < 0) return photos.length - 1;
        if (next >= photos.length) return 0;
        return next;
      });
    },
    [photos.length]
  );

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={FAMILY_ACCENT} strokeWidth="1.5" aria-hidden>
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="text-[16px] font-medium mt-4" style={{ color: FAMILY_ACCENT }}>
          No photos yet
        </p>
        <p className="text-[14px] font-normal mt-1" style={{ color: FAMILY_MUTED }}>
          The care team will share photos here when they capture a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[13px] font-normal" style={{ color: FAMILY_MUTED }}>
        {RESIDENT_NAME}&apos;s moments
      </p>

      {Object.entries(grouped).map(([month, items]) => (
        <section key={month}>
          <h3 className="text-[12px] font-medium mb-2" style={{ color: FAMILY_MUTED }}>
            {month}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {items.map((photo) => {
              const globalIndex = photos.findIndex((p) => p.id === photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(globalIndex)}
                  className="aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#5B4FE8] focus:ring-offset-1"
                >
                  <img
                    src={photoUrl(photo.seed)}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {lightboxIndex !== null ? (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={navigate}
        />
      ) : null}
    </div>
  );
}
