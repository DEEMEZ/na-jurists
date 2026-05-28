-- Liquidation update: add body_text + link_url to news_alerts,
-- and create liquidation_organizations table.

ALTER TABLE public.news_alerts
  ADD COLUMN IF NOT EXISTS body_text TEXT,
  ADD COLUMN IF NOT EXISTS link_url  TEXT;

-- Organizations that are undergoing liquidation by N&A Jurists.
CREATE TABLE IF NOT EXISTS public.liquidation_organizations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.liquidation_organizations ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated) can read all org rows
CREATE POLICY liquidation_orgs_select_public
  ON public.liquidation_organizations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert / update / delete
CREATE POLICY liquidation_orgs_insert_admin
  ON public.liquidation_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY liquidation_orgs_update_admin
  ON public.liquidation_organizations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY liquidation_orgs_delete_admin
  ON public.liquidation_organizations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
