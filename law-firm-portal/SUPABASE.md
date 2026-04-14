# Law firm portal on Supabase (no Node API)

The portal **frontend** talks directly to **Supabase Auth**, **Postgres (RLS)**, and **Storage**. The old Express backend in `backend/` is optional for local experiments only.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com). Note **Project URL** and **anon key** (Settings → API).

## 2. Run the SQL migration

Open **SQL Editor** and run the file:

`supabase/migrations/20260328120000_portal_core.sql`

Or use the CLI: `supabase db push` (with project linked).

If triggers fail on `EXECUTE FUNCTION`, try `EXECUTE PROCEDURE` instead (Postgres version differences).

**Public website (`/api/cases`) without `service_role` on Vercel:** after the core migration, run **`supabase/migrations/20260410180000_cases_public_website_anon_read.sql`** in the SQL Editor (or append to your push). It lets the **anon** key read only rows with `display_on_website = true` and `archived = false`. The Next.js app then uses **`NEXT_PUBLIC_SUPABASE_URL`** + **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** from committed `.env.production` — no extra Vercel secrets required for that feature.

## 3. First admin user

### Option A — from this repo (script)

1. Copy `law-firm-portal/scripts/seed-admin.env.example` → `law-firm-portal/scripts/seed-admin.env` (this file is gitignored).
2. Fill in:
   - `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` — **Legacy** API key `service_role` (never commit it; never use in the browser)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (password ≥ 8 characters)
3. Run **after** the SQL migration has been applied (so `profiles` + trigger exist):

```bash
cd law-firm-portal/frontend
npm run seed:admin
```

If the email already exists in Auth, the script tries to set `profiles.role` to `ADMIN` only.

### Option B — Supabase Dashboard

1. **Authentication → Users → Add user** (email + password).
2. In SQL Editor:

```sql
UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## 4. Edge function (admin user create / delete / password / email)

The UI calls `portal-admin-users` for actions that need the **service role**.

```bash
cd law-firm-portal
supabase functions deploy portal-admin-users
```

Set secrets (Dashboard → Edge Functions → Secrets, or CLI). Supabase usually injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically.

You must add the **service_role** JWT (never expose to the browser):

- **Dashboard:** the UI does **not** allow secret names starting with `SUPABASE_`. Add **`SERVICE_ROLE_KEY`** and paste the same value as **Legacy → service_role** in **Settings → API**.
- **CLI:** `npx supabase secrets set SERVICE_ROLE_KEY=eyJ...` (or `SUPABASE_SERVICE_ROLE_KEY=...` if your CLI allows it).

The function reads **`SERVICE_ROLE_KEY` first**, then falls back to **`SUPABASE_SERVICE_ROLE_KEY`**.

**401 “Invalid JWT” on invoke (but login and `/rest` work):** The Edge **gateway** can reject tokens when your project uses **new JWT signing keys (e.g. ES256)**. This repo sets **`verify_jwt = false`** for `portal-admin-users` in `supabase/config.toml` and relies on **`auth.getUser()` + ADMIN check inside the function**. Redeploy after changing config:

`npx supabase functions deploy portal-admin-users --use-api`

### Client email alerts (status / messages / hearings)

When an **admin** updates matter status, posts a **message**, or adds a **hearing**, the app invokes the **`portal-notify-email`** Edge Function so assigned **clients** can get an email (in addition to in-app notifications where applicable).

1. Deploy:

   ```bash
   npx supabase functions deploy portal-notify-email --use-api
   ```

2. Secrets (same project as `portal-admin-users`):

   - **`SERVICE_ROLE_KEY`** (or `SUPABASE_SERVICE_ROLE_KEY`) — required; used to load recipients and resolve email (`profiles.email`, or **`auth.users` email** if the profile row has no email yet).
   - **Email provider (first match wins):**
     1. **Gmail (SMTP + app password)** — no domain DNS. Secrets: **`GMAIL_SMTP_USER`** (full Gmail, e.g. `you@gmail.com`) and **`GMAIL_APP_PASSWORD`** (16-character app password, spaces optional). Optional **`NOTIFY_EMAIL_FROM`**: use the **same** Gmail in `Name <you@gmail.com>` for a display name; if the address differs, the function still sends **from** the Gmail account. **Limits / ToS** apply; fine for short-term testing.
     2. **`BREVO_API_KEY`** — [Brevo](https://www.brevo.com) transactional API. Used if Gmail is not configured.
     3. **`RESEND_API_KEY`** — [Resend](https://resend.com). Used if neither Gmail nor Brevo is set.
   - If **none** of the above is set, the function returns `{ ok: true, skipped: true }` and the portal logs a console warning.
   - **`NOTIFY_EMAIL_FROM`** / **`EMAIL_FROM`** — required for Brevo/Resend; for Gmail, should match **`GMAIL_SMTP_USER`** if you want a custom display name in `Name <email>` form.

   **Gmail app password (quick setup):** Google Account → **Security** → enable **2-Step Verification** → **App passwords** → create one for “Mail” / “Other” → copy the 16-character password into **`GMAIL_APP_PASSWORD`** (never commit it). Add **`GMAIL_SMTP_USER`** and secrets in Supabase → redeploy **`portal-notify-email`**.

`verify_jwt` is **false** in `supabase/config.toml` for this function; the handler still requires a valid **Bearer** token and **`profiles.role === 'ADMIN'`**.

**Troubleshooting — clients get in-app notifications but no email**

1. Confirm **`portal-notify-email`** is **deployed** to the same Supabase project as the portal (`Edge Functions` in the dashboard should list it).
2. **Secrets:** `SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) and **`RESEND_API_KEY`** must be set under **Edge Functions → Secrets** (then redeploy the function if you just added them).
3. While logged in as **admin**, open the browser **Console**, trigger a status update or message to a **client** — look for `[portal-notify-email]` lines (skipped / Resend error / forbidden).
4. **Supabase → Edge Functions → portal-notify-email → Logs** for server-side errors (e.g. Resend `422` if `from` domain is not verified).
5. Emails only go to users with **`profiles.role = 'CLIENT'`** who are **assigned** to the matter (and not `disabled`).
6. **`NOTIFY_EMAIL_FROM`** must use an address/domain **verified in the Resend dashboard** (same domain as in Resend → Domains). A mismatch often returns a Resend error; after redeploying the function, trigger an email and read **`detail`** in the browser console (`[portal-notify-email] invoke failed: …`) or in function logs.
7. **Resend “To” always shows one address (e.g. your Gmail):** the app sends to whatever email is on the **assigned client** (`profiles.email` / `auth.users.email` for that `user_id` in `case_assignments`). If every matter is assigned to the same test client, or that client’s profile uses your Gmail, Resend will only show that inbox. Fix: create **separate client users** (each with the client’s real email), assign the matter to **that** client in the portal, then trigger again. Check **Edge Function logs** for `recipient resolved` → `toEmail` after redeploy.

