# Kiness — What Is Built So Far

**Kiness** (`kiness.ai`) is a family communication platform for elder care. Staff at assisted living facilities post short updates (text + optional photo); families see them in a warm, mobile-first app.

**Repo:** `bertharo/aige` (workspace folder: `kinness`)

---

## Architecture overview

```
kinness/
├── frontend/     # React CRA PWA — product app (what kiness.ai deploys today)
├── backend/      # Express + SQLite API (Render: aige-backend.onrender.com)
├── marketing/    # Next.js landing + waitlist API (built, not primary production deploy)
└── vercel.json   # Root Vercel config → builds frontend/
```

| Layer | Tech | Production URL |
|-------|------|----------------|
| **App (PWA)** | React 19, React Router, Tailwind, service worker | [kiness.ai](https://kiness.ai) |
| **API** | Express, sql.js (SQLite), JWT auth, bcrypt | [aige-backend.onrender.com](https://aige-backend.onrender.com) |
| **Marketing** | Next.js 15 App Router | In repo; optional separate Vercel project |

---

## User roles & routes

After login, users are redirected by role:

| Role | Route | What they see |
|------|-------|---------------|
| **Admin** | `/admin` | Dashboard, residents, family links, staff invites |
| **Staff** | `/staff/post` | Post updates for residents (text + photo) |
| **Family** | `/family/feed` | Feed + Calendar + Daily Record + Photos (4-tab app) |

**Public routes (no auth):**

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page (CRA port) |
| `/login` | Sign in |
| `/register` | Sign up with facility code |

---

## Backend API

**Stack:** Express, sql.js SQLite, JWT, multer (photo uploads), nodemailer (SMTP).

**Database tables:** `users`, `facilities`, `residents`, `family_members`, `updates`, `user_roles`, `feed_reads`, `pending_invites`

**Key endpoints:**

| Method | Path | Who |
|--------|------|-----|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public (requires facility code) |
| GET | `/api/user/profile` | Authenticated |
| GET | `/api/staff/residents` | Staff, admin |
| POST | `/api/updates` | Staff, admin (multipart photo) |
| GET | `/api/family/feed` | Family |
| POST | `/api/family/feed/read` | Family (mark updates read) |
| GET | `/api/admin/dashboard` | Admin |
| GET/POST/PUT/DELETE | `/api/admin/residents` | Admin |
| GET | `/api/admin/family-links` | Admin |
| POST | `/api/admin/invite-family` | Admin |
| GET | `/api/admin/staff` | Admin |
| POST | `/api/admin/invite-staff` | Admin |
| GET | `/health` | Public (version check) |
| POST | `/api/setup/pilot` | Setup secret (legacy seed) |

**On production startup:** Auto-seeds **Sunrise Gardens** demo (`SGSL2024`) if missing.

**Email:** When staff posts an update, linked family get SMTP notification with update text + link to feed.

---

## Demo data — Sunrise Gardens

```bash
cd backend && npm run seed          # idempotent
cd backend && npm run seed:reset    # wipe + reload
```

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@sunrisegardens.com` | `Admin1234!` |
| **Staff** | `sarah@sunrisegardens.com`, `david@sunrisegardens.com`, `aisha@sunrisegardens.com` | `Staff1234!` |
| **Family** | `jenny.chen@gmail.com` (+ 7 others in `seed.js`) | `Family1234!` |

**Facility code (register):** `SGSL2024`

**Seed includes:** 8 residents, 3 staff, 8 family accounts, 20 feed updates over the last 7 days.

**Legacy pilot** (only if old DB never migrated): `admin@kinness.app` / `admin12345`, code `KINNESS2024`

---

## Frontend — Product app (CRA PWA)

### Auth & onboarding
- Login / register with facility code
- JWT session in `localStorage` (`kinness_session`)
- First-visit **language picker** (7 languages)
- Globe icon → bottom-sheet language switcher anytime
- PWA install prompt (hidden on `/`, `/login`, `/register`)

### Internationalization (7 languages)
Custom React i18n — no third-party library.

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Español |
| `zh-CN` | 简体中文 |
| `zh-TW` | 繁體中文 |
| `tl` | Filipino (Tagalog) |
| `vi` | Tiếng Việt |
| `ko` | 한국어 |

- **77 UI strings** per locale in `frontend/src/i18n/locales/`
- Persisted in `localStorage` (`kinness_lang`)
- Verify script: `node frontend/scripts/verify-locales.js`

### Design system (app UI)
- **Primary accent:** `#5A4FF7` / `#5B4FE8` (electric indigo)
- **Accent light:** `#EEEDFE`
- **Background:** `#F0EFFB` / `#f4f3ff` (lavender)
- **Glass panels:** frosted cards, blur, soft borders
- **Typography:** system-ui, SF Pro Rounded stack; 44px min tap targets
- **No green** on main flows (legacy green removed from admin/auth/family shell)

### Admin panel (`/admin`)
- **AdminShell** — shared header, globe, dark/light toggle, underline nav tabs
- **Tabs:** Dashboard · Residents · Family · Staff
- **Dashboard:** resident count, family links, updates today
- **Residents:** CRUD with optional photo
- **Family:** view links per resident, invite by email
- **Staff:** mobile-first list, invite by email, unified add control

### Staff (`/staff/post`)
- Select resident → write update → optional camera photo → post
- Success toast; families notified via API + email

### Family app (`/family/feed`)
**4-tab bottom navigation:**

| Tab | Status | Notes |
|-----|--------|-------|
| **Feed** | ✅ Live API | Real updates from backend; pull-to-refresh; offline cache |
| **Calendar** | 🟡 UI + placeholder | Weekly strip, facility events, family visits, schedule-visit modal (`console.log`) |
| **Daily Record** | 🟡 UI + placeholder | Meals, mood, activities, staff note for Mary Chen |
| **Photos** | 🟡 UI + placeholder | Month grid, picsum placeholders, swipe lightbox |

Family shell: `#F0EFFB` background, white cards, indigo accent — separate from admin glass theme.

### Marketing landing (`/`)
Built **inside the CRA app** (what production serves at `kiness.ai/`):

- Hero: “Your family, always close.” + animated phone mockup
- Stats, care-team / family sections, waitlist CTAs
- Links to `/login`, `/register`
- Instrument Serif for headlines

A fuller **Next.js** version also exists in `marketing/` (see below).

### PWA & cache
- Service worker (Workbox precache)
- **Build ID** cache bust on deploy (`build-id.json` + inline script)
- Network-first HTML so new bundles load after deploy
- Feed cached in `localStorage` when offline

---

## Marketing site (Next.js)

**Path:** `marketing/`

| Feature | Status |
|---------|--------|
| Landing page | ✅ Full page with HeroMockup, waitlist sections |
| SEO metadata | ✅ Open Graph, Twitter, `kiness.ai` |
| **POST `/api/waitlist`** | ✅ JSON file storage (`marketing/data/waitlist.json`) |
| **GET `/api/waitlist?key=...`** | ✅ Admin read (hardcoded key) |
| App proxy | Configured via `KINNESS_APP_URL` in `next.config.js` |

**Not currently** what `kiness.ai` deploys — root `vercel.json` builds `frontend/` instead. The CRA app includes a landing at `/` for production.

---

## Deployment (current)

| Service | Config |
|---------|--------|
| **Vercel (app)** | Root `vercel.json` → `frontend/build` |
| **Render (API)** | `backend/`, start `npm start`, SQLite at `DATA_DIR` |
| **Env (frontend)** | `REACT_APP_API_URL` → `https://aige-backend.onrender.com` |
| **Env (backend)** | `JWT_SECRET`, `FRONTEND_URL`, `SMTP_*`, optional `DATA_DIR` |

---

## What is NOT built yet

- Calendar / Daily Record / Photos **backend** (family tabs use placeholder data only)
- Waitlist → email or CRM integration (marketing API logs to JSON / console)
- Real photo storage for family Photos tab (feed photos work via staff uploads)
- Family tab strings in i18n (bottom nav labels still English)
- Two-domain split (marketing on `kiness.ai`, app on subdomain) — optional future setup
- Automated tests beyond CRA scaffold
- Legacy pages in `frontend/src/pages/Dashboard.jsx`, `UserManagement.jsx`, etc. — **not wired** to current routes (old AIGE artifacts)

---

## Quick local dev

```bash
# Terminal 1 — API
cd backend && npm install && cp env.example .env && npm run dev

# Terminal 2 — App
cd frontend && npm install && npm start

# Optional — Marketing
cd marketing && npm install && npm run dev
```

---

## Recent milestones (git)

- Unified indigo glass admin shell + staff tab redesign
- CRA marketing landing at `/`
- Family 4-tab app (Feed live, Calendar/Record/Photos placeholder)
- 7-language i18n
- Gmail login fix (no dot-stripping on auth emails)
- PWA cache bust for stale UI after deploy
- Next.js waitlist API in `marketing/`

---

*Last updated: June 2026*
