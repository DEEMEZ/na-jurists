-- Court & subject for portal matters, shown on public website when display_on_website is true.
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS court TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT;
