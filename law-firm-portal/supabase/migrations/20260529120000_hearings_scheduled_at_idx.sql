-- Speed up upcoming-hearings queries filtered by scheduled_at (admin 30-day list).
CREATE INDEX IF NOT EXISTS hearings_scheduled_at_idx ON public.hearings (scheduled_at);
