function normTitle(t) {
  return String(t ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .trim();
}

function normCourt(c) {
  return String(c ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .trim();
}

function normSubject(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .trim();
}

export function dedupeTripleKey(title, court, subject) {
  return `${normTitle(title)}|${normCourt(court)}|${normSubject(subject)}`;
}

export function caseRowTripleKey(c) {
  return dedupeTripleKey(c["Case Title"], c.Court, c["Subject/Applicable Law"]);
}

function hasRealCaseNumber(c) {
  const n = String(c["Case Number"] ?? "").trim();
  return n.length > 0 && n !== "—";
}

/**
 * One survivor per triple; prefers rows with a filled Case Number, then keeps first occurrence.
 */
export function dedupeCaseArray(arr) {
  const best = new Map();
  for (let idx = 0; idx < arr.length; idx++) {
    const row = arr[idx];
    const k = caseRowTripleKey(row);
    if (!normTitle(row["Case Title"])) continue;
    const prev = best.get(k);
    if (!prev) {
      best.set(k, { row, idx });
      continue;
    }
    const a = prev.row;
    const b = row;
    const an = hasRealCaseNumber(a);
    const bn = hasRealCaseNumber(b);
    if (bn && !an) best.set(k, { row: b, idx });
  }
  return [...best.values()].sort((x, y) => x.idx - y.idx).map((x) => x.row);
}
