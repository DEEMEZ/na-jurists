import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import {
  catalogSerialForPdfFile,
  readStakeholderJudgmentPdf,
} from '@/lib/stakeholderJudgmentPdf';
import { isAllowedReportedJudgmentPdf } from '@/lib/reportedJudgmentPdfAllowlist';

function pdfResponse(body: Uint8Array, fileName: string) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}

/** Legacy `/api/judgments/pdf?file=…` — serve catalog PDFs from `public/`, not Supabase. */
export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file')?.trim() ?? '';

  if (!file || !isAllowedReportedJudgmentPdf(file)) {
    return NextResponse.json(
      { error: 'Invalid or unknown judgment file.', hint: file ? undefined : 'Missing file query parameter.' },
      { status: 400 },
    );
  }

  const serial = catalogSerialForPdfFile(file);
  if (serial != null) {
    const publicRoot = path.resolve(process.cwd(), 'public');
    const buf = await readStakeholderJudgmentPdf(publicRoot, serial);
    if (buf) {
      return pdfResponse(new Uint8Array(buf), `${serial}.pdf`);
    }
    return NextResponse.json(
      {
        error: 'PDF not found.',
        detail: `Missing public/reported-judgement-pdfs/${serial}.pdf`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      error: 'PDF not found.',
      detail: 'Use /reported-judgement-pdfs/{serial}.pdf or /api/reported-judgments/pdf?id=…',
    },
    { status: 404 },
  );
}
