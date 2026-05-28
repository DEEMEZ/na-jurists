import { catalogSerialForPdfFile, stakeholderJudgmentPdfHref } from '@/lib/stakeholderJudgmentPdf';

/**
 * URL opened for judgment PDFs (Legal Resources table).
 * Catalog rows use static files under `/reported-judgement-pdfs/{id}.pdf` (same as the public judgments table).
 */
export function getJudgmentPdfPublicUrl(pdfFile: string): string | null {
  const serial = catalogSerialForPdfFile(pdfFile);
  if (serial != null) {
    return stakeholderJudgmentPdfHref(serial);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    const base = pdfFile.replace(/\.pdf$/i, '');
    const path = `na-jurists/judgments/${base}`;
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${encodeURI(path)}`;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  return `/api/judgments/pdf?file=${encodeURIComponent(pdfFile)}`;
}
