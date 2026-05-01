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

  // Subject/status bleed — never treat as court
  if (
    /^(pending|decided|disposed|service|appeal|civil|criminal|family|tax|contract|banking|rent)$/i.test(
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

export function parseCivilDocLines(lines) {
  let i = 0;
  while (i < lines.length && lines[i] !== "Status") i++;
  i++;
  while (i < lines.length && lines[i] === "") i++;

  const rows = [];
  const syncIssues = [];

  const MAX_TITLE_LINES = 40;

  while (i < lines.length) {
    while (i < lines.length && lines[i] === "") i++;
    if (i >= lines.length) break;

    let titleParts = [];
    let guard = 0;
    while (i < lines.length && !isCourtLine(lines[i])) {
      if (lines[i] !== "") titleParts.push(lines[i]);
      i++;
      guard++;
      if (guard > MAX_TITLE_LINES) {
        syncIssues.push({ kind: "title_overflow", at: i });
        break;
      }
    }

    const title = titleParts.join(" ").trim();
    if (!title) continue;
    if (i >= lines.length) break;

    const courtRaw = lines[i++] ?? "";
    const court = courtLabelFromDocLine(courtRaw);
    if (!court) {
      syncIssues.push({ kind: "expected_court_after_title", title: title.slice(0, 80), got: courtRaw });
      continue;
    }

    while (i < lines.length && lines[i] === "") i++;
    const subject = (lines[i++] ?? "").trim();
    while (i < lines.length && lines[i] === "") i++;
    const statusRaw = (lines[i++] ?? "").trim();

    let status = statusRaw.replace(/\s+/g, " ").trim() || "Pending";
    if (!isPlausibleStatus(status)) {
      syncIssues.push({ kind: "weak_status", title: title.slice(0, 60), status });
      // Still keep row — Word exports sometimes truncate odd trailing tokens
    }

    rows.push({ title, court, subject, status });
  }

  return { rows, syncIssues };
}

export function parseCivilDocFromMammothText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  return parseCivilDocLines(lines);
}
