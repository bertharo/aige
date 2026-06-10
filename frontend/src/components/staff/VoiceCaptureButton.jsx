import React from 'react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { ACCENT } from '../../theme';

export default function VoiceCaptureButton({ disabled, processing, onRecordingComplete, onError, labels }) {
  const recorder = useVoiceRecorder({
    onComplete: onRecordingComplete,
    onError,
  });

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (disabled || recorder.isRecording || recorder.isProcessing) return;
    recorder.startRecording();
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (recorder.isRecording) recorder.stopRecording();
  };

  const busy = recorder.isProcessing || processing;
  const recording = recorder.isRecording;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <button
        type="button"
        disabled={disabled || busy}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex items-center justify-center rounded-full select-none touch-none transition-transform active:scale-95 disabled:opacity-40"
        style={{
          width: 120,
          height: 120,
          backgroundColor: recording ? '#E0DEFF' : ACCENT,
          boxShadow: recording
            ? '0 0 0 8px rgba(91, 79, 247, 0.15)'
            : '0 8px 24px rgba(91, 79, 247, 0.25)',
        }}
        aria-pressed={recording}
        aria-label={labels.holdToTalk}
      >
        {recording ? (
          <span className="flex flex-col items-center text-[#3C3489]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="9" y="4" width="2" height="16" rx="1" />
              <rect x="13" y="4" width="2" height="16" rx="1" />
            </svg>
            <span className="text-[13px] font-medium mt-1">{recorder.seconds}s</span>
          </span>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white" aria-hidden>
            <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7z" />
          </svg>
        )}
      </button>

      <p className="text-[14px] font-medium text-center" style={{ color: recording ? ACCENT : '#3C3489' }}>
        {busy
          ? labels.processing
          : recording
            ? labels.release
            : disabled
              ? labels.selectFirst
              : labels.holdToTalk}
      </p>
      {!disabled && !recording && !busy ? (
        <p className="text-[12px] text-black/45 text-center max-w-[260px]">{labels.hint}</p>
      ) : null}
    </div>
  );
}
