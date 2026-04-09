-- Portal cases: optional visibility on public marketing site (/api/cases merge).
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS display_on_website BOOLEAN NOT NULL DEFAULT FALSE;
