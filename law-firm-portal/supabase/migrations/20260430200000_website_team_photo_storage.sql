-- Uploaded photos for website team (portal admin upload; public read via anon).

ALTER TABLE public.website_team_members
  ADD COLUMN IF NOT EXISTS photo_storage_path TEXT;

COMMENT ON COLUMN public.website_team_members.photo_storage_path IS
  'Path in storage bucket website-team; public URL used on marketing site when set.';

INSERT INTO storage.buckets (id, name, public)
VALUES ('website-team', 'website-team', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read website-team objects" ON storage.objects;
CREATE POLICY "Public read website-team objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'website-team');

DROP POLICY IF EXISTS "Admin insert website-team objects" ON storage.objects;
CREATE POLICY "Admin insert website-team objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'website-team'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admin update website-team objects" ON storage.objects;
CREATE POLICY "Admin update website-team objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'website-team' AND public.is_admin())
  WITH CHECK (bucket_id = 'website-team' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete website-team objects" ON storage.objects;
CREATE POLICY "Admin delete website-team objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'website-team' AND public.is_admin());
