-- Public bucket for marketing site "Reported Judgments" PDFs (/judgments).
-- After applying: upload files from `Reported Judgements PDF` via `node scripts/upload-to-supabase.js` (service role in .env.local).

INSERT INTO storage.buckets (id, name, public)
VALUES ('reportedjudgements', 'reportedjudgements', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read reportedjudgements objects" ON storage.objects;
CREATE POLICY "Public read reportedjudgements objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'reportedjudgements');
