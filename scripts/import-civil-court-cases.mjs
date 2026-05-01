/**
 * Parse Civil Courts cases list.docx (repo root) and append Civil Court rows to public/data/cases.json.
 * Dedupes by normalized Case Title against existing JSON + within the import batch.
 * Only rows with Court exactly "Civil Court" (after trim) — matches website "Lower Courts & Tribunals" filter.
 */
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import mammoth from "mammoth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const docPath = path.join(root, "Civil Courts cases list.docx");
const casesPath = path.join(root, "public", "data", "cases.json");

function normTitle(t) {
  return String(t ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .trim();
}

const { value: text } = await mammoth.extractRawText({ path: docPath });
const lines = text.split(/\r?\n/).map((l) => l.trim());
let i = 0;
while (i < lines.length && lines[i] !== "Status") i++;
i++;
while (i < lines.length && lines[i] === "") i++;

const imported = [];
while (i < lines.length) {
  while (i < lines.length && lines[i] === "") i++;
  if (i >= lines.length) break;
  const titleLines = [];
  while (i < lines.length && lines[i] !== "") {
    titleLines.push(lines[i]);
    i++;
  }
  const title = titleLines.join(" ").trim();
  while (i < lines.length && lines[i] === "") i++;
  const court = (lines[i++] ?? "").trim();
  while (i < lines.length && lines[i] === "") i++;
  const subject = (lines[i++] ?? "").trim();
  while (i < lines.length && lines[i] === "") i++;
  const statusRaw = (lines[i++] ?? "").trim();
  if (!title || !court) continue;
  if (court.toLowerCase() !== "civil court") continue;
  imported.push({
    title,
    court: "Civil Court",
    subject,
    status: statusRaw.replace(/\s+/g, " ").trim() || "Pending",
  });
}

const raw = await fs.promises.readFile(casesPath, "utf8");
const existing = JSON.parse(raw);
if (!Array.isArray(existing)) throw new Error("cases.json must be an array");

const keys = new Set(existing.map((c) => normTitle(c["Case Title"])));
let added = 0;
let rowCounter = 0;
for (const row of imported) {
  const k = normTitle(row.title);
  if (!k || keys.has(k)) continue;
  keys.add(k);
  rowCounter += 1;
  existing.push({
    id: randomUUID(),
    sourceFile: "Civil Courts cases list.docx",
    tableIndex: 0,
    rowIndex: rowCounter,
    "Case Number": "—",
    "Case Title": row.title,
    Court: row.court,
    "Subject/Applicable Law": row.subject,
    Status: row.status,
  });
  added++;
}

await fs.promises.writeFile(casesPath, `${JSON.stringify(existing, null, 2)}\n`);
console.log(`Parsed ${imported.length} Civil Court rows from docx; appended ${added} new cases (deduped).`);
