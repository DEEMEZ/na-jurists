/**
 * Client-side email check before submit. Server (Zod / edge) is authoritative.
 * Accepts normal addresses (Gmail, Outlook, firm domains, etc.), not Gmail-only.
 */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** Returns normalized email if valid, otherwise null. */
export function parseValidEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254) return null;
  return EMAIL_RE.test(email) ? email : null;
}
