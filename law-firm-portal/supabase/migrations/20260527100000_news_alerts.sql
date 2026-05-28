-- News & Alerts: admin-posted PDFs shown on the public website.
-- Admins post a headline + organization + PDF; public site lists them newest-first.

CREATE TABLE public.news_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline     TEXT NOT NULL,
  organization TEXT NOT NULL,
  pdf_url      TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX news_alerts_published_at_idx ON public.news_alerts (published_at DESC);

ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated) can read all rows
CREATE POLICY news_alerts_select_public
  ON public.news_alerts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert / update / delete
CREATE POLICY news_alerts_insert_admin
  ON public.news_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY news_alerts_update_admin
  ON public.news_alerts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY news_alerts_delete_admin
  ON public.news_alerts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Storage bucket for news PDF uploads (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-alerts', 'news-alerts', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read news-alerts objects" ON storage.objects;
CREATE POLICY "Public read news-alerts objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'news-alerts');

DROP POLICY IF EXISTS "Admin insert news-alerts objects" ON storage.objects;
CREATE POLICY "Admin insert news-alerts objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news-alerts' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update news-alerts objects" ON storage.objects;
CREATE POLICY "Admin update news-alerts objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'news-alerts' AND public.is_admin())
  WITH CHECK (bucket_id = 'news-alerts' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete news-alerts objects" ON storage.objects;
CREATE POLICY "Admin delete news-alerts objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'news-alerts' AND public.is_admin());
