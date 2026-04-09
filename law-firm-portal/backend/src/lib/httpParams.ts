/** Express 5 types params as `string | string[]` — normalize to a single string. */
export function paramStr(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const raw = typeof value === "string" ? value : value[0];
  if (raw === undefined || raw === "") return undefined;
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}
