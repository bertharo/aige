import { useCallback, useRef, useState } from 'react';

const MAX_SECONDS = 10;

function pickMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
  ];
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export function useVoiceRecorder({ maxSeconds = MAX_SECONDS, onComplete, onError }) {
  const [status, setStatus] = useState('idle'); // idle | recording | processing
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secondsRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (secondsRef.current) {
      clearInterval(secondsRef.current);
      secondsRef.current = null;
    }
    if (mediaRef.current) {
      mediaRef.current.getTracks().forEach((t) => t.stop());
      mediaRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    setStatus('processing');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (secondsRef.current) {
      clearInterval(secondsRef.current);
      secondsRef.current = null;
    }
    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (status === 'recording' || status === 'processing') return;

    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.('Microphone not supported in this browser');
      return;
    }

    const mimeType = pickMimeType();
    if (!mimeType) {
      onError?.('Recording not supported in this browser');
      return;
    }

    try {
      cleanup();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanup();
        setStatus('idle');
        setSeconds(0);
        if (blob.size > 0) onComplete?.(blob, mimeType);
        else onError?.('No audio captured — try holding a little longer');
      };

      recorder.onerror = () => {
        cleanup();
        setStatus('idle');
        setSeconds(0);
        onError?.('Recording failed — please try again');
      };

      recorder.start(250);
      setStatus('recording');
      setSeconds(0);

      secondsRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);

      timerRef.current = setTimeout(() => {
        stopRecording();
      }, maxSeconds * 1000);
    } catch (err) {
      cleanup();
      setStatus('idle');
      setSeconds(0);
      if (err.name === 'NotAllowedError') {
        onError?.('Microphone access denied — allow mic in browser settings');
      } else {
        onError?.('Could not start recording');
      }
    }
  }, [cleanup, maxSeconds, onComplete, onError, status, stopRecording]);

  const cancel = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.onstop = () => {
        cleanup();
        setStatus('idle');
        setSeconds(0);
      };
      recorderRef.current.stop();
      return;
    }
    cleanup();
    setStatus('idle');
    setSeconds(0);
  }, [cleanup]);

  return {
    status,
    seconds,
    maxSeconds,
    startRecording,
    stopRecording,
    cancel,
    isRecording: status === 'recording',
    isProcessing: status === 'processing',
  };
}
