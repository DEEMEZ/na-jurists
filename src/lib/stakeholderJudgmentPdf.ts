import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { reportedJudgmentsList } from '@/data/reportedJudgmentsList';

export const CATALOG_PDF_ID_MAX = 69;

/** Public URL for catalog PDFs (served from `public/reported-judgement-pdfs/` on Vercel). */
export function stakeholderJudgmentPdfHref(id: number): string | null {
  if (id < 1 || id > CATALOG_PDF_ID_MAX) return null;
  return `/reported-judgement-pdfs/${id}.pdf`;
}

export function stakeholderJudgmentPdfPath(publicRoot: string, id: number): string {
  return path.join(publicRoot, 'reported-judgement-pdfs', `${id}.pdf`);
}

export async function readStakeholderJudgmentPdf(
  publicRoot: string,
  id: number,
): Promise<Buffer | null> {
  if (id < 1 || id > CATALOG_PDF_ID_MAX) return null;
  const filePath = stakeholderJudgmentPdfPath(publicRoot, id);
  if (!existsSync(filePath)) return null;
  return fs.readFile(filePath);
}

/** Map legacy bundled storage filenames (e.g. `66,67,68,69.pdf`) to catalog serial. */
export function catalogSerialForPdfFile(pdfFile: string): number | null {
  const normalized = pdfFile.trim();
  const row = reportedJudgmentsList.find((j) => j.pdfFile === normalized);
  return row?.srNo ?? null;
}
