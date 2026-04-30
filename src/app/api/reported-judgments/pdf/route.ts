import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { loadReportedJudgments, type ReportedJudgmentRecord } from '@/lib/reportedJudgmentsData';

export const runtime = 'nodejs';

/** Normalize text so PDF built-in fonts don’t throw on common Unicode punctuation. */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u200b\uFEFF]/g, '');
}

function judgmentToPdfBuffer(j: ReportedJudgmentRecord): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: j.citation,
        Author: 'N&A Jurists',
      },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;

    doc.fontSize(11).font('Helvetica-Bold').text('N&A Jurists — Reported judgment', { underline: true });
    doc.moveDown(0.75);
    doc.fontSize(10).font('Helvetica-Bold').text(`Citation: ${sanitizeForPdf(j.citation)}`, { width: pageWidth });
    doc.font('Helvetica').text(`Court: ${sanitizeForPdf(j.court)}`, { width: pageWidth });
    doc.text(`Case number: ${sanitizeForPdf(j.caseNumber)}`, { width: pageWidth });
    doc.text(`Date: ${sanitizeForPdf(j.date)}`, { width: pageWidth });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Parties', { width: pageWidth });
    doc.font('Helvetica').text(
      `${sanitizeForPdf(j.parties.petitioner)} v. ${sanitizeForPdf(j.parties.respondent)}`,
      { width: pageWidth }
    );
    if (j.judges?.length) {
      doc.moveDown(0.35);
      doc.font('Helvetica-Bold').text('Judges', { width: pageWidth });
      doc.font('Helvetica').text(j.judges.map((x) => sanitizeForPdf(x)).join('; '), { width: pageWidth });
    }
    doc.moveDown(0.75);
    doc.font('Helvetica-Bold').text('Full text', { width: pageWidth });
    doc.moveDown(0.35);
    doc.font('Helvetica').fontSize(9);
    doc.text(sanitizeForPdf(j.fullText), {
      width: pageWidth,
      align: 'left',
      lineGap: 2,
    });
    doc.end();
  });
}

export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get('id');
  const numericId = idParam != null ? Number(idParam) : NaN;

  if (!Number.isFinite(numericId) || numericId < 1) {
    return NextResponse.json({ error: 'Valid id query parameter is required.' }, { status: 400 });
  }

  try {
    const judgments = await loadReportedJudgments();
    const found = judgments.find((item) => item.id === numericId);
    if (!found) {
      return NextResponse.json({ error: 'Judgment not found.' }, { status: 404 });
    }

    const buffer = await judgmentToPdfBuffer(found);
    const safeName = `judgment-${found.id}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (e) {
    console.error('[api/reported-judgments/pdf]', e);
    return NextResponse.json(
      { error: 'Failed to generate PDF.', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
