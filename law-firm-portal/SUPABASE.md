# Law firm portal on Supabase (no Node API)

The portal **frontend** talks directly to **Supabase Auth**, **Postgres (RLS)**, and **Storage**. The old Express backend in `backend/` is optional for local experiments only.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com). Note **Project URL** and **anon key** (Settings → API).

## 2. Run the SQL migration

Open **SQL Editor** and run the file:

`supabase/migrations/20260328120000_portal_core.sql`

Or use the CLI: `supabase db push` (with project linked).

If triggers fail on `EXECUTE FUNCTION`, try `EXECUTE PROCEDURE` instead (Postgres version differences).

## 3. First admin user

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

Set secrets (Dashboard → Edge Functions → Secrets, or CLI). Supabase usually injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically; you must add:

- **`SUPABASE_SERVICE_ROLE_KEY`** — **service_role** key (never expose to the browser)

## 5. Frontend environment

In `frontend/.env.local` (or Vercel env vars):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

`frontend/.env.production` in the repo is a template — replace with your real values before deploy.

## 6. Auth email templates

Configure **Authentication → URL configuration** (site URL) and **email templates** so password reset links point to your deployed portal (e.g. `https://your-app.vercel.app/reset-password`).

## 7. Storage

Migration creates private bucket `case-files`. Policies allow admins to upload and assigned users + admins to download via signed URLs (handled in the app).

## Data migration from old Postgres

If you had data in the Prisma database, export/import tables into the new Supabase schema (UUID user ids must match `auth.users`). There is no automated script in this repo yet.
