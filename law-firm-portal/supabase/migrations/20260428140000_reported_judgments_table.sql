-- Website reported judgments: portal admins upsert JSON rows; public site merges these over static JSON.
-- Anon read matches marketing site pattern (anon key + RLS); writes restricted to admins.

CREATE TABLE public.reported_judgments (
  id INTEGER PRIMARY KEY,
  record JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reported_judgments_updated_at_idx ON public.reported_judgments (updated_at DESC);

ALTER TABLE public.reported_judgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY reported_judgments_select_public
  ON public.reported_judgments
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY reported_judgments_insert_admin
  ON public.reported_judgments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY reported_judgments_update_admin
  ON public.reported_judgments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY reported_judgments_delete_admin
  ON public.reported_judgments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
