import 'server-only';

import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { CATALOG_PDF_ID_MAX } from '@/lib/stakeholderJudgmentPdf';

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
