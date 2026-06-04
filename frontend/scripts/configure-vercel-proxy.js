/**
 * Injects API/upload rewrites into vercel.json at build time when KINNESS_BACKEND_URL is set.
 * Enables same-origin /api and /uploads on Vercel so the service worker can cache the feed.
 */
const fs = require('fs');
const path = require('path');

const backend = process.env.KINNESS_BACKEND_URL || process.env.REACT_APP_API_URL;
const vercelPath = path.join(__dirname, '..', 'vercel.json');

const base = {
  headers: [
    {
      source: '/index.html',
      headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
    },
    {
      source: '/service-worker.js',
      headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
  ],
};

let rewrites;

if (backend && backend.startsWith('http')) {
  const origin = backend.replace(/\/$/, '');
  rewrites = [
    { source: '/api/:path*', destination: `${origin}/api/:path*` },
    { source: '/uploads/:path*', destination: `${origin}/uploads/:path*` },
    { source: '/((?!api/|uploads/|static/|.*\\..*).*)', destination: '/index.html' },
  ];
  console.log('[vercel] Proxy configured →', origin);
} else {
  rewrites = [{ source: '/(.*)', destination: '/index.html' }];
  console.log('[vercel] No KINNESS_BACKEND_URL — SPA-only rewrites (local dev uses REACT_APP_API_URL)');
}

fs.writeFileSync(vercelPath, JSON.stringify({ ...base, rewrites }, null, 2) + '\n');
