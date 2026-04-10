# Law firm portal — deployment notes

## Supabase (recommended)

The **frontend** is built to run **without a separate Node API**: it uses **Supabase Auth**, **Postgres + RLS**, and **Storage**. Follow **`SUPABASE.md`** for migrations, env vars, and the `portal-admin-users` Edge Function.

The **backend/** folder (Express + Prisma) remains for reference or local tooling; it is **not required** for the hosted portal when using Supabase.

---

## Legacy: Express + Prisma API

The portal was originally two apps: **backend** (Express + Prisma) and **frontend** (Vite + React) with `VITE_API_URL`. That path is deprecated in favour of Supabase above.

## Backend (`law-firm-portal/backend`)

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `4000`). |
| `DATABASE_URL` | Yes | Prisma PostgreSQL connection string. Example local: `postgresql://postgres:postgres@localhost:5432/na_jurists_portal?schema=public`; Supabase: `postgresql://...`. |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access JWTs; **at least 16 characters**; use a long random value in production. |
| `FRONTEND_ORIGIN` | Yes | Exact origin of the portal UI (scheme + host + port), e.g. `https://portal.example.com`. Used for **CORS** — must match what the browser sends as `Origin`. |
| `ACCESS_TOKEN_EXPIRES_SEC` | No | Access token lifetime in seconds (default `900`). |
| `REFRESH_TOKEN_DAYS` | No | Refresh cookie/session policy (default `7`). |
| `UPLOAD_DIR` | No | Directory for case document files (default `./uploads`). Ensure the process can write here and that this path persists across restarts. |
| `MAX_UPLOAD_MB` | No | Max upload size (default `15`). |
| `APP_PUBLIC_URL` | No | Public portal URL for password-reset links in emails. Defaults to `FRONTEND_ORIGIN`. |
| `EMAIL_ENABLED` | No | Set `true` and configure SMTP to send real email; otherwise messages are **logged to the server console**. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | If emailing | Standard SMTP settings. `SMTP_FROM` example: `N&A Jurists <portal@example.com>`. |
| `PASSWORD_RESET_EXPIRES_MIN` | No | Reset link lifetime (default `60`). |
| `CRON_ENABLED` | No | Daily jobs: missing-hearing digest to admins + upcoming-hearing reminder emails (default `true`). |
| `CRON_SCHEDULE` | No | [node-cron](https://github.com/node-cron/node-cron) expression (default `0 8 * * *` — 08:00 server time daily). |

Copy `backend/.env.example` to `backend/.env` locally; in production use your host’s secret store or env injection — **never commit `.env`.**

### Build and run

```bash
cd law-firm-portal/backend
npm ci
npx prisma db push
npm run build
node dist/index.js
```

- **First deploy:** sync schema before starting the server. Optionally run `npx prisma db seed` once if you need the default admin/client demo users (see `prisma/seed.ts`).
- **Production DB:** set `DATABASE_URL` to your Supabase Postgres URI and run `npx prisma db push` (or use `prisma migrate deploy` once you maintain Postgres migrations).

### CORS

The API allows requests from `FRONTEND_ORIGIN` only. If the portal is served from another URL (e.g. CDN preview), update `FRONTEND_ORIGIN` or add support for multiple origins in code if you need that.

---

## Frontend (`law-firm-portal/frontend`)

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Project URL from Supabase (Settings → API). |
| `VITE_SUPABASE_ANON_KEY` | Yes | **anon** public key (never use the service_role key in the frontend). |

Vite bakes these in at **build time**. Rebuild after changing them. See **`SUPABASE.md`**.

### Public marketing site (Next.js, repo root)

The main website navbar includes a **Client portal** button. Set in the Next.js app:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PORTAL_URL` | Base URL of the portal UI (no trailing slash), e.g. `https://portal.example.com`. Defaults to `http://localhost:5173`. Sign-in uses `{NEXT_PUBLIC_PORTAL_URL}/login`. |

| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | In root **`.env.production`** (committed): enough for `/api/cases` to merge portal matters when **SQL policy** `cases_select_public_website` is applied (`supabase/migrations/20260410180000_cases_public_website_anon_read.sql`). **No Vercel env UI needed** if you deploy with that file. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional legacy: server-only merge without the anon RLS migration. Prefer anon + migration so production needs no extra secrets. |

Copy root `.env.example` or add `NEXT_PUBLIC_PORTAL_URL` to `.env.local` for local dev.

### Build and host

```bash
cd law-firm-portal/frontend
npm ci
npm run build
```

Serve the `dist/` folder with any static host (nginx, S3+CloudFront, Netlify, etc.). Configure the host to **fallback to `index.html`** for client-side routes (`/dashboard`, `/cases/...`, etc.).

### Vercel (portal frontend)

If `/login` (or every client route) shows **Vercel’s generic 404**, the deployment is almost certainly building the **wrong folder** (for example the repo root Next.js app, which has no `/login`).

In the **portal** Vercel project → **Settings → General → Root Directory**, set **one** of:

| Root Directory | What Vercel uses |
|----------------|------------------|
| `law-firm-portal` | `law-firm-portal/vercel.json` — installs and builds `frontend/`, output `frontend/dist`. Use this if the project was linked with an empty root. |
| `law-firm-portal/frontend` | `law-firm-portal/frontend/vercel.json` — normal Vite SPA; Framework Preset should be **Vite** (or “Other” with Output **dist**). |

After changing Root Directory, trigger a **new deployment**.

**Supabase env on Vercel:** set **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** (Production + Preview) or commit them in **`frontend/.env.production`**. No separate portal API or CORS setup is required for the browser — Supabase handles auth and PostgREST with RLS.

**Admin user management** needs the **`portal-admin-users`** Edge Function deployed (see **`SUPABASE.md`**).

---

## CI

GitHub Actions workflow `.github/workflows/law-firm-portal-ci.yml` runs on changes under `law-firm-portal/`:

- **Backend:** `npm ci` → `prisma db push` → `prisma db seed` → `npm run lint` → `npm test` → `npm run build`
- **Frontend:** `npm ci` → `npm run lint` → `npm run build`

---

## Suggested production layout

| Piece | Example |
|--------|---------|
| Marketing site | `https://najurists.com` (existing Next.js app) |
| Portal UI | `https://portal.najurists.com` → static `dist/` + Supabase project |
| Data / auth | Supabase (Postgres, Auth, Storage, optional Edge Functions) |

Use HTTPS everywhere; configure Supabase auth redirect URLs for your portal domain.
