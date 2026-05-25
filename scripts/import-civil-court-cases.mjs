/**
 * Import Civil Courts cases into public/data/cases.json from:
 * 1) Civil Courts cases list.docx (628 rows, incl. duplicates in the Word list)
 * 2) Legacy JSON snapshot (Word table → JSON import) for rows not present in the doc parse
 *
 * Default: Case Number "N/A", every row kept separately.
 * Optional: --dedupe (unique title+court+subject only)
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
import {
  caseRowTripleKey,
  dedupeCaseArray,
  dedupeTripleKey,
} from "./lib/civilCasesDedupe.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const docPath = path.join(root, "Civil Courts cases list.docx");
const casesPath = path.join(root, "public", "data", "cases.json");
const legacyJsonPath = path.join(root, "scripts", "data", "civil-cases-json-snapshot.json");
const CIVIL_SOURCE = "Civil Courts cases list.docx";
const CIVIL_JSON_SOURCE = "Civil Courts cases list (JSON import)";

const dedupeMode = process.argv.includes("--dedupe");
const includeAllJsonSnapshot = process.argv.includes("--all-json-rows");

const { value: text } = await mammoth.extractRawText({ path: docPath });
const { rows: imported, syncIssues } = parseCivilDocFromMammothText(text);

if (syncIssues.length > 0) {
  console.warn(`[import] Parser sync notes (${syncIssues.length}):`, syncIssues.slice(0, 12));
  if (syncIssues.length > 12) console.warn(`[import] … and ${syncIssues.length - 12} more`);
}

function normalizeLegacyJsonRow(raw, rowIndex) {
  const title =
    raw["Case Title"] ??
    raw["Case Title "] ??
    raw["\r\nCase Title "] ??
    raw["\nCase Title "] ??
    "";
  const court = raw.Court ?? raw.court ?? "";
  const subject = raw["Subject/Applicable Law"] ?? raw.Subject ?? raw.subject ?? "—";
  const status = raw.Status ?? raw.status ?? "Pending";
  if (!String(title).trim()) return null;

  return {
    id: randomUUID(),
    sourceFile: CIVIL_JSON_SOURCE,
    tableIndex: raw.tableIndex ?? 0,
    rowIndex: rowIndex,
    "Case Number": "N/A",
    "Case Title": String(title).replace(/\s+/g, " ").trim(),
    Court: String(court).replace(/\s+/g, " ").trim(),
    "Subject/Applicable Law": String(subject).replace(/\s+/g, " ").trim(),
    Status: String(status).replace(/\s+/g, " ").trim() || "Pending",
  };
}

function loadLegacyJsonRows() {
  if (!fs.existsSync(legacyJsonPath)) {
    console.warn(`[import] No legacy JSON snapshot at ${legacyJsonPath} — skipping JSON merge.`);
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(legacyJsonPath, "utf8"));
  if (!Array.isArray(parsed)) return [];
  const out = [];
  let idx = 0;
  for (const raw of parsed) {
    const row = normalizeLegacyJsonRow(raw, ++idx);
    if (row) out.push(row);
  }
  return out;
}

const raw = await fs.promises.readFile(casesPath, "utf8");
let existing = JSON.parse(raw);
if (!Array.isArray(existing)) throw new Error("cases.json must be an array");

const beforeTotal = existing.length;
const removedCivil = existing.filter(
  (c) => c.sourceFile === CIVIL_SOURCE || c.sourceFile === CIVIL_JSON_SOURCE,
).length;
existing = existing.filter(
  (c) => c.sourceFile !== CIVIL_SOURCE && c.sourceFile !== CIVIL_JSON_SOURCE,
);

const keys = new Set(existing.map((c) => caseRowTripleKey(c)));
let addedDoc = 0;
let docRowCounter = 0;
const docKeys = new Set();

for (const row of imported) {
  const court = courtLabelFromDocLine(row.court) ?? row.court;
  const k = dedupeTripleKey(row.title, court, row.subject);
  if (dedupeMode) {
    if (!k || keys.has(k)) continue;
    keys.add(k);
  }
  if (k) docKeys.add(k);

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
  addedDoc++;
}

let addedJson = 0;
const legacyRows = loadLegacyJsonRows();
for (const row of legacyRows) {
  const k = caseRowTripleKey(row);
  if (!includeAllJsonSnapshot && k && docKeys.has(k)) continue;
  if (dedupeMode && k && keys.has(k)) continue;
  if (k) keys.add(k);
  existing.push(row);
  addedJson++;
}

let removedDupes = 0;
if (dedupeMode) {
  const beforeDedupe = existing.length;
  existing = dedupeCaseArray(existing);
  removedDupes = beforeDedupe - existing.length;
}

const civilTotal = existing.filter(
  (c) => c.sourceFile === CIVIL_SOURCE || c.sourceFile === CIVIL_JSON_SOURCE,
).length;

await fs.promises.writeFile(casesPath, `${JSON.stringify(existing, null, 2)}\n`);
console.log(
  `[import] Doc: ${addedDoc} rows (${imported.length} parsed). ` +
    `JSON legacy: +${addedJson} from snapshot (${legacyRows.length} in file, ` +
    `${includeAllJsonSnapshot ? "all rows" : "only rows not matching doc triple"}). ` +
    `Removed ${removedCivil} prior civil row(s). ` +
    `Civil total now ${civilTotal}. ` +
    `cases.json: ${beforeTotal} → ${existing.length}.` +
    (dedupeMode ? ` Deduped ${removedDupes}.` : ""),
);
