import React, { useState } from 'react';
import { ACCENT, btnAccentClass, glassField, glassPanel } from '../../theme';

export default function VoiceReviewModal({
  open,
  draft,
  dark,
  labels,
  onClose,
  onApprove,
  approving,
}) {
  const [careNote, setCareNote] = useState('');
  const [familyUpdate, setFamilyUpdate] = useState('');

  React.useEffect(() => {
    if (open && draft) {
      setCareNote(draft.careNote || '');
      setFamilyUpdate(draft.familyUpdate || '');
    }
  }, [open, draft]);

  if (!open || !draft) return null;

  const label = dark ? 'text-white/70' : 'text-black/55';
  const inputClass = `w-full px-3.5 py-3 text-[15px] outline-none bg-transparent resize-none ${dark ? 'text-white' : 'text-[#0a0a0a]'}`;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
    >
      <div className={`w-full max-w-[390px] max-h-[90vh] overflow-y-auto ${glassPanel(dark)} p-4`}>
        <h2 className="text-[17px] font-medium mb-1">{labels.title}</h2>
        <p className={`text-[13px] mb-4 ${label}`}>
          {labels.subtitle.replace('{name}', draft.residentName || '')}
        </p>

        {draft.parseFailed ? (
          <p className="text-[13px] text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-3">
            {labels.parseFailed}
          </p>
        ) : null}

        <div className="mb-3">
          <p className={`text-[12px] font-medium mb-1 ${label}`}>{labels.transcript}</p>
          <p className="text-[13px] text-black/60 italic leading-relaxed">{draft.transcript}</p>
        </div>

        <div className="mb-3">
          <label className={`block text-[13px] font-medium mb-1.5 ${label}`}>{labels.careNote}</label>
          <div className={glassField(dark)}>
            <textarea
              rows={3}
              value={careNote}
              onChange={(e) => setCareNote(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-[13px] font-medium mb-1.5 ${label}`}>
            {labels.familyUpdate}
            {draft.targetLanguage && draft.targetLanguage !== 'en' ? (
              <span className="font-normal text-black/40"> ({draft.targetLanguage})</span>
            ) : null}
          </label>
          <div className={glassField(dark)}>
            <textarea
              rows={4}
              value={familyUpdate}
              onChange={(e) => setFamilyUpdate(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={approving}
            className="flex-1 h-11 rounded-xl text-[14px] font-medium text-black/55"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            disabled={approving || !familyUpdate.trim()}
            onClick={() =>
              onApprove({
                careNote: careNote.trim(),
                familyUpdate: familyUpdate.trim(),
                transcript: draft.transcript,
                audioUrl: draft.audioUrl,
              })
            }
            className={`flex-1 h-11 rounded-xl text-white text-[14px] font-medium ${btnAccentClass()}`}
            style={{ backgroundColor: ACCENT }}
          >
            {approving ? labels.approving : labels.approve}
          </button>
        </div>
      </div>
    </div>
  );
}
