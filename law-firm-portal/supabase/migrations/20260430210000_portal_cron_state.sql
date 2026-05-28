-- Dedupe server-side hearing-alert digest emails (once per UTC calendar day after a successful send).

CREATE TABLE IF NOT EXISTS public.portal_cron_state (
  job_key TEXT PRIMARY KEY,
  last_sent_on DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.portal_cron_state IS 'Cron job dedupe (Edge Functions use service role; RLS blocks normal JWT access).';

ALTER TABLE public.portal_cron_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS portal_cron_state_deny_authenticated ON public.portal_cron_state;

CREATE POLICY portal_cron_state_deny_authenticated ON public.portal_cron_state
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);
