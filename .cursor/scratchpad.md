# Law Firm Portal — Planner Scratchpad

## Background and Motivation

The repository `na-jurists` already contains a **public law firm website** (Next.js 16, React 19, Tailwind, Supabase client, Cloudinary, etc.). The stakeholder documents describe:

1. **Legal Web App.docx** — Mostly **website maintenance** (reported judgments text/preview, remove “25+ years” copy, team roster/photos). This is separate from building the portal but may share branding/content later.

2. **User Stories Document for Law Firm Website and Portal.docx** — Splits into:
   - **Public website** features (homepage, team, contact, services, case listing, search/filter) — largely already implemented in the existing app.
   - **Web portal** features to build in isolation:
     - Secure **user authentication**
     - **Admin** role: full access to cases, users, management
     - **Client** role: view **own** case(s) in detail
     - **Case management** (admin): add/edit/update cases
     - **Case status updates** (admin) visible to clients
     - **Documents**: admin upload; client secure access
     - **Notifications** when case status changes (client)
     - **Secure messaging** between client and firm
     - **Hearing dates**: admin alerts if hearing date missing; reminders for upcoming hearings (admin + client)

**Goal:** Add a **new sibling folder** (not inside the Next.js app root) named **`Law Firm Portal`** containing **`backend/`** and **`frontend/`** so the existing website codebase is not modified or broken by portal work.

**Stack (implemented 2025-03-23):** `law-firm-portal/backend` — **Express 5 + TypeScript** (`tsx` dev, `tsc` build). `law-firm-portal/frontend` — **Vite 6 + React 19 + Tailwind CSS v4** (`@tailwindcss/vite`). UI tokens mirror `src/app/globals.css` (navy / accent blue / gold / `#f7fafc` background, Inter).

**Recommended folder location (inside repo root):**

```
na-jurists/
  src/                    # existing website (unchanged by portal scaffolding)
  ...
  Law Firm Portal/      # new — use quotes in terminal on Windows if needed
    backend/
    frontend/
```

*Alternative naming for fewer path issues:* `law-firm-portal` (kebab-case). The team can pick one convention and stick to it.

---

## Key Challenges and Analysis

| Area | Challenge | Simple direction |
|------|-----------|------------------|
| **Isolation** | Two apps in one repo | Separate `package.json` per app; separate env files; no imports from website `src/` into portal (optional shared `packages/` only if truly needed later). |
| **Auth & roles** | Admin vs client, least privilege | JWT or session API + role claims; **row-level security** if using Supabase/Postgres, or explicit checks in API layer. |
| **Data model** | Cases, users, documents, messages, hearings | Design schema early: `users`, `cases`, `case_assignments` (client↔case), `case_status_history`, `documents`, `messages`, `hearings`, `notifications`. |
| **Files** | Secure document storage | S3-compatible or Supabase Storage / Cloudinary with signed URLs; never public buckets for case docs. |
| **Realtime** | Messaging / notifications | WebSockets (Socket.io) or Supabase Realtime or polling for MVP. |
| **Hearing alerts** | Cron / scheduled jobs | Backend job (daily) to flag cases without next hearing; email/push/in-app per MVP scope. |
| **Alignment with existing stack** | Website already uses Supabase | **Option A:** Portal backend uses Supabase (Auth + DB + Storage + RLS) with a small API layer if needed. **Option B:** Standalone Node API + Postgres (Prisma) — more control, more to maintain. |

---

## High-level Task Breakdown

Each step has verifiable success criteria. **Executor should complete one step at a time** and pause for human verification where noted.

### Phase 0 — Repository layout (no business logic)

1. **Create folder structure**  
   - **Success:** `Law Firm Portal/backend` and `Law Firm Portal/frontend` exist; each has a minimal README (optional) or root `Law Firm Portal/README.md` describing purpose; **no edits** to existing `na-jurists` website `package.json` or `src/` except optional root `.gitignore` entries for `node_modules`, `.env`, build outputs if missing.

