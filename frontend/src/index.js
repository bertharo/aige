import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { BUILD_ID } from './buildInfo';

const BUILD_KEY = 'kinness_build_id';

async function clearStalePwaCache() {
  const previous = localStorage.getItem(BUILD_KEY);
  if (previous === BUILD_ID) return false;

  localStorage.setItem(BUILD_KEY, BUILD_ID);

  if (previous) {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    window.location.reload();
    return true;
  }

  return false;
}

const container = document.getElementById('root');
const root = createRoot(container);

clearStalePwaCache().then((reloading) => {
  if (reloading) return;

  root.render(<App />);

  serviceWorkerRegistration.register({
    onUpdate(registration) {
      const waiting = registration.waiting;
      if (!waiting) return;
      waiting.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
        once: true,
      });
    },
  });
});

reportWebVitals();
