import { NextRequest, NextResponse } from 'next/server';
import { loadNewsAlertById } from '@/lib/newsAlertsData';
import { downloadSupabaseStorageFile } from '@/lib/reportedJudgmentStoragePdf.server';

export const runtime = 'nodejs';

/**
 * Proxy a news/liquidation PDF through Vercel instead of linking the raw Supabase
 * public URL. The file is pulled from Supabase once, then Vercel's CDN serves all
 * repeats — keeping Supabase "Cached Egress" near zero. Falls back to the original
 * URL if the server-side download isn't possible.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ error: 'id query parameter is required.' }, { status: 400 });
  }

  const item = await loadNewsAlertById(id);
  if (!item?.pdf_url) {
    return NextResponse.json({ error: 'PDF not found.' }, { status: 404 });
  }

  const buf = await downloadSupabaseStorageFile(item.pdf_url);
  if (!buf) {
    /** Non-Supabase host or missing service key — send the client to the source directly. */
    return NextResponse.redirect(item.pdf_url, 302);
  }

  const download = request.nextUrl.searchParams.get('download') === '1';
  return new NextResponse(new Blob([new Uint8Array(buf)], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="news-${id}.pdf"`,
      'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800, immutable',
    },
  });
}