2. **Choose stack (document decision)**  
   - Pick: frontend framework (e.g. Next.js app router vs Vite + React), backend (e.g. Nest/Express/Fastify), DB (Supabase vs hosted Postgres).  
   - **Success:** Decision recorded in this scratchpad or team doc; versions pinned in new `package.json` files.

### Phase 1 — Backend foundation

3. **Backend bootstrap** — health route, config, env template (`.env.example`), lint/format.  
   - **Success:** `GET /health` returns 200; tests or manual curl documented.

4. **Database schema & migrations** — users/roles, cases, links client↔case.  
   - **Success:** Migrations apply cleanly; seed script optional (admin + demo client).

5. **Authentication API** — register/login (if allowed), refresh, password reset flow as per policy; role in token/session.  
   - **Success:** Automated test or Postman collection proves admin vs client access difference on a protected route.

### Phase 2 — Core portal features (MVP order)

6. **Case CRUD (admin)** — create/update/archive cases; assign client(s).  
7. **Client case read** — client sees only assigned cases; detail view.  
8. **Status updates** — timeline/history; triggers notification stub.  
9. **Documents** — upload (admin), list/download with authz.  
10. **Notifications** — in-app list + mark read; email optional phase 2.  
11. **Messaging** — thread per case or global inbox; basic secure messaging.  
12. **Hearings** — CRUD hearing dates; scheduled job + alerts for missing/upcoming.

### Phase 3 — Frontend

13. **Frontend shell** — auth pages, layout, role-based routes (admin dashboard vs client dashboard).  
14. **Wire to API** — same order as backend MVP; E2E smoke tests optional.

### Phase 4 — Ops & quality

15. **CI** — lint/test/build for `backend` and `frontend`.  
16. **Deployment notes** — env vars, CORS, separate domains or subpaths.

---

## Project Status Board

- [x] Phase 0: Folder `law-firm-portal/` with `backend/` + `frontend/` created (UI aligned with main site palette)
- [x] Stack decision documented (see Background)
- [x] Backend: health + DB + auth (Phase 1 — SQLite + Prisma + JWT + refresh; RBAC test; frontend login wired)
- [x] Phase 2 MVP: cases CRUD (admin), client case list/detail, status history + client notifications, document upload + secure download, messages per case, hearings CRUD + admin “missing upcoming hearing” alert list; frontend routes & UI
- [x] Frontend integrated (Phase 2 scope)
- [x] Phase 4: CI (GitHub Actions) + `law-firm-portal/DEPLOYMENT.md`

**Note:** Original **Phase 3 (frontend shell + wire to API)** was delivered together with Phase 2 MVP. The next executable phase after that is **Phase 4 (ops & quality)** — now implemented.

---

## Current Status / Progress Tracking

**Mode:** Executor — Phase 2 completed (2025-03-23).

**Done (Phase 1):**  
- **Backend:** Prisma + SQLite (`DATABASE_URL=file:./dev.db`), models `User`, `RefreshToken`, `Case`, `CaseAssignment`. Migrations in `law-firm-portal/backend/prisma/migrations/`.  
- **Auth:** `POST /auth/register` (CLIENT only), `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password` → 501.  
- **RBAC:** `GET /api/v1/admin/ping` (ADMIN), `GET /api/v1/client/ping` (CLIENT). Vitest integration tests in `backend/tests/`.  
- **Seed:** `admin@najurists.local` / `Admin123!`, `client@najurists.local` / `Client123!`, demo case `DM-001` linked to client.  
- **Frontend:** `AuthProvider`, protected routes, API client + token refresh, login + header + dashboard show role/email. Env: `VITE_API_URL` (default `http://localhost:4000`).  
- **Env:** Backend `JWT_ACCESS_SECRET` (min 16 chars), `ACCESS_TOKEN_EXPIRES_SEC` (default 900), `UPLOAD_DIR`, `MAX_UPLOAD_MB`. Copy `law-firm-portal/backend/.env.example` → `.env`. Run `npx prisma migrate dev` after pulling schema changes.

