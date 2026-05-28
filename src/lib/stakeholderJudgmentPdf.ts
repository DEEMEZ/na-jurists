import { reportedJudgmentsList } from '@/data/reportedJudgmentsList';

export const CATALOG_PDF_ID_MAX = 69;

/** Public URL for catalog PDFs (served from `public/reported-judgement-pdfs/`). Safe for client components. */
export function stakeholderJudgmentPdfHref(id: number): string | null {
  if (id < 1 || id > CATALOG_PDF_ID_MAX) return null;
  return `/reported-judgement-pdfs/${id}.pdf`;
}

/** Map legacy bundled storage filenames (e.g. `66,67,68,69.pdf`) to catalog serial. */
export function catalogSerialForPdfFile(pdfFile: string): number | null {
  const normalized = pdfFile.trim();
  const row = reportedJudgmentsList.find((j) => j.pdfFile === normalized);
  return row?.srNo ?? null;
}
