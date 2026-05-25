/**
 * Verify civil-doc import: every parsed doc row is in cases.json.
 * Default expects all rows including duplicates (Case Number N/A).
 * Pass --dedupe to require unique triples only.
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
const CIVIL_SOURCE = "Civil Courts cases list.docx";
const dedupeMode = process.argv.includes("--dedupe");

const { value: text } = await mammoth.extractRawText({ path: docPath });
const { rows: docRows } = parseCivilDocFromMammothText(text);

const raw = await fs.promises.readFile(casesPath, "utf8");
const cases = JSON.parse(raw);
if (!Array.isArray(cases)) throw new Error("cases.json must be an array");

const civilRows = cases.filter((c) => c.sourceFile === CIVIL_SOURCE);

if (dedupeMode) {
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
  if (missing.length > 0 || dupCount > 0) process.exit(1);
  console.log("OK — all doc triples present and no triple duplicates in cases.json.");
} else {
  const badCaseNo = civilRows.filter((c) => String(c["Case Number"] ?? "").trim() !== "N/A");
  console.log(`Doc rows parsed: ${docRows.length}`);
  console.log(`Civil-doc rows in JSON: ${civilRows.length}`);
  console.log(`Civil rows not using Case Number N/A: ${badCaseNo.length}`);

  if (civilRows.length !== docRows.length) {
    console.error(
      `FAILED: expected ${docRows.length} civil-doc rows (one per Pending/Decided in Word), got ${civilRows.length}`,
    );
    process.exit(1);
  }
  if (docRows.length < 628) {
    console.warn(`[verify] Parsed ${docRows.length} rows; firm list target is 628.`);
  }
  if (badCaseNo.length > 0) {
    console.error("FAILED: some civil-doc rows lack Case Number N/A");
    process.exit(1);
  }
  console.log("OK — all doc rows imported (incl. duplicates) with Case Number N/A.");
}
