/**
 * Verify civil import: doc rows + optional JSON legacy snapshot coverage.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import { parseCivilDocFromMammothText } from "./lib/civilDocCasesParse.mjs";
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

const { value: text } = await mammoth.extractRawText({ path: docPath });
const { rows: docRows } = parseCivilDocFromMammothText(text);

const raw = await fs.promises.readFile(casesPath, "utf8");
const cases = JSON.parse(raw);
if (!Array.isArray(cases)) throw new Error("cases.json must be an array");

const docInJson = cases.filter((c) => c.sourceFile === CIVIL_SOURCE);
const jsonInJson = cases.filter((c) => c.sourceFile === CIVIL_JSON_SOURCE);
const civilAll = [...docInJson, ...jsonInJson];

if (dedupeMode) {
  const jsonKeys = new Set(cases.map((c) => caseRowTripleKey(c)));
  const missing = [];
  for (const r of docRows) {
    const k = dedupeTripleKey(r.title, r.court, r.subject);
    if (!jsonKeys.has(k)) missing.push({ title: r.title.slice(0, 80), court: r.court });
  }
  const deduped = dedupeCaseArray(cases);
  const dupCount = cases.length - deduped.length;
  console.log(`Doc rows parsed: ${docRows.length}`);
  console.log(`cases.json rows: ${cases.length}`);
  console.log(`Missing doc triples: ${missing.length}`);
  console.log(`Duplicate triples: ${dupCount}`);
  if (missing.length > 0 || dupCount > 0) process.exit(1);
  console.log("OK — dedupe mode.");
  process.exit(0);
}

const badCaseNo = civilAll.filter((c) => String(c["Case Number"] ?? "").trim() !== "N/A");
console.log(`Doc rows parsed (Word): ${docRows.length}`);
console.log(`In cases.json — doc source: ${docInJson.length}, JSON legacy source: ${jsonInJson.length}`);
console.log(`Civil total in cases.json: ${civilAll.length}`);
console.log(`Rows not using Case Number N/A: ${badCaseNo.length}`);

if (docInJson.length !== docRows.length) {
  console.error(`FAILED: expected ${docRows.length} doc-source rows, got ${docInJson.length}`);
  process.exit(1);
}
if (badCaseNo.length > 0) {
  console.error("FAILED: some civil rows lack Case Number N/A");
  process.exit(1);
}

let legacySnapshot = 0;
if (fs.existsSync(legacyJsonPath)) {
  legacySnapshot = JSON.parse(fs.readFileSync(legacyJsonPath, "utf8")).length;
  const docKeys = new Set(docInJson.map((c) => caseRowTripleKey(c)));
  const legacyOnly = JSON.parse(fs.readFileSync(legacyJsonPath, "utf8")).filter((raw) => {
    const title = raw["Case Title"] ?? raw["\r\nCase Title "] ?? "";
    const k = dedupeTripleKey(title, raw.Court ?? "", raw["Subject/Applicable Law"] ?? "");
    return k && !docKeys.has(k);
  });
  console.log(`Legacy JSON snapshot file: ${legacySnapshot} rows`);
  console.log(`JSON-only triples (not in doc parse): ${legacyOnly.length}`);
  console.log(`JSON legacy rows in cases.json: ${jsonInJson.length}`);
  if (jsonInJson.length < legacyOnly.length) {
    console.warn(
      `[verify] JSON legacy in cases.json (${jsonInJson.length}) < JSON-only triples (${legacyOnly.length}). Re-run import.`,
    );
  }
}

console.log("OK — Word list + JSON legacy civil rows present in cases.json.");
