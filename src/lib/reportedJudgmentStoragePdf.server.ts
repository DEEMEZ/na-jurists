import 'server-only';

import { createClient } from '@supabase/supabase-js';

/** Parse a Supabase public storage URL into bucket + object path. */
export function parseSupabasePublicStorageUrl(
  url: string,
): { bucket: string; objectPath: string } | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!match) return null;
    return { bucket: match[1], objectPath: decodeURIComponent(match[2]) };
  } catch {
    return null;
  }
}

/** Download a portal-uploaded PDF via service role (works when public URL DNS/CDN fails). */
export async function downloadReportedJudgmentFromStorage(
  pdfUrl: string,
): Promise<Buffer | null> {
  const parsed = parseSupabasePublicStorageUrl(pdfUrl);
  if (!parsed) return null;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ??
    process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.storage.from(parsed.bucket).download(parsed.objectPath);
  if (error || !data) {
    console.error('[reportedJudgmentStoragePdf] download', parsed.bucket, parsed.objectPath, error?.message);
    return null;
  }
  return Buffer.from(await data.arrayBuffer());
}

/** Generic alias: download any Supabase public-storage file server-side (any bucket) so it can be proxied + cached via Vercel. */
export const downloadSupabaseStorageFile = downloadReportedJudgmentFromStorage;
