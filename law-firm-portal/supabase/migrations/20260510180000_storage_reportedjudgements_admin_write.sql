-- Portal admins upload judgment PDFs to bucket `reportedjudgements` (public read already exists).

DROP POLICY IF EXISTS "Admin insert reportedjudgements objects" ON storage.objects;
CREATE POLICY "Admin insert reportedjudgements objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reportedjudgements'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admin update reportedjudgements objects" ON storage.objects;
CREATE POLICY "Admin update reportedjudgements objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'reportedjudgements' AND public.is_admin())
  WITH CHECK (bucket_id = 'reportedjudgements' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete reportedjudgements objects" ON storage.objects;
CREATE POLICY "Admin delete reportedjudgements objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'reportedjudgements' AND public.is_admin());
