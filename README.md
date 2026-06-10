# Kiness — Keeping Families Connected

Kiness helps elder care facilities share photo and text updates with families. Staff post in under a minute; families get an email and see updates in a warm, mobile-first feed.

## Project structure

```
kinness/
├── frontend/          # React PWA (Vercel)
├── backend/           # Express + SQLite API (Railway, Render, etc.)
└── README.md
```

## Demo seed (Sunrise Gardens)

```bash
cd backend
npm run seed          # idempotent — skips if SGSL2024 exists
npm run seed:reset    # clears DB and loads full demo dataset
```

**After `npm run seed:reset`:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sunrisegardens.com | Admin1234! |
| Staff | sarah@sunrisegardens.com, david@sunrisegardens.com, aisha@sunrisegardens.com | Staff1234! |
| Family | jenny.haro@gmail.com (+ 7 others in `seed.js`) | Family1234! |

Facility code: **SGSL2024** — 8 residents, 20 updates over the last 7 days.

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
| `staff` | `/staff/post` | Voice or typed updates with photo |
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

## Voice logging (staff)

Staff can log care notes by voice on `/staff/post` — push-and-hold the mic button (max 10 seconds), review the AI draft, then approve before anything reaches the family feed.

### Setup

Add to `backend/.env`:

```
GROQ_API_KEY=gsk_...   # https://console.groq.com
```

On Render, set the same env var on the backend service.

### Flow

1. Staff selects a resident, then holds the mic button and speaks.
2. `POST /api/staff/voice/draft` — audio uploaded → Groq Whisper transcribes → Groq Llama structures into **care note** (staff record) + **family update** (warm message in the family's preferred language).
3. Review modal — staff edits both fields; nothing is posted yet.
4. `POST /api/staff/voice/approve` — inserts into `updates`, merges care note into today's `daily_records`, emails family.

### Models (Groq)

| Step | Model |
|------|-------|
| Transcription | `whisper-large-v3-turbo` |
| Structuring | `llama-3.3-70b-versatile` |

All AI calls live in `backend/lib/ai.js`. To swap structuring to Claude later, replace the `structure()` implementation — the route layer stays the same.

### Multilingual family updates

Each `family_members` row has `preferred_language` (default `en`). The demo seed sets Marco Deluca's family to `es`. Spoken language can differ; the family update is written in the linked family's preferred language.

### Test locally

1. Start backend with `GROQ_API_KEY` set.
2. Log in as staff (`sarah@sunrisegardens.com` / `Staff1234!` after `npm run seed:reset`).
3. Select **Rosa Haro**, hold mic, say something like: *"Rosa had a good lunch, ate most of her soup, and napped for an hour."*
4. Review and approve — check `/family/feed` as `jenny.haro@gmail.com`.

### TODO (out of scope for MVP)

- SMS notifications for voice updates
- Offline voice queue
- Calendar voice entry

## Multilingual UI

Toggle **English | 中文** (top right). Preference stored in `localStorage`. Update content is shown as written (no auto-translation).

## PWA

- `manifest.json` — add to home screen as **Kiness**
- Service worker — caches static assets; feed also cached in `localStorage` when offline
- Install prompt on first visit

## Deployment

### kiness.ai (marketing site)

Vercel project for the public homepage — **Root Directory:** repo root (uses `/vercel.json` → builds `marketing/`).

| Env | Purpose |
|-----|---------|
| `KINNESS_APP_URL` | URL of the CRA app deployment, e.g. `https://kinness-app.vercel.app` — proxies `/login`, `/admin`, etc. |

After deploy, `/` shows the landing page; `/login` proxies to the app.

### Product app (CRA PWA)

Separate Vercel project — **Root Directory:** `frontend`

| Env | Purpose |
|-----|---------|
| `KINNESS_BACKEND_URL` | API origin for `/api` proxy |
| `REACT_APP_API_URL` | Optional explicit API URL |

**Migration from a single deploy:** If `aige.vercel.app` currently serves the CRA app, create a second Vercel project for `frontend/`, set `KINNESS_APP_URL` on the marketing project to that URL, then switch the main domain to the marketing build.

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
