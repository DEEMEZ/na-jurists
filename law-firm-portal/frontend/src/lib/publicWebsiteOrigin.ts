/**
 * Base URL for the marketing Next site (`/api/reported-judgments`, etc.).
 * Production must set `VITE_PUBLIC_WEBSITE_ORIGIN`. In dev we default to Next's usual port.
 */
export function resolvePublicWebsiteOrigin(): string | null {
  const explicit = import.meta.env.VITE_PUBLIC_WEBSITE_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3000";
  return null;
}
