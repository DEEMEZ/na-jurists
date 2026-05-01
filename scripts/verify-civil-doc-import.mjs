/**
 * Fail if any civil-doc row triple is missing from cases.json, or if JSON still contains triple duplicates.
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

const { value: text } = await mammoth.extractRawText({ path: docPath });
const { rows: docRows } = parseCivilDocFromMammothText(text);

const raw = await fs.promises.readFile(casesPath, "utf8");
const cases = JSON.parse(raw);
if (!Array.isArray(cases)) throw new Error("cases.json must be an array");

const jsonKeys = new Set(cases.map((c) => caseRowTripleKey(c)));

const missing = [];
for (const r of docRows) {
  const k = dedupeTripleKey(r.title, r.court, r.subject);
  if (!jsonKeys.has(k)) missing.push({ title: r.title.slice(0, 80), court: r.court, subject: r.subject });
}

const deduped = dedupeCaseArray(cases);
const dupCount = cases.length - deduped.length;

console.log(`Doc rows parsed: ${docRows.length}`);
console.log(`cases.json rows: ${cases.length}`);
console.log(`Missing doc triples in JSON: ${missing.length}`);
console.log(`Duplicate triples in JSON (would dedupe): ${dupCount}`);

if (missing.length > 0) {
  console.error("MISSING (first 15):");
  console.error(missing.slice(0, 15));
  process.exit(1);
}

if (dupCount > 0) {
  console.error(`FAILED: ${dupCount} duplicate triple(s) still present — run import script to dedupe.`);
  process.exit(1);
}

console.log("OK — all doc rows present and no triple duplicates in cases.json.");
