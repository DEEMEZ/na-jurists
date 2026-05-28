/**
 * Converts DOCX in `Reported Judgements/` (repo root) with LibreOffice when available,
 * copies every PDF to `public/reported-judgement-pdfs/{id}.pdf`, and sets `pdfUrl` on
 * each row in `public/data/reported-judgments.json` (ids 1–69).
 *
 * Requires LibreOffice for DOCX: https://www.libreoffice.org/
 * Run: node scripts/sync-reported-judgement-pdfs.mjs
 */

import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'Reported Judgements');
const OUT_DIR = path.join(ROOT, 'public', 'reported-judgement-pdfs');
const JSON_PATH = path.join(ROOT, 'public', 'data', 'reported-judgments.json');

function findSoffice() {
  const candidates = [
    process.env.SOFFICE_PATH,
    path.join(process.env.PROGRAMFILES ?? 'C:\\Program Files', 'LibreOffice', 'program', 'soffice.exe'),
    path.join(
      process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)',
      'LibreOffice',
      'program',
      'soffice.exe',
    ),
  ].filter(Boolean);
  for (const p of candidates) {
    if (p && existsSync(p)) return p;
  }
  return null;
}

/** @param {string} base filename without extension */
function idsFromBaseName(base) {
  const s = base.trim();
  const toRange = s.match(/^(\d+)\s+TO\s+(\d+)$/i);
  if (toRange) {
    const a = Number(toRange[1]);
    const b = Number(toRange[2]);
    const out = [];
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(i);
    return out;
  }
  if (/^\d+$/.test(s)) return [Number(s)];
  if (s.includes(',')) {
    return s
      .split(',')
      .map((x) => Number(String(x).trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  return [];
}

function convertDocxToPdf(soffice, docxPath, outDir) {
  mkdirSync(outDir, { recursive: true });
  execFileSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', outDir, docxPath], {
    stdio: 'inherit',
  });
  const base = path.basename(docxPath, path.extname(docxPath));
  const pdfPath = path.join(outDir, `${base}.pdf`);
  if (!existsSync(pdfPath)) {
    throw new Error(`Expected PDF not found: ${pdfPath}`);
  }
  return pdfPath;
}

/** Convert every .docx in `Reported Judgements/` to a .pdf in the same folder (skip if PDF already exists). */
function convertDocxInSourceFolder(soffice) {
  const entries = readdirSync(SOURCE_DIR);
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const name of entries) {
    if (!name.toLowerCase().endsWith('.docx')) continue;
    const docxPath = path.join(SOURCE_DIR, name);
    const base = path.basename(name, path.extname(name));
    const pdfInFolder = path.join(SOURCE_DIR, `${base}.pdf`);

    if (existsSync(pdfInFolder)) {
      skipped += 1;
      console.log('[convert] Skip (PDF exists):', `${base}.pdf`);
      continue;
    }

    try {
      convertDocxToPdf(soffice, docxPath, SOURCE_DIR);
      converted += 1;
      console.log('[convert] OK:', `${base}.pdf`);
    } catch (e) {
      failed += 1;
      console.error('[convert] Failed:', name, e instanceof Error ? e.message : e);
    }
  }

  console.log(`[convert] Done. converted=${converted} skipped=${skipped} failed=${failed}`);
  return failed === 0;
}

function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error('Missing folder:', SOURCE_DIR);
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const soffice = findSoffice();
  if (!soffice) {
    console.warn(
      '[sync] LibreOffice (soffice.exe) not found. DOCX files will be skipped. Install LibreOffice or set SOFFICE_PATH.',
    );
  } else {
    const ok = convertDocxInSourceFolder(soffice);
    if (!ok) {
      console.warn('[sync] Some DOCX conversions failed; continuing with available PDFs.');
    }
  }

  const entries = readdirSync(SOURCE_DIR);
  const produced = new Map(); // id -> absolute path to pdf

  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    if (ext !== '.docx' && ext !== '.pdf') continue;
    const base = path.basename(name, ext);
    const ids = idsFromBaseName(base);
    if (ids.length === 0) {
      console.warn('[sync] Skip (unrecognized name pattern):', name);
      continue;
    }

    let pdfPath;
    const full = path.join(SOURCE_DIR, name);
    if (ext === '.pdf') {
      pdfPath = full;
    } else if (ext === '.docx') {
      const siblingPdf = path.join(SOURCE_DIR, `${base}.pdf`);
      if (existsSync(siblingPdf)) {
        pdfPath = siblingPdf;
      } else {
        console.warn('[sync] No PDF for DOCX (conversion missing):', name);
        continue;
      }
    } else {
      continue;
    }

    for (const id of ids) {
      const dest = path.join(OUT_DIR, `${id}.pdf`);
      copyFileSync(pdfPath, dest);
      produced.set(id, dest);
      console.log('[sync]', id, '<=', name);
    }
  }

  const missing = [];
  for (let id = 1; id <= 69; id++) {
    if (!produced.has(id)) missing.push(id);
  }
  if (missing.length) {
    console.warn('[sync] No PDF produced for serial(s):', missing.join(', '));
  }

  if (!existsSync(JSON_PATH)) {
    console.error('Missing JSON:', JSON_PATH);
    process.exit(1);
  }

  const raw = readFileSync(JSON_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('reported-judgments.json is not an array');
    process.exit(1);
  }

  for (const row of data) {
    if (typeof row.id !== 'number') continue;
    if (row.id >= 1 && row.id <= 69 && existsSync(path.join(OUT_DIR, `${row.id}.pdf`))) {
      row.pdfUrl = `/reported-judgement-pdfs/${row.id}.pdf`;
    }
  }

  writeFileSync(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log('[sync] Updated pdfUrl in', JSON_PATH);
}

main();
