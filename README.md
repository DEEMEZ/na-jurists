# N&A Jurists — website + law firm portal

Public marketing site (Next.js) with an embedded client portal (Vite + Supabase).

## Clone (smaller download)

```bash
git clone --depth 1 -b basit https://github.com/DEEMEZ/na-jurists.git
cd na-jurists
npm install
cd law-firm-portal/frontend && npm install && cd ../..
```

## Environment

Secrets are **not** in git. Copy templates and fill in your Supabase project:

```bash
cp .env.example .env.local
cp .env.example .env.production.local
cp law-firm-portal/frontend/.env.example law-firm-portal/frontend/.env.local
```

Set at minimum:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (website + `/api/cases` merge)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (portal frontend)
- Optional server-only: `SUPABASE_SERVICE_ROLE_KEY` (PDF streaming, admin scripts)

On Vercel, add the same variables in the project dashboard.

Apply SQL migrations from `law-firm-portal/supabase/migrations/` in order (Supabase SQL editor or CLI).

## Development

```bash
npm run dev:with-portal
```

- Website: http://localhost:3000  
- Portal: http://localhost:5173 (or `/portal` after production build)

## Reported judgments PDFs

The site serves catalog PDFs from `public/reported-judgement-pdfs/` (committed).  
Original Word/PDF sources in `Reported Judgements/` are local-only (not in git). To regenerate PDFs from sources:

```bash
node scripts/sync-reported-judgement-pdfs.mjs
```

## Civil cases import

Place `Civil Courts cases list.docx` in the repo root (local), then:

```bash
npm run import:civil-cases
```

Data is written to `public/data/cases.json` (committed).

## Production build

```bash
npm run build
```

Portal is built into `public/portal/` via `scripts/run-portal-build.mjs`.
