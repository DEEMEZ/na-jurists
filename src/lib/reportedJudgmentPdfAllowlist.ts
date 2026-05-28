import { reportedJudgmentsList } from '@/data/reportedJudgmentsList';

export const REPORTED_JUDGMENT_PDF_FILES = new Set(
  reportedJudgmentsList
    .map((j) => j.pdfFile)
    .filter((f): f is string => Boolean(f))
);

export function isAllowedReportedJudgmentPdf(file: string): boolean {
  return REPORTED_JUDGMENT_PDF_FILES.has(file);
}
