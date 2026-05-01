/**
 * Merge Civil Courts cases list.docx into public/data/cases.json with no duplicate matters on site.
 *
 * Dedup key: normalized Case Title + Court + Subject (stable across minor punctuation differences).
 * After merge, runs a global dedupe: keeps the best row per key (prefers a real Case Number over "—").
 *
 * Usage: node scripts/import-civil-court-cases.mjs
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

const { value: text } = await mammoth.extractRawText({ path: docPath });
const { rows: imported, syncIssues } = parseCivilDocFromMammothText(text);

if (syncIssues.length > 0) {
  console.warn(`[import] Parser sync notes (${syncIssues.length}):`, syncIssues.slice(0, 12));
  if (syncIssues.length > 12) console.warn(`[import] … and ${syncIssues.length - 12} more`);
}

const raw = await fs.promises.readFile(casesPath, "utf8");
let existing = JSON.parse(raw);
if (!Array.isArray(existing)) throw new Error("cases.json must be an array");

const keys = new Set(existing.map((c) => caseRowTripleKey(c)));
let added = 0;
let docRowCounter = 0;
for (const row of imported) {
  const court = courtLabelFromDocLine(row.court) ?? row.court;
  const k = dedupeTripleKey(row.title, court, row.subject);
  if (!k || keys.has(k)) continue;
  keys.add(k);
  docRowCounter += 1;
  existing.push({
    id: randomUUID(),
    sourceFile: "Civil Courts cases list.docx",
    tableIndex: 0,
    rowIndex: docRowCounter,
    "Case Number": "—",
    "Case Title": row.title,
    Court: court,
    "Subject/Applicable Law": row.subject,
    Status: row.status,
  });
  added++;
}

const before = existing.length;
existing = dedupeCaseArray(existing);
const removedDupes = before - existing.length;

await fs.promises.writeFile(casesPath, `${JSON.stringify(existing, null, 2)}\n`);
console.log(
  `[import] Parsed ${imported.length} rows from docx; appended ${added} new triples; global dedupe removed ${removedDupes} duplicate row(s); final JSON count ${existing.length}.`,
);