**Done (Phase 2):**  
- **Schema:** `Case` (+ `archived`), `CaseStatusHistory`, `Document`, `Notification`, `Message`, `Hearing`. Migration `phase2_core`.  
- **Admin API:** `/api/v1/admin/clients`, `/admin/cases` CRUD, assign/unassign, `POST .../status` (history + notify clients), document upload (`multipart/form-data` field `file`), hearings CRUD, `GET /admin/alerts/missing-upcoming-hearings`.  
- **Client API:** `/api/v1/me/cases`, `/me/cases/:id`, `/me/notifications`, mark read.  
- **Shared:** `/api/v1/cases/:caseId/messages` (GET/POST), `/cases/:caseId/documents` (GET), `/cases/:caseId/documents/:docId/file` (download).  
- **Storage:** local `UPLOAD_DIR` (default `./uploads`), `MAX_UPLOAD_MB`.  
- **Tests:** `backend/tests/phase2.integration.test.ts` (6 tests).  
- **Frontend:** `/cases`, `/cases/new`, `/cases/:caseId`, `/admin/alerts` (admin); header nav; `CaseDetailPage` with admin vs client sections. **Client notifications:** header bell dropdown (`ClientNotificationDropdown`); `/notifications` redirects to `/dashboard` (no standalone page).

**Phase 4 (2025-03-23):**  
- **CI:** `.github/workflows/law-firm-portal-ci.yml` — backend (migrate, seed, lint, test, build) + frontend (lint, build) on `law-firm-portal/**` changes.  
- **Docs:** `law-firm-portal/DEPLOYMENT.md` — env vars, CORS, build/run, production layout.

**Next:** Product tweaks (email notifications, realtime messaging, Postgres migration) or website workstream items.

**Supabase/Postgres migration prep (Executor, 2026-03-26):**  
- Prisma datasource switched to `postgresql` for Supabase compatibility (ObjectId-specific Mongo attributes removed).  
- Backend env/docs updated to use Postgres `DATABASE_URL` and Supabase deployment guidance.  
- CI backend job updated to start Postgres service and run `prisma db push` before tests/build.

**Mono local dev setup (Executor, 2026-03-27):**  
- Added root `dev:mono` script to run website + portal + backend behind one local proxy (`http://localhost:3000`).  
- Added `scripts/mono-proxy.mjs` path routing (`/` website, `/portal` portal, `/api/portal` backend).  
- Added portal `dev:mono` mode (`base=/portal`) and React router basename support.

**UI polish (2025-03-23, Executor):**  
- **Back to Dashboard:** `BackToDashboard` on cases list, new case, case detail (with “All cases”), Hearing alerts, Notifications.  
- **Footer:** `PortalFooter` — navy gradient aligned with main site footer language; portal links + main website link; copyright line (no “Client Portal” only).  
- **Typography / status:** Shared `formatCaseStatus()`; reference column matches body text weight; case subtitle `Ref: … · Status: …`; hearing alert cards use same pattern.  
- **Delete case:** Not in user stories (add/edit/update + **archive** only). Hard delete not implemented unless product adds it.

**Extended portal features (2025-03-23, Executor):**  
- **Forgot / reset password:** `POST /auth/forgot-password`, `POST /auth/reset-password`; tokens in `PasswordResetToken` (hashed); emails via SMTP when `EMAIL_ENABLED=true`.  
- **Email on status change:** `notifyAssignedClients` sends email after in-app notification (same SMTP rules).  
- **Cron:** `node-cron` daily (`CRON_SCHEDULE`, default 08:00) — digest to admins for matters missing upcoming hearings; upcoming-hearing reminders (7d + 24h windows) to clients + admins; deduped via `HearingReminder`.  
- **Dashboard API:** `GET /api/v1/me/dashboard`, `GET /api/v1/admin/dashboard` — live counts for portal dashboard.  
- **User management (admin):** `GET/POST/PATCH/DELETE /api/v1/admin/users`; `User.disabled` blocks login and API access.  
- **Migration:** `20260323191242_phase3_email_users_cron` — run `prisma migrate deploy` on all environments.

