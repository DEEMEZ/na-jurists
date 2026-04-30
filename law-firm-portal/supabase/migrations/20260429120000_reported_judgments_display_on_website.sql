-- Portal-controlled visibility on the marketing site (parity with cases.display_on_website).
-- Hidden rows: anon cannot read full record; site loader uses RPC for integer ids only to omit static JSON entries.

ALTER TABLE public.reported_judgments
  ADD COLUMN IF NOT EXISTS display_on_website BOOLEAN NOT NULL DEFAULT TRUE;

DROP POLICY IF EXISTS reported_judgments_select_public ON public.reported_judgments;

CREATE POLICY reported_judgments_select_anon_published
  ON public.reported_judgments
  FOR SELECT
  TO anon
  USING (display_on_website = TRUE);

CREATE POLICY reported_judgments_select_authenticated
  ON public.reported_judgments
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR display_on_website = TRUE);

CREATE OR REPLACE FUNCTION public.reported_judgments_hidden_ids()
RETURNS TABLE (id INTEGER)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rj.id FROM public.reported_judgments rj WHERE rj.display_on_website = FALSE;
$$;

REVOKE ALL ON FUNCTION public.reported_judgments_hidden_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reported_judgments_hidden_ids() TO anon, authenticated;
