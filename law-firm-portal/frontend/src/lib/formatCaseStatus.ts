/** Title case for case status (open → Open, under review → Under Review). */
export function formatCaseStatus(status: string): string {
  const t = status.trim();
  if (!t) return "—";
  return t
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
