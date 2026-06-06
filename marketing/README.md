# Kinness marketing site (kinness.ai)

Next.js App Router landing page for kinness.ai. The product app (CRA) lives in `../frontend` and is proxied for `/login`, `/admin`, etc.

## Develop

```bash
cd marketing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

- **Root directory:** `marketing`
- **Framework:** Next.js
- `/login` and app routes can proxy to the CRA deployment via `vercel.json` rewrites (update destination URL for production).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Marketing landing page |
| `/login` | Proxied to product app (not built here) |