## 5. Frontend environment

In `frontend/.env.local` (or Vercel env vars):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

`frontend/.env.production` in the repo is a template — replace with your real values before deploy.

## 6. Public client signup & auth email

1. **Authentication → Providers → Email:** turn **“Confirm email”** **OFF** so sign-up does **not** send a confirmation link and users can sign in immediately (matches current app UX). Keep **“Allow new users to sign up”** **ON** if you use **Create an account** on the portal.   - Local CLI: `law-firm-portal/supabase/config.toml` sets `[auth.email] enable_confirmations = false` for `supabase start` only; **hosted** projects must use this dashboard toggle.
2. **Authentication → URL configuration:** set **Site URL** to your portal origin (e.g. `http://localhost:5173` in dev, production URL when deployed). Under **Redirect URLs**, add those origins so **password reset** links work (`…/reset-password`).
3. The **Sign in** screen includes **Create an account** — new users get a **CLIENT** profile via the `handle_new_user` trigger. Use the **same email** you want for **portal notification and message emails** (Resend + `portal-notify-email`).

## 7. Email templates & session

Configure **email templates** so password reset links point to your deployed portal (e.g. `https://your-app.vercel.app/reset-password`).

**JWT lifetime:** In **Authentication → Settings** (or **Project Settings → API**), the default access token lifetime is **not** one minute. If sessions feel short, check **JWT expiry** / **Time-boxed sessions** in the dashboard — the portal uses `autoRefreshToken: true` in code; very short expiry must be relaxed in Supabase, not only in the app.

## 8. Storage

Migration creates private bucket `case-files`. Policies allow admins to upload and assigned users + admins to download via signed URLs (handled in the app).

## Data migration from old Postgres

If you had data in the Prisma database, export/import tables into the new Supabase schema (UUID user ids must match `auth.users`). There is no automated script in this repo yet.
