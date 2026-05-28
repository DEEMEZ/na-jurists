import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { loadReportedJudgments, type ReportedJudgmentRecord } from '@/lib/reportedJudgmentsData';
import { downloadReportedJudgmentFromStorage } from '@/lib/reportedJudgmentStoragePdf.server';
import { CATALOG_PDF_ID_MAX } from '@/lib/stakeholderJudgmentPdf';
import { readStakeholderJudgmentPdf } from '@/lib/stakeholderJudgmentPdf.server';

export const runtime = 'nodejs';

type JudgmentFileKind = 'pdf' | 'docx' | 'doc' | 'unknown';

function fileKindFromUrlOrPath(ref: string): JudgmentFileKind {
  const base = ref.split('?')[0].toLowerCase();
  if (base.endsWith('.docx')) return 'docx';
  if (base.endsWith('.doc')) return 'doc';
  if (base.endsWith('.pdf')) return 'pdf';
  return 'unknown';
}

function mimeTypeForKind(kind: JudgmentFileKind, upstream?: string | null): string {
  if (kind === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (kind === 'doc') return 'application/msword';
  if (kind === 'pdf') return 'application/pdf';
  const u = upstream?.split(';')[0]?.trim();
  if (u && u !== 'application/octet-stream') return u;
  return 'application/octet-stream';
}

function downloadFileName(id: number, kind: JudgmentFileKind): string {
  if (kind === 'docx') return `judgment-${id}.docx`;
  if (kind === 'doc') return `judgment-${id}.doc`;
  return `judgment-${id}.pdf`;
}

function pdfResponse(buf: Buffer, fileName: string, inline = true) {
  const disposition = inline ? 'inline' : 'attachment';
  return new NextResponse(new Blob([new Uint8Array(buf)], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${fileName}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}

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

    const safeName = `judgment-${found.id}.pdf`;
    const publicRoot = path.resolve(process.cwd(), 'public');

    /** Catalog PDFs: only `public/reported-judgement-pdfs/{id}.pdf` — never Supabase. */
    if (found.id >= 1 && found.id <= CATALOG_PDF_ID_MAX) {
      const buf = await readStakeholderJudgmentPdf(publicRoot, found.id);
      if (buf) {
        return pdfResponse(buf, safeName, true);
      }
      return NextResponse.json(
        {
          error: 'PDF file not found on server.',
          detail: `Missing public/reported-judgement-pdfs/${found.id}.pdf`,
        },
        { status: 404 },
      );
    }

    /** Same-origin PDF path (under /public) or remote URL for non-catalog rows only. */
    if (typeof found.pdfUrl === 'string' && found.pdfUrl.trim().length > 0) {
      const pdfUrl = found.pdfUrl.trim();

      if (pdfUrl.startsWith('/')) {
        const rel = pdfUrl.replace(/^\/+/, '');
        const filePath = path.resolve(publicRoot, rel);
        const relToPublic = path.relative(publicRoot, filePath);
        if (relToPublic.startsWith('..') || path.isAbsolute(relToPublic)) {
          return NextResponse.json({ error: 'Invalid pdf path.' }, { status: 400 });
        }
        try {
          const buf = await fs.readFile(filePath);
          return pdfResponse(buf, safeName, true);
        } catch (err) {
          console.error('[api/reported-judgments/pdf] local file', filePath, err);
          return NextResponse.json(
            {
              error: 'Could not read PDF file.',
              detail: err instanceof Error ? err.message : String(err),
            },
            { status: 502 },
          );
        }
      }

      if (pdfUrl.includes('supabase.co')) {
        const stored = await downloadReportedJudgmentFromStorage(pdfUrl);
        if (stored) {
          return pdfResponse(stored, safeName, true);
        }
      }

      let upstream: Response;
      try {
        upstream = await fetch(pdfUrl, {
          cache: 'no-store',
          headers: { Accept: 'application/pdf,*/*' },
        });
      } catch (err) {
        console.error('[api/reported-judgments/pdf] upstream fetch', pdfUrl.slice(0, 120), err);
        return NextResponse.json(
          {
            error: 'Could not retrieve PDF from storage.',
            detail: err instanceof Error ? err.message : String(err),
          },
          { status: 502 },
        );
      }
      if (!upstream.ok) {
        return NextResponse.json(
          { error: 'PDF storage returned an error.', detail: String(upstream.status) },
          { status: 502 },
        );
      }
      const buf = Buffer.from(await upstream.arrayBuffer());
      return pdfResponse(buf, safeName, true);
    }

    const buffer = await judgmentToPdfBuffer(found);

    return pdfResponse(buffer, safeName, true);
  } catch (e) {
    console.error('[api/reported-judgments/pdf]', e);
    return NextResponse.json(
      { error: 'Failed to generate PDF.', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
