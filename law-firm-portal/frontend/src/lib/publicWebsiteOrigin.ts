/**
 * `null` = same-origin URL `/api/reported-judgments` (Vite dev proxy → Next, or mono host).
 * Otherwise full origin without trailing slash.
 */
export type ReportedJudgmentsWebsiteBase = string | null;

/**
 * Ordered list of bases to try when merging the public judgments API into the admin list.
 * Tries relative (dev proxy), env URLs, then the current browser origin (same-host deploys).
 */
export function getReportedJudgmentsWebsiteApiBases(): ReportedJudgmentsWebsiteBase[] {
  const bases: ReportedJudgmentsWebsiteBase[] = [];
  const seen = new Set<string>();
  const push = (b: ReportedJudgmentsWebsiteBase) => {
    const key = b === null ? "\0relative" : b;
    if (seen.has(key)) return;
    seen.add(key);
    bases.push(b);
  };

  if (import.meta.env.DEV) {
    push(null);
  }

  for (const raw of [import.meta.env.VITE_PUBLIC_WEBSITE_ORIGIN, import.meta.env.VITE_WEBSITE_URL]) {
    const t = raw?.trim().replace(/\/$/, "");
    if (t) push(t);
  }

  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const loc = (globalThis as { location?: { origin?: string } }).location;
    const o = loc?.origin?.replace(/\/$/, "") ?? "";
    if (o) push(o);
  }

  if (import.meta.env.DEV) {
    const nextDev =
      import.meta.env.VITE_NEXT_DEV_ORIGIN?.trim().replace(/\/$/, "") || "";
    if (nextDev) push(nextDev);
    for (const host of ["127.0.0.1", "localhost"]) {
      for (const port of [3000, 3001]) {
        push(`http://${host}:${port}`);
      }
    }
  }

  return bases;
}

/**
 * Base URL for the marketing Next site (`/api/reported-judgments`, etc.).
 * Set `VITE_PUBLIC_WEBSITE_ORIGIN` (or `VITE_WEBSITE_URL`) in production so the admin
 * list merges the public catalog; in dev we default to Next's usual port.
 */
export function resolvePublicWebsiteOrigin(): string | null {
  const candidates = [
    import.meta.env.VITE_PUBLIC_WEBSITE_ORIGIN,
    import.meta.env.VITE_WEBSITE_URL,
  ];
  for (const raw of candidates) {
    const t = raw?.trim();
    if (t) return t.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) return "http://localhost:3000";
  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const origin = (globalThis as { location?: { origin?: string } }).location?.origin?.replace(
      /\/$/,
      "",
    );
    if (origin) return origin;
  }
  return null;
}

/** Portal sign-in URL for client notification emails (public marketing-site path). */
export function resolvePortalSignInUrl(): string | null {
  const explicitLogin = import.meta.env.VITE_PORTAL_LOGIN_URL?.trim();
  if (explicitLogin) {
    const u = explicitLogin.replace(/\/$/, "");
    return u;
  }

  const website = resolvePublicWebsiteOrigin();
  if (website) {
    return `${website}/portal/login`;
  }

  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const loc = (globalThis as { location?: { origin?: string; pathname?: string } }).location;
    const origin = loc?.origin?.replace(/\/$/, "") ?? "";
    if (!origin) return null;
    const embedded =
      (loc?.pathname ?? "").startsWith("/portal") ||
      import.meta.env.BASE_URL === "/portal/" ||
      import.meta.env.BASE_URL === "/portal";
    return embedded ? `${origin}/portal/login` : `${origin}/login`;
  }

  return null;
}

/** Website + portal links appended to client notification emails. */
export function clientNotifyEmailLinks(): string {
  const lines: string[] = [];
  const website = resolvePublicWebsiteOrigin();
  const portal = resolvePortalSignInUrl();
  if (website) lines.push(`Website: ${website}`);
  if (portal) lines.push(`Client portal: ${portal}`);
  return lines.length ? `\n\n${lines.join("\n")}` : "";
}
