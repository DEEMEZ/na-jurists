-- Marketing site "Our Team" / Leadership: portal admins manage rows; public site reads via anon key + RLS.

CREATE TABLE public.website_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('founder', 'member')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  image_key TEXT,
  delay_ms INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX website_team_members_section_sort_idx
  ON public.website_team_members (section, sort_order);

ALTER TABLE public.website_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY website_team_members_select_public
  ON public.website_team_members
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY website_team_members_insert_admin
  ON public.website_team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY website_team_members_update_admin
  ON public.website_team_members
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY website_team_members_delete_admin
  ON public.website_team_members
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