---

## Executor's Feedback or Assistance Requests

- **Client navbar (2025-03-23):** Removed Dashboard/Cases from top nav for `CLIENT`; bell icon opens dropdown listing `GET /api/v1/me/notifications` with mark-read and matter link. Admin nav unchanged. Footer client “Notifications” link removed; dashboard copy points to header bell. `npm run build` passed.
- **Supabase setup step complete (2026-03-26):** Schema/config switched back to Postgres-ready setup for Supabase. Next required step is setting real Supabase Postgres `DATABASE_URL` in backend env and running `prisma db push` + `prisma db seed`.
- **Main website link:** `VITE_MAIN_WEBSITE_URL` in portal `frontend/.env`.  
- **API URL:** `VITE_API_URL` must match backend.  
- `npm audit` may report high findings in Prisma transitive deps; review before `npm audit fix --force`.  
- `prisma generate` on Windows can rarely hit `EPERM` on query engine DLL; retry or close locking processes.

---

## Phase 1 seed credentials (local dev)

| Role   | Email                 | Password   |
|--------|-------------------------|------------|
| Admin  | `admin@najurists.local` | `Admin123!` |
| Client | `client@najurists.local` | `Client123!` |

---

## Lessons

- On Windows, `.docx` extraction: copy file to `.zip` then `Expand-Archive`, or use dedicated tooling — `Expand-Archive` does not accept `.docx` directly.
- Existing public site lives at repo root Next app; portal must stay a **sibling folder**, not under `src/app`, to avoid breaking builds.
- **Vite in a monorepo:** if `vite build` fails loading parent `postcss.config.mjs`, add a **local** `postcss.config.mjs` under the portal `frontend/` folder (e.g. `plugins: []`) so Tailwind’s Vite plugin is not combined with the root Next PostCSS setup.
- **jsonwebtoken + TypeScript:** `SignOptions.expiresIn` may reject `string` from env; use numeric seconds (`ACCESS_TOKEN_EXPIRES_SEC`) for `JwtPayload` compatibility.
- **Express 5 + Prisma:** `req.params` is typed as `string | string[]`; normalize with a small helper before Prisma `where: { id }`.
- **Multipart uploads:** do not set `Content-Type` manually when body is `FormData` (browser sets boundary).
- **Portal email:** with `EMAIL_ENABLED=false` (default), outbound email is logged to stdout — useful for dev/tests; production needs SMTP + `EMAIL_ENABLED=true`.
- **Password reset:** apply new Prisma migration so `PasswordResetToken` and `User.disabled` exist; set `APP_PUBLIC_URL` or rely on `FRONTEND_ORIGIN` for reset links.
- **Prisma + MongoDB:** use `prisma db push` (not `prisma migrate deploy`) and ensure all Prisma relation key fields are `@db.ObjectId` with IDs mapped via `@map("_id")`.
- **Prisma on Windows:** if `prisma generate` fails with `EPERM ... query_engine-windows.dll.node`, close running Node/ts-node processes using Prisma and retry (file lock issue).

---

## Document cross-reference (source of truth)

**Portal scope from User Stories:**

| # | Feature | Actor |
|---|---------|--------|
| 1 | User authentication | All |
| 2 | Full case/user management | Admin |
| 3 | Detailed view of own case(s) | Client |
| 4 | Add/edit/update cases | Admin |
| 5 | Case status updates | Admin → visible to client |
| 6 | Upload & access case documents | Admin upload; client access |
| 7 | Notifications on status change | Client |
| 8 | Secure messaging | Client ↔ firm |
| 9 | Alerts if hearing date missing; reminders for upcoming | Admin + Client |

**Website-only items** (from both docs): judgment text fixes, marketing copy, team roster — track under website workstream, not blocking portal folder creation.
