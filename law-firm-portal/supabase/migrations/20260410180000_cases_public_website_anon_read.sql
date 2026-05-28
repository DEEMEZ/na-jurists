-- Public marketing site (/api/cases) can use the Supabase anon key (no service_role on the host).
-- Anon may only read non-archived rows explicitly marked for the website.
CREATE POLICY cases_select_public_website
  ON public.cases
  FOR SELECT
  TO anon
  USING (display_on_website = true AND archived = false);
