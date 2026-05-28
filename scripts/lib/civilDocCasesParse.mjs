/**
 * Parse "Civil Courts cases list.docx" raw text into case rows.
 * Accumulates multi-line titles until a recognized court line appears.
 */

export function normalizeSpaces(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .replace(/[,;:]+$/g, "")
    .trim();
}

/** Looks like a party line / case title fragment — not a court label */
function looksLikeCaseTitleFragment(line) {
  const l = line.trim();
  if (!l) return false;
  return /\bv\.?\s+/i.test(l);
}

/**
 * Returns canonical Court label for JSON, or null if this line is not a court row marker.
 */
export function courtLabelFromDocLine(raw) {
  const line = normalizeSpaces(raw);
  if (!line || line.length > 120) return null;
  if (looksLikeCaseTitleFragment(line)) return null;

  const lc = line.toLowerCase();

  // Subject/status bleed — never treat as court (standalone tokens only)
  if (
    /^(pending|decided|disposed|service|appeal|criminal|family|tax|contract|banking|rent)$/i.test(
      lc,
    )
  ) {
    return null;
  }

  const exact = new Map([
    ["civil court", "Civil Court"],
    ["banking court", "Banking Court"],
    ["custom court", "Custom Court"],
    ["fst", "FST"],
    ["atir", "ATIR"],
    ["nirc", "NIRC"],
    ["adcg", "ADCG"],
    ["pindi ghaep", "Pindi Ghaep"],
    ["sialkot", "Sialkot"],
    ["saq", "Saq"],
    ["fospah", "FOSPAH"],
    ["president of pakistan", "President of Pakistan"],
  ]);
  if (exact.has(lc)) return exact.get(lc);

  if (lc.includes("tribunal")) return line;
  if (lc.includes("accountability court")) return line;
  if (lc.includes("federal shariat court")) return line;

  // Generic courts ending in "court" (short lines only)
  if (/\bcourt\b/i.test(line) && line.length < 90) {
    return line;
  }

  return null;
}

export function isCourtLine(raw) {
  return courtLabelFromDocLine(raw) != null;
}

function isPlausibleStatus(raw) {
  const s = normalizeSpaces(raw).toLowerCase();
  if (!s) return false;
  return /\b(pending|decided|disposed|allowed|dismissed|closed)\b/i.test(s);
}

const STATUS_LINE_RE = /^(pending|decided|disposed|allowed|dismissed|closed)$/i;
const DEFAULT_COURT = "Civil Court";

/** One case block ending with Pending/Decided (628 blocks in the firm Word export). */
function parseStatusTerminatedBlock(chunkLines) {
  const nonEmpty = chunkLines.map((l) => l.trim()).filter((l) => l);
  if (!nonEmpty.length) return null;

  const statusRaw = nonEmpty[nonEmpty.length - 1];
  if (!isPlausibleStatus(statusRaw)) return null;
  const status = normalizeSpaces(statusRaw) || "Pending";

  const body = nonEmpty.slice(0, -1);
  if (!body.length) return null;

  let courtIdx = -1;
  for (let i = body.length - 1; i >= 0; i--) {
    if (courtLabelFromDocLine(body[i])) {
      courtIdx = i;
      break;
    }
  }

  if (courtIdx >= 0) {
    const court = courtLabelFromDocLine(body[courtIdx]);
    const subject = body.slice(courtIdx + 1).join(" ").trim() || "—";
    const title = body.slice(0, courtIdx).join(" ").trim();
    if (!title || !court) return null;
    return { title, court, subject, status };
  }

  /** Rows with no court line in the doc (e.g. subject only) still import as separate matters. */
  const subject = body[body.length - 1].trim() || "—";
  const title = body.slice(0, -1).join(" ").trim();
  if (!title) return null;
  return { title, court: DEFAULT_COURT, subject, status };
}

export function parseCivilDocLines(lines) {
  let start = 0;
  while (start < lines.length && lines[start] !== "Status") start++;
  start++;
  while (start < lines.length && lines[start] === "") start++;

  const rows = [];
  const syncIssues = [];
  let block = [];

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (STATUS_LINE_RE.test(line)) {
      if (block.length) {
        const row = parseStatusTerminatedBlock([...block, line]);
        if (row) {
          rows.push(row);
        } else {
          syncIssues.push({
            kind: "unparsed_block",
            preview: block.filter((l) => l.trim()).slice(0, 5),
          });
        }
      }
      block = [];
    } else {
      block.push(line);
    }
  }

  return { rows, syncIssues };
}

export function parseCivilDocFromMammothText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  return parseCivilDocLines(lines);
}
