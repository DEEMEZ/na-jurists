import { portalApiJsonSilent } from "./portalApi";

export type AdminHearingRow = {
  id: string;
  caseId: string;
  scheduledAt: string;
  venue: string | null;
  notes: string | null;
  caseTitle: string;
  caseReference: string | null;
  caseArchived?: boolean;
};

export type ClientHearingRow = {
  id: string;
  caseId: string;
  scheduledAt: string;
  venue: string | null;
  notes: string | null;
  caseTitle: string;
  caseReference: string | null;
};

const CACHE_TTL_MS = 90_000;

let adminCache: { at: number; rows: AdminHearingRow[] } | null = null;
let clientCache: { at: number; rows: ClientHearingRow[] } | null = null;

function isFresh(at: number): boolean {
  return Date.now() - at < CACHE_TTL_MS;
}

export function getCachedAdminHearings(): AdminHearingRow[] | null {
  return adminCache && isFresh(adminCache.at) ? adminCache.rows : null;
}

export function getCachedClientHearings(): ClientHearingRow[] | null {
  return clientCache && isFresh(clientCache.at) ? clientCache.rows : null;
}

export function invalidateHearingsCache(): void {
  adminCache = null;
  clientCache = null;
}

export async function loadAdminHearings(opts?: { force?: boolean }): Promise<AdminHearingRow[]> {
  if (!opts?.force) {
    const cached = getCachedAdminHearings();
    if (cached) return cached;
  }
  const data = (await portalApiJsonSilent(
    "GET",
    "/api/v1/admin/hearings/upcoming-30d",
  )) as { hearings: AdminHearingRow[] };
  const rows = data.hearings ?? [];
  adminCache = { at: Date.now(), rows };
  return rows;
}

export async function loadClientHearings(opts?: { force?: boolean }): Promise<ClientHearingRow[]> {
  if (!opts?.force) {
    const cached = getCachedClientHearings();
    if (cached) return cached;
  }
  const data = (await portalApiJsonSilent("GET", "/api/v1/me/hearings")) as {
    hearings: ClientHearingRow[];
  };
  const rows = data.hearings ?? [];
  clientCache = { at: Date.now(), rows };
  return rows;
}

export function prefetchAdminHearings(): void {
  void loadAdminHearings().catch(() => {});
}

export function prefetchClientHearings(): void {
  void loadClientHearings().catch(() => {});
}
