# Kinness Backend — Render Deployment

Your Render service must run the **Kinness v2** backend (`kinness-backend` in `package.json`), not the old Prisma AIGE server.

## Verify deployed version

```bash
curl https://aige-backend.onrender.com/health
```

**Correct (Kinness v2):**
```json
{"status":"OK","service":"Kinness Backend","version":"2.0.0","database":"sqlite",...}
```

**Wrong (old AIGE — redeploy required):**
```json
{"service":"AIGE Backend API",...}
```

## Redeploy on Render

1. [Render Dashboard](https://dashboard.render.com/) → **aige-backend**
2. **Settings** → Root Directory: `backend`
3. **Build Command:** `npm install && npm run build` (must **not** include `prisma` or `debug-prisma.js`)
4. **Start Command:** `npm start`
5. **Node version:** 20 (see `backend/.nvmrc`)
5. **Manual Deploy** → **Clear build cache & deploy** (from `main` on GitHub)

## Environment variables

| Variable | Required | Example |
|----------|----------|---------|
| `JWT_SECRET` | Yes | long random string |
| `FRONTEND_URL` | Yes | `https://aige.vercel.app` |
| `FACILITY_CODE` | Yes | `KINNESS2024` |
| `NODE_ENV` | Yes | `production` |
| `ADMIN_SEED_EMAIL` | Optional | `admin@kinness.app` |
| `ADMIN_SEED_PASSWORD` | Optional | change in production |
| `DATA_DIR` | Optional | `/var/data` if using a Render disk |
| `SMTP_*` | Optional | for family email notifications |

Remove old Prisma variables (`DATABASE_URL`) — they are not used.

## Demo login (Kinness v2 only)

- **Admin:** `admin@kinness.app` / `admin12345`
- **Facility code (register):** `KINNESS2024`

If login returns **401** with message `"Invalid email or password"` → you are still on the **old** AIGE server (redeploy).

Kinness v2 returns: `"Email or password is incorrect"`.

### Still on old backend?

Render → **Manual Deploy** → **Clear build cache & deploy** from `main`.

### After Kinness deploy — force pilot accounts

Set `SETUP_SECRET` on Render, then:

```bash
curl -X POST https://aige-backend.onrender.com/api/setup/pilot \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

Or run once via Render Shell:

```bash
npm run seed:staff
npm run seed:family
```

## Frontend (Vercel)

```
REACT_APP_API_URL=https://aige-backend.onrender.com
```

Or use `KINNESS_BACKEND_URL` with same-origin proxy (see frontend `.env.example`).
