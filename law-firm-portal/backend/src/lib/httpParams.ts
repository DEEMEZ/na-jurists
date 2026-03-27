/** Express 5 types params as `string | string[]` — normalize to a single string. */
export function paramStr(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : value[0];
}
