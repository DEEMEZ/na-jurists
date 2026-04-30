import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedReportedJudgmentPdf } from '@/lib/reportedJudgmentPdfAllowlist';

const BUCKET = 'reportedjudgements';

function pdfResponse(body: Blob, fileName: string) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file')?.trim() ?? '';

  if (!file || !isAllowedReportedJudgmentPdf(file)) {
    return NextResponse.json(
      { error: 'Invalid or unknown judgment file.', hint: file ? undefined : 'Missing file query parameter.' },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: 'Server missing NEXT_PUBLIC_SUPABASE_URL.' },
      { status: 503 }
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.storage.from(BUCKET).download(file);

    if (!error && data) {
      return pdfResponse(data, file);
    }

    console.error('[api/judgments/pdf] service download failed', file, error?.message);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(file)}`;
  const upstream = await fetch(publicUrl, { next: { revalidate: 60 } });

  if (upstream.ok) {
    const buf = await upstream.blob();
    return pdfResponse(buf, file);
  }

  const errText = await upstream.text().catch(() => '');
  console.error('[api/judgments/pdf] public fetch failed', publicUrl, upstream.status, errText.slice(0, 200));

  return NextResponse.json(
    {
      error: 'PDF not found.',
      detail:
        'Create the Storage bucket `reportedjudgements`, apply the migration in law-firm-portal/supabase/migrations, upload PDFs (e.g. scripts/upload-to-supabase.js), and set SUPABASE_SERVICE_ROLE_KEY in .env.local for local proxy access.',
      status: upstream.status,
    },
    { status: 404 }
  );
}
