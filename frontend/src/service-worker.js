/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

self.addEventListener('install', () => {
  self.skipWaiting();
});

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// Always fetch fresh HTML so new JS/CSS bundle hashes load after deploy
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-shell',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 1 })],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Never cache auth or API mutations — avoids login hanging on stale SW responses
registerRoute(({ url }) => url.pathname.startsWith('/api/'), new NetworkOnly());

// Cache family feed API when same-origin (e.g. proxied in dev)
registerRoute(
  ({ url }) => url.pathname === '/api/family/feed',
  new StaleWhileRevalidate({
    cacheName: 'kinness-feed',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 })],
  })
);

