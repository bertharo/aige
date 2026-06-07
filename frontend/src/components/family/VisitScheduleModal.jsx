import React, { useEffect, useRef } from 'react';
import { FAMILY_ACCENT, FAMILY_MUTED, familyCardClass } from './familyTheme';

const TIMES = [
  { value: 'morning', label: 'Morning (9am – 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm – 4pm)' },
  { value: 'evening', label: 'Evening (4pm – 7pm)' },
];

export default function VisitScheduleModal({ open, onClose, userName, onSubmitted }) {
  const dialogRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    firstFocusRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusable);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      date: fd.get('date'),
      timeSlot: fd.get('timeSlot'),
      name: fd.get('name'),
      notes: fd.get('notes') || '',
    };
    console.log('[kiness visit request]', payload);
    onSubmitted();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-modal-title"
        className={`relative w-full max-w-[390px] p-5 ${familyCardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="visit-modal-title" className="text-[18px] font-medium text-[#1a1a24] mb-4">
          Schedule a visit
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-[13px] font-medium mb-1 block" style={{ color: FAMILY_MUTED }}>
              Date
            </span>
            <input
              ref={firstFocusRef}
              type="date"
              name="date"
              required
              className="w-full h-11 px-3 rounded-xl border text-[15px] font-normal outline-none focus:border-[#5B4FE8]"
              style={{ borderColor: '#E5E3F8' }}
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium mb-1 block" style={{ color: FAMILY_MUTED }}>
              Time
            </span>
            <select
              name="timeSlot"
              required
              className="w-full h-11 px-3 rounded-xl border text-[15px] font-normal outline-none appearance-none"
              style={{ borderColor: '#E5E3F8' }}
            >
              {TIMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[13px] font-medium mb-1 block" style={{ color: FAMILY_MUTED }}>
              Your name
            </span>
            <input
              type="text"
              name="name"
              defaultValue={userName}
              required
              className="w-full h-11 px-3 rounded-xl border text-[15px] font-normal outline-none"
              style={{ borderColor: '#E5E3F8' }}
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium mb-1 block" style={{ color: FAMILY_MUTED }}>
              Notes (optional)
            </span>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border text-[15px] font-normal outline-none resize-none"
              style={{ borderColor: '#E5E3F8' }}
              placeholder="Anything the care team should know?"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-[15px] font-medium border"
              style={{ borderColor: '#E5E3F8', color: FAMILY_MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl text-[15px] font-medium text-white"
              style={{ backgroundColor: FAMILY_ACCENT }}
            >
              Request visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
