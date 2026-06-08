import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch, photoUrl } from '../../api/client';
import { useFamily } from './FamilyContext';
import PhotoWithFallback from '../PhotoWithFallback';
import { FAMILY_ACCENT, FAMILY_MUTED } from './familyTheme';

function formatDate(iso) {
  const d = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function monthLabel(iso) {
  const d = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  if (!photo) return null;

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
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(-1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 text-white text-2xl"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 text-white text-2xl"
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      ) : null}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <PhotoWithFallback
          src={photoUrl(photo.photo_url)}
          alt={photo.caption || ''}
          index={index}
          height={320}
          borderRadius={12}
          imgClassName="max-w-full max-h-[60vh] object-contain rounded-lg"
          imgStyle={{ maxHeight: '60vh' }}
        />
      </div>
      <div className="p-5 text-center text-white" onClick={(e) => e.stopPropagation()}>
        <p className="text-[15px] font-medium">{photo.caption}</p>
        <p className="text-[12px] font-normal mt-1 text-white/60">
          {photo.staff_name} · {formatDate(photo.created_at)}
        </p>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export default function FamilyPhotosTab() {
  const { token, residentId, residentName, loadingResident, residentError, retryResident } = useFamily();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const loadPhotos = useCallback(async () => {
    if (!residentId) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/photos/${residentId}`, { token });
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [residentId, token]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const grouped = photos.reduce((acc, p) => {
    const label = monthLabel(p.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(p);
    return acc;
  }, {});

  const navigateInMonth = useCallback(
    (dir) => {
      setLightbox((lb) => {
        if (!lb) return null;
        const { monthPhotos, index } = lb;
        let next = index + dir;
        if (next < 0) next = monthPhotos.length - 1;
        if (next >= monthPhotos.length) next = 0;
        return { monthPhotos, index: next };
      });
    },
    []
  );

  if (loadingResident) {
    return (
      <div className="space-y-5">
        <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
        <LoadingGrid />
      </div>
    );
  }

  if (residentError) {
    return (
      <div className="text-center py-8">
        <p className="text-[14px] text-red-500 mb-3">{residentError}</p>
        <button type="button" onClick={retryResident} className="text-[14px] font-medium" style={{ color: FAMILY_ACCENT }}>
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <p className="text-[13px] font-normal" style={{ color: FAMILY_MUTED }}>
          {residentName || 'Resident'}&apos;s moments
        </p>
        <LoadingGrid />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[14px] text-red-500 mb-3">{error}</p>
        <button type="button" onClick={loadPhotos} className="text-[14px] font-medium" style={{ color: FAMILY_ACCENT }}>
          Retry
        </button>
      </div>
    );
  }

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
        {residentName || 'Resident'}&apos;s moments
      </p>

      {Object.entries(grouped).map(([month, items]) => (
        <section key={month}>
          <h3 className="text-[12px] font-medium mb-2" style={{ color: FAMILY_MUTED }}>
            {month}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {items.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox({ monthPhotos: items, index: idx })}
                className="aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#5B4FE8] focus:ring-offset-1"
              >
                <PhotoWithFallback
                  src={photoUrl(photo.photo_url)}
                  alt={photo.caption || ''}
                  index={photos.findIndex((p) => p.id === photo.id)}
                  borderRadius={8}
                  fill
                  imgClassName="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>
      ))}

      {lightbox ? (
        <PhotoLightbox
          photos={lightbox.monthPhotos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={navigateInMonth}
        />
      ) : null}
    </div>
  );
}
