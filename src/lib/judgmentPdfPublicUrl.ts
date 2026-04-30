/**
 * URL opened in the browser for judgment PDFs (Legal Resources table).
 * - Cloudinary: direct raw URL when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set.
 * - Supabase: same-origin `/api/judgments/pdf` so PDFs work with the service role and/or
 *   after the `reportedjudgements` bucket is created and files are uploaded (avoids broken public URLs when the bucket is missing).
 */
export function getJudgmentPdfPublicUrl(pdfFile: string): string | null {
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
