# Kinness Backend API

Express API with SQLite (`better-sqlite3`), JWT auth, file uploads, and Nodemailer notifications.

## Setup

```bash
npm install
cp env.example .env
npm run dev
```

See `env.example` for all variables including `JWT_SECRET`, `FACILITY_CODE`, `GROQ_API_KEY`, and SMTP settings.

## Key endpoints

| Method | Path | Role |
|--------|------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/staff/residents` | staff, admin |
| POST | `/api/updates` | staff, admin |
| POST | `/api/staff/voice/draft` | staff, admin — transcribe + structure (not posted) |
| POST | `/api/staff/voice/approve` | staff, admin — post reviewed update |
| GET | `/api/family/feed` | family |
| GET | `/api/admin/dashboard` | admin |

Health: `GET /health`
