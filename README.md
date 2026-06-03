# Kinness — Keeping Families Connected

Kinness helps elder care facilities share photo and text updates with families. Staff post in under a minute; families get an email and see updates in a warm, mobile-first feed.

## Project structure

```
kinness/
├── frontend/          # React PWA (Vercel)
├── backend/           # Express + SQLite API (Railway, Render, etc.)
└── README.md
```

## Demo seed accounts

```bash
cd backend
npm run seed:staff   # staff@kinness.app / staff12345 → /staff/post
npm run seed:family  # family@kinness.app / family12345 → /family/feed (linked to Mary Chen)
```

## Quick start

### Backend

```bash
cd backend
npm install
cp env.example .env
# Edit JWT_SECRET, FACILITY_CODE, SMTP_* as needed
npm run dev
```

API runs at `http://localhost:3000`. On first start, a demo facility and admin are seeded:

| Field | Default |
|-------|---------|
| Facility code | `KINNESS2024` (or `FACILITY_CODE` in `.env`) |
| Admin email | `admin@kinness.app` |
| Admin password | `admin12345` |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:3000
npm start
```

Open `http://localhost:3000` (CRA may use port 3000 — if it conflicts with the API, set `PORT=3001` for the frontend).

## Roles & routes

After login, users are redirected by role:

| Role | Route | Purpose |
|------|-------|---------|
| `admin` | `/admin` | Dashboard, residents, family links, staff invites |
| `staff` | `/staff/post` | Post updates with photo |
| `family` | `/family/feed` | View updates for linked loved ones |

Registration requires **name, email, password, and facility code**. Staff/family must be invited by email (admin panel) or they register as family by default.

## Database (SQLite)

Tables: `users`, `facilities`, `residents`, `family_members`, `updates`, `user_roles`, `feed_reads`, `pending_invites`.

Data file: `backend/data/kinness.db` (created automatically).

## Email notifications

When staff posts an update, linked family members receive:

- **Subject:** `[Resident Name] has a new update from [Facility Name]`
- **Body:** Update text + link to `/family/feed`

Configure SMTP in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).

## Multilingual UI

Toggle **English | 中文** (top right). Preference stored in `localStorage`. Update content is shown as written (no auto-translation).

## PWA

- `manifest.json` — add to home screen as **Kinness**
- Service worker — caches static assets; feed also cached in `localStorage` when offline
- Install prompt on first visit

## Deployment

### Frontend (Vercel)

- Root directory: `frontend`
- Build: `npm run build` (injects API proxy into `vercel.json` when `KINNESS_BACKEND_URL` is set)
- Output: `build`
- **Production env:** `KINNESS_BACKEND_URL=https://your-api.railway.app` (same-origin `/api` + `/uploads` proxy; enables feed offline cache in the service worker)
- **Local dev:** `REACT_APP_API_URL=http://localhost:3000` in `frontend/.env`

### Backend (Railway / Render)

- Root: `backend`
- Start: `npm start`
- Env: see `backend/env.example`
- Set `FRONTEND_URL` to your Vercel URL for CORS and email links
- Persist `backend/data/` and `backend/uploads/` on hosted volumes

## Design

- Primary `#2D6A4F`, accent `#95D5B2`, text `#1B1B1B`
- Minimum 16px text, 44px tap targets
- Family UI uses “your loved one”; staff uses “update”

## License

MIT
