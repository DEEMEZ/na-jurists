/**
 * Import every row from Civil Courts cases list.docx into public/data/cases.json.
 *
 * Default: replace prior civil-doc rows, keep duplicates, Case Number "N/A".
 * Optional: node scripts/import-civil-court-cases.mjs --dedupe
 *   (unique title+court+subject only; global dedupe; Case Number "—" for new rows)
 */
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import {
  courtLabelFromDocLine,
  parseCivilDocFromMammothText,
} from "./lib/civilDocCasesParse.mjs";
import { caseRowTripleKey, dedupeCaseArray, dedupeTripleKey } from "./lib/civilCasesDedupe.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const docPath = path.join(root, "Civil Courts cases list.docx");
const casesPath = path.join(root, "public", "data", "cases.json");
const CIVIL_SOURCE = "Civil Courts cases list.docx";

const dedupeMode = process.argv.includes("--dedupe");

const { value: text } = await mammoth.extractRawText({ path: docPath });
const { rows: imported, syncIssues } = parseCivilDocFromMammothText(text);

if (syncIssues.length > 0) {
  console.warn(`[import] Parser sync notes (${syncIssues.length}):`, syncIssues.slice(0, 12));
  if (syncIssues.length > 12) console.warn(`[import] … and ${syncIssues.length - 12} more`);
}

const raw = await fs.promises.readFile(casesPath, "utf8");
let existing = JSON.parse(raw);
if (!Array.isArray(existing)) throw new Error("cases.json must be an array");

const beforeTotal = existing.length;
const removedCivil = existing.filter((c) => c.sourceFile === CIVIL_SOURCE).length;
existing = existing.filter((c) => c.sourceFile !== CIVIL_SOURCE);

const keys = new Set(existing.map((c) => caseRowTripleKey(c)));
let added = 0;
let docRowCounter = 0;

for (const row of imported) {
  const court = courtLabelFromDocLine(row.court) ?? row.court;
  if (dedupeMode) {
    const k = dedupeTripleKey(row.title, court, row.subject);
    if (!k || keys.has(k)) continue;
    keys.add(k);
  }

  docRowCounter += 1;
  existing.push({
    id: randomUUID(),
    sourceFile: CIVIL_SOURCE,
    tableIndex: 0,
    rowIndex: docRowCounter,
    "Case Number": dedupeMode ? "—" : "N/A",
    "Case Title": row.title,
    Court: court,
    "Subject/Applicable Law": row.subject,
    Status: row.status,
  });
  added++;
}

let removedDupes = 0;
if (dedupeMode) {
  const beforeDedupe = existing.length;
  existing = dedupeCaseArray(existing);
  removedDupes = beforeDedupe - existing.length;
}

await fs.promises.writeFile(casesPath, `${JSON.stringify(existing, null, 2)}\n`);
console.log(
  `[import] Mode: ${dedupeMode ? "dedupe" : "all rows (incl. duplicates)"}. ` +
    `Parsed ${imported.length} doc rows; removed ${removedCivil} prior civil-doc row(s); ` +
    `appended ${added}; ${dedupeMode ? `global dedupe removed ${removedDupes}; ` : ""}` +
    `was ${beforeTotal} → now ${existing.length} in cases.json.`,
);
