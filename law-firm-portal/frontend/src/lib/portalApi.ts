import { FunctionsHttpError } from "@supabase/supabase-js";
import { getDefaultWebsiteTeamSeedRows } from "@site/lib/websiteTeamDefaults";
import { clientNotifyEmailLinks } from "./publicWebsiteOrigin";
import { withPortalLoading } from "./portalLoadingBus";
import { getSupabase } from "./supabaseClient";

async function edgeFunctionErrorMessage(error: Error): Promise<string> {
  const fallback =
    error.message ||
    "Edge function failed. Deploy `portal-admin-users` (see law-firm-portal/supabase/functions).";
  if (!(error instanceof FunctionsHttpError) || !(error.context instanceof Response)) {
    return fallback;
  }
  const res = error.context;
  try {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = (await res.json()) as { error?: string; message?: string; detail?: string };
      if (typeof j?.error === "string") {
        const d = typeof j?.detail === "string" ? j.detail.trim() : "";
        return d ? `${j.error}: ${d}` : j.error;
      }
      if (typeof j?.message === "string") return j.message;
    } else {
      const t = await res.text();
      if (t?.trim()) return t.trim().slice(0, 500);
    }
  } catch {
    /* keep fallback */
  }
  return fallback;
}

export type AuthUser = { id: string; email: string; role: "ADMIN" | "CLIENT" };

type Ctx = {
  sb: ReturnType<typeof getSupabase>;
  uid: string;
  role: "ADMIN" | "CLIENT";
  email: string;
};

/** Avoid N× profile fetches when many API calls run in parallel (e.g. case detail). */
let profileCache: { userId: string; ctx: Ctx; expires: number } | null = null;
const PROFILE_CACHE_TTL_MS = 60_000;
let authInvalidationStarted = false;

function ensureProfileCacheInvalidation(): void {
  if (authInvalidationStarted) return;
  authInvalidationStarted = true;
  getSupabase().auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT" || event === "SIGNED_IN" || event === "USER_UPDATED") {
      profileCache = null;
    }
  });
}

/** Call after logout so the next session never reuses cached profile. */
export function invalidatePortalProfileCache(): void {
  profileCache = null;
}

async function requireProfile(): Promise<Ctx> {
  ensureProfileCacheInvalidation();
  const sb = getSupabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.user) {
    profileCache = null;
    throw new Error("Unauthorized");
  }
  const now = Date.now();
  if (
    profileCache &&
    profileCache.userId === session.user.id &&
    profileCache.expires > now
  ) {
    return profileCache.ctx;
  }
  const { data: p, error } = await sb
    .from("profiles")
    .select("id, email, role, disabled")
    .eq("id", session.user.id)
    .single();
  if (error || !p) throw new Error("Unauthorized");
  if (p.disabled) throw new Error("Account disabled");
  const ctx: Ctx = {
    sb,
    uid: p.id,
    role: p.role as "ADMIN" | "CLIENT",
    email: p.email,
  };
  profileCache = {
    userId: session.user.id,
    ctx,
    expires: now + PROFILE_CACHE_TTL_MS,
  };
  return ctx;
}

const HEARING_CASE_EMBED_CLIENT =
  "id, scheduled_at, venue, notes, case_id, cases!hearings_case_id_fkey(title, reference)";
const HEARING_CASE_EMBED_ADMIN =
  "id, scheduled_at, venue, notes, case_id, cases!hearings_case_id_fkey(title, reference, archived)";

function embeddedHearingCaseMeta(h: Record<string, unknown>): {
  title: string;
  reference: string | null;
  archived: boolean;
} | null {
  const raw = h.cases;
  const c = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown> | null;
  if (!c || typeof c !== "object") return null;
  return {
    title: String(c.title ?? ""),
    reference: (c.reference as string | null) ?? null,
    archived: Boolean(c.archived),
  };
}

function mapHearingListRow(
  h: Record<string, unknown>,
  opts?: { includeArchived?: boolean },
) {
  const meta = embeddedHearingCaseMeta(h);
  const row = {
    id: h.id as string,
    caseId: String(h.case_id ?? ""),
    scheduledAt: h.scheduled_at as string,
    venue: (h.venue as string | null) ?? null,
    notes: (h.notes as string | null) ?? null,
    caseTitle: meta?.title || "Matter",
    caseReference: meta?.reference ?? null,
  };
  if (opts?.includeArchived) {
    return { ...row, caseArchived: meta?.archived ?? false };
  }
  return row;
}

const WEBSITE_TEAM_BUCKET = "website-team";

function normalizeTeamPhotoFields(
  photoStoragePath: string | null | undefined,
  imageKey: string | null | undefined,
): { photo_storage_path: string | null; image_key: string | null } {
  const path =
    photoStoragePath === undefined || photoStoragePath === null || photoStoragePath === ""
      ? null
      : String(photoStoragePath);
  const key =
    imageKey === undefined || imageKey === null || imageKey === "" ? null : String(imageKey);
  if (path) return { photo_storage_path: path, image_key: null };
  if (key) return { photo_storage_path: null, image_key: key };
  return { photo_storage_path: null, image_key: null };
}

function teamPhotoExtension(file: File): string {
  const t = file.type.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  if (t.includes("gif")) return "gif";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  const n = file.name.toLowerCase();
  const ext = n.match(/\.([a-z0-9]+)$/);
  if (ext?.[1]) {
    const e = ext[1];
    if (e === "jpeg" || e === "jpg" || e === "png" || e === "webp" || e === "gif") return e === "jpeg" ? "jpg" : e;
  }
  return "jpg";
}

function mapWebsiteTeamAdminRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    section: row.section === "founder" ? "founder" : "member",
    sortOrder: Number(row.sort_order ?? 0),
    name: String(row.name ?? ""),
    title: String(row.title ?? ""),
    bio: String(row.bio ?? ""),
    imageKey: row.image_key == null || row.image_key === "" ? null : String(row.image_key),
    photoStoragePath:
      row.photo_storage_path == null || row.photo_storage_path === ""
        ? null
        : String(row.photo_storage_path),
    delayMs: Number(row.delay_ms ?? 100),
  };
}

function parseUrl(pathWithQuery: string): { pathname: string; q: URLSearchParams } {
  const u = new URL(pathWithQuery, "http://portal.local");
  return { pathname: u.pathname, q: u.searchParams };
}

function rowCaseId(row: Record<string, unknown>): string {
  const cid = row.case_id;
  return cid != null ? String(cid) : "";
}

/** PostgREST may return snake_case or camelCase for FK columns. */
function assignmentRowCaseId(row: Record<string, unknown>): string {
  const v = row.case_id ?? row.caseId;
  return v != null && String(v).trim() !== "" ? String(v).trim() : "";
}

function normCaseId(id: unknown): string {
  return id != null ? String(id).trim() : "";
}

function coerceStr(v: unknown, fallback = ""): string {
  return v != null ? String(v) : fallback;
}

function coerceStrArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string" && v.trim()) {
    return v
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseReportedJudgmentRecord(body: unknown): {
  id: number;
  citation: string;
  title: string;
  court: string;
  date: string;
  caseNumber: string;
  dictumLaw: string;
  judgmentHeading: string;
  subject: string;
  parties: { petitioner: string; respondent: string };
  judges: string[];
  sections: string[];
  fullText: string;
  keywords: string[];
  pdfUrl: string;
} {
  const o = body as Record<string, unknown>;
  const src = (
    o.record !== undefined && typeof o.record === "object" && o.record !== null ? o.record : o
  ) as Record<string, unknown>;
  const id = Number(src.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new Error("Invalid judgment id (positive integer required)");
  }
  const partiesRaw =
    src.parties !== undefined && typeof src.parties === "object" && src.parties !== null
      ? (src.parties as Record<string, unknown>)
      : {};
  return {
    id,
    citation: coerceStr(src.citation),
    title: coerceStr(src.title),
    court: coerceStr(src.court),
    date: coerceStr(src.date),
    caseNumber: coerceStr(src.caseNumber),
    dictumLaw: coerceStr(src.dictumLaw),
    judgmentHeading: coerceStr(src.judgmentHeading),
    subject: coerceStr(src.subject),
    parties: {
      petitioner: coerceStr(partiesRaw.petitioner),
      respondent: coerceStr(partiesRaw.respondent),
    },
    judges: coerceStrArray(src.judges),
    sections: coerceStrArray(src.sections),
    fullText: coerceStr(src.fullText),
    keywords: coerceStrArray(src.keywords),
    pdfUrl: coerceStr(src.pdfUrl),
  };
}

/** Map PostgREST row (snake_case columns). */
function mapCaseRow(c: Record<string, unknown>) {
  const id = normCaseId(c.id);
  const titleRaw = c.title ?? c["Case Title"];
  const refRaw = c.reference ?? c["Case Number"];
  const statusRaw = c.status ?? c.Status;
  const courtRaw = c.court;
  const subRaw = c.subject;
  return {
    id,
    title: titleRaw != null && String(titleRaw).trim() !== "" ? String(titleRaw) : "Matter",
    reference: refRaw != null && String(refRaw).trim() !== "" ? String(refRaw) : null,
    status: statusRaw != null && String(statusRaw).trim() !== "" ? String(statusRaw) : "open",
    archived: Boolean(c.archived),
    court:
      courtRaw != null && String(courtRaw).trim() !== "" ? String(courtRaw).trim() : null,
    subject:
      subRaw != null && String(subRaw).trim() !== "" ? String(subRaw).trim() : null,
  };
}

/** Fresh access token for Edge Function invokes (JWT gateway rejects stale tokens). */
async function getFreshAccessToken(): Promise<string | null> {
  const sb = getSupabase();
  const { data: ref } = await sb.auth.refreshSession();
  let accessToken = ref.session?.access_token;
  if (!accessToken) {
    const {
      data: { session },
    } = await sb.auth.getSession();
    accessToken = session?.access_token;
  }
  return accessToken ?? null;
}

type NotifyEmailFnResponse = {
  ok?: boolean;
  skipped?: boolean;
  sent?: boolean;
  reason?: string;
  error?: string;
  detail?: string;
};

/** Do not invoke edge for client mail to these profile emails (stops bounces to Gmail SMTP). */
const CLIENT_NOTIFY_PROFILE_DENY = new Set<string>(["najurist@gmail.com", "ab887812@gmail.com"]);

/** Omit from admin `[Portal] …` copies when edge is stale; merged server-side with env/hardcoded lists. */
const ADMIN_NOTIFY_SUPPRESS_FROM_PORTAL = ["ab887812@gmail.com"];

async function invokeNotifyEmail(body: Record<string, unknown>): Promise<void> {
  try {
    const sb = getSupabase();
    const accessToken = await getFreshAccessToken();
    if (!accessToken) {
      console.warn(
        "[portal-notify-email] No session token — email not sent. Sign in again as admin.",
      );
      return;
    }
    const { data, error } = await sb.functions.invoke("portal-notify-email", {
      body,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error) {
      const detail = await edgeFunctionErrorMessage(error);
      console.warn("[portal-notify-email] invoke failed:", detail);
      return;
    }
    const res = data as NotifyEmailFnResponse | null;
    if (res?.skipped) {
      console.warn(
        "[portal-notify-email] Email not sent —",
        res.reason ?? "skipped",
        "| Add GMAIL_SMTP_USER + GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY (+ NOTIFY_EMAIL_FROM) in Supabase → Edge Functions → Secrets, then redeploy portal-notify-email. Admin alerts go to active ADMIN profiles only.",
      );
      return;
    }
    if (res && res.ok === false) {
      console.warn(
        "[portal-notify-email]",
        res.error ?? "Request failed",
        res.detail ? `— ${res.detail}` : "",
      );
      return;
    }
    if (res?.sent) {
      console.info("[portal-notify-email] sent:", body.subject ?? "");
    }
  } catch (e) {
    console.warn("[portal-notify-email]", e instanceof Error ? e.message : e);
  }
}

/**
 * Email assigned clients when an admin action occurs (status, message, hearing).
 * Requires deployed `portal-notify-email` + secrets (see law-firm-portal/SUPABASE.md).
 */
async function notifyClientByEmail(payload: {
  recipientUserId: string;
  subject: string;
  text: string;
}): Promise<void> {
  try {
    const sb = getSupabase();
    const { data: row } = await sb
      .from("profiles")
      .select("email")
      .eq("id", payload.recipientUserId)
      .maybeSingle();
    const em = String((row as { email?: string } | null)?.email ?? "")
      .trim()
      .toLowerCase();
    if (em && CLIENT_NOTIFY_PROFILE_DENY.has(em)) {
      console.info(
        "[portal-notify-email] skip client invoke (profile email on denylist):",
        em,
      );
      return;
    }
  } catch {
    /* RLS/network — still try edge (may resolve auth.users email) */
  }
  await invokeNotifyEmail(payload);
}

/** Notify firm: edge function sends only to active portal ADMIN profiles. Safe to fire-and-forget. */
export async function notifyPortalAdmins(subject: string, text: string): Promise<void> {
  await invokeNotifyEmail({
    notifyAdmin: true,
    subject,
    text,
    suppressAdminTo: ADMIN_NOTIFY_SUPPRESS_FROM_PORTAL,
  });
}

async function invokeAdmin(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const sb = getSupabase();
  const accessToken = await getFreshAccessToken();
  if (!accessToken) {
    throw new Error("Your session expired. Sign out and sign in again.");
  }

  const { data, error } = await sb.functions.invoke("portal-admin-users", {
    body,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) {
    let msg = await edgeFunctionErrorMessage(error);
    if (/invalid jwt/i.test(msg)) {
      msg +=
        " Try: Sign out, clear site data for this site (or use a private window), sign in again. " +
        "Confirm VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY match Settings → API for this project.";
    }
    throw new Error(msg);
  }
  const res = data as { ok?: boolean; error?: string };
  if (!res?.ok) {
    throw new Error(typeof res?.error === "string" ? res.error : "Request failed");
  }
  return data as Record<string, unknown>;
}

async function buildCaseDetail(sb: ReturnType<typeof getSupabase>, caseId: string) {
  const { data: c, error: ce } = await sb
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .maybeSingle();
  if (ce || !c) throw new Error("Not found");

  const [asg, hist, docs, hear, noteRows] = await Promise.all([
    sb
      .from("case_assignments")
      .select("user_id, profiles!case_assignments_user_id_fkey(id, email)")
      .eq("case_id", caseId),
    sb
      .from("case_status_history")
      .select(
        "id, from_status, to_status, note, created_at, visible_to_client, profiles!case_status_history_author_id_fkey(email)",
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    sb
      .from("documents")
      .select(
        "id, original_name, size, created_at, visible_to_client, profiles!documents_uploaded_by_id_fkey(email)",
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    sb.from("hearings").select("*").eq("case_id", caseId).order("scheduled_at", { ascending: true }),
    sb
      .from("case_notes")
      .select(
        "id, body, visible_to_client, created_at, profiles!case_notes_author_id_fkey(email)",
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
  ]);

  const assignments = (asg.data ?? []).map((row: Record<string, unknown>) => {
    const prof = row.profiles as { id: string; email: string } | null;
    return { user: { id: prof?.id ?? row.user_id, email: prof?.email ?? "" } };
  });

  const statusHistory = (hist.data ?? []).map((h: Record<string, unknown>) => {
    const author = h.profiles as { email: string } | null;
    return {
      id: h.id,
      fromStatus: h.from_status as string | null,
      toStatus: h.to_status as string,
      note: h.note as string | null,
      createdAt: h.created_at as string,
      visibleToClient: h.visible_to_client !== false,
      author: { email: author?.email ?? "" },
    };
  });

  const documents = (docs.data ?? []).map((d: Record<string, unknown>) => {
    const up = d.profiles as { email: string } | null;
    return {
      id: d.id,
      originalName: d.original_name,
      size: d.size,
      createdAt: d.created_at,
      visibleToClient: d.visible_to_client !== false,
      uploadedBy: { email: up?.email ?? "" },
    };
  });

  const caseNotes = (noteRows.data ?? []).map((n: Record<string, unknown>) => {
    const author = n.profiles as { email: string } | null;
    return {
      id: n.id,
      body: n.body as string,
      visibleToClient: Boolean(n.visible_to_client),
      createdAt: n.created_at as string,
      author: { email: author?.email ?? "" },
    };
  });

  const hearings = (hear.data ?? []).map((h: Record<string, unknown>) => ({
    id: h.id,
    scheduledAt: h.scheduled_at,
    venue: h.venue as string | null,
    notes: h.notes as string | null,
  }));

  const cr = c as Record<string, unknown>;
  const courtVal = cr.court;
  const subVal = cr.subject;
  return {
    case: {
      id: c.id,
      title: c.title,
      reference: c.reference,
      status: c.status,
      archived: c.archived,
      displayOnWebsite: Boolean(cr.display_on_website),
      court:
        courtVal != null && String(courtVal).trim() !== "" ? String(courtVal).trim() : null,
      subject:
        subVal != null && String(subVal).trim() !== "" ? String(subVal).trim() : null,
      assignments,
      statusHistory,
      documents,
      hearings,
      caseNotes,
    },
  };
}

async function portalApiJsonInner(
  method: string,
  pathWithQuery: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, q } = parseUrl(pathWithQuery);
  const m = method.toUpperCase();

  if (pathname === "/auth/me") {
    const { uid, email, role } = await requireProfile();
    return { user: { id: uid, email, role } satisfies AuthUser };
  }

  if (pathname === "/api/v1/admin/ping") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    return { scope: "admin", message: "Admin access granted" };
  }

  if (pathname === "/api/v1/client/ping") {
    const x = await requireProfile();
    if (x.role !== "CLIENT") throw new Error("Forbidden");
    return { scope: "client", message: "Client access granted" };
  }

  if (pathname === "/api/v1/me/dashboard" && m === "GET") {
    const { sb, uid } = await requireProfile();
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data: assigns } = await sb.from("case_assignments").select("case_id").eq("user_id", uid);
    const caseIds = [
      ...new Set(
        (assigns ?? [])
          .map((a: { case_id: string | null }) => a.case_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    if (caseIds.length === 0) {
      return {
        activeMatters: 0,
        openMatters: 0,
        upcomingHearings30d: 0,
        unreadNotifications: 0,
        messagesFromFirm: 0,
        nextHearings: [],
        recentFirmMessages: [],
      };
    }
    const { data: caseRowsForCounts, error: caseCountErr } = await sb
      .from("cases")
      .select("id, archived")
      .in("id", caseIds);
    if (caseCountErr) throw new Error(caseCountErr.message);
    const rowsOk = caseRowsForCounts ?? [];
    const activeMatters = caseIds.length;
    const openMatters = rowsOk.length
      ? rowsOk.filter((r: { archived?: boolean }) => !r.archived).length
      : activeMatters;

    const nowIso = now.toISOString();
    const in30Iso = in30.toISOString();
    const [
      { count: upcomingHearings30d },
      { count: unreadNotifications },
      { count: messagesFromFirm },
      { data: hearRaw },
      { data: msgRaw },
    ] = await Promise.all([
      sb
        .from("hearings")
        .select("id", { count: "exact", head: true })
        .in("case_id", caseIds)
        .gte("scheduled_at", nowIso)
        .lte("scheduled_at", in30Iso),
      sb
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("read", false),
      sb
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("case_id", caseIds)
        .neq("sender_id", uid),
      sb
        .from("hearings")
        .select("id, scheduled_at, venue, case_id")
        .in("case_id", caseIds)
        .gte("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true })
        .limit(12),
      sb
        .from("messages")
        .select("id, body, created_at, case_id")
        .in("case_id", caseIds)
        .neq("sender_id", uid)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    const involvedCaseIds = [
      ...new Set(
        [...(hearRaw ?? []), ...(msgRaw ?? [])]
          .map((row: Record<string, unknown>) => rowCaseId(row))
          .filter((id) => id.length > 0),
      ),
    ];
    const caseMeta =
      involvedCaseIds.length === 0
        ? []
        : (
            await sb
              .from("cases")
              .select("id, title, archived")
              .in("id", involvedCaseIds)
          ).data ?? [];
    const caseById = new Map(
      caseMeta.map((c: Record<string, unknown>) => [
        String(c.id),
        {
          title: String(c.title ?? "Matter"),
          archived: Boolean(c.archived),
        },
      ]),
    );

    const nextHearings = (hearRaw ?? [])
      .map((row: Record<string, unknown>) => {
        const caseId = rowCaseId(row);
        const meta = caseById.get(caseId);
        return {
          id: row.id as string,
          caseId,
          caseTitle: meta?.title ?? "Matter",
          archived: meta?.archived ?? false,
          scheduledAt: row.scheduled_at as string,
          venue: (row.venue as string | null) ?? null,
        };
      })
      .filter((h) => h.caseId.length > 0 && !h.archived)
      .map(({ archived: _archived, ...h }) => h);

    const recentFirmMessages = (msgRaw ?? [])
      .map((row: Record<string, unknown>) => {
        const caseId = rowCaseId(row);
        const meta = caseById.get(caseId);
        return {
          id: row.id as string,
          caseId,
          caseTitle: meta?.title ?? "Matter",
          body: row.body as string,
          createdAt: row.created_at as string,
        };
      })
      .filter((m) => m.caseId.length > 0);

    return {
      activeMatters,
      openMatters,
      upcomingHearings30d: upcomingHearings30d ?? 0,
      unreadNotifications: unreadNotifications ?? 0,
      messagesFromFirm: messagesFromFirm ?? 0,
      nextHearings,
      recentFirmMessages,
    };
  }

  if (pathname === "/api/v1/me/notifications" && m === "GET") {
    const { sb, uid } = await requireProfile();
    const { data, error } = await sb
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const notifications = (data ?? []).map((n: Record<string, unknown>) => ({
      id: n.id,
      userId: n.user_id,
      caseId: n.case_id,
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.created_at,
    }));
    return { notifications };
  }

  if (pathname === "/api/v1/me/notifications/read-all" && m === "POST") {
    const { sb, uid } = await requireProfile();
    const { data, error } = await sb
      .from("notifications")
      .update({ read: true })
      .eq("user_id", uid)
      .eq("read", false)
      .select("id");
    if (error) throw new Error(error.message);
    return { ok: true, count: (data ?? []).length };
  }

  const readNotif = pathname.match(/^\/api\/v1\/me\/notifications\/([^/]+)\/read$/);
  if (readNotif && m === "PATCH") {
    const { sb, uid } = await requireProfile();
    const nid = readNotif[1];
    const { data: n, error: e1 } = await sb
      .from("notifications")
      .select("id")
      .eq("id", nid)
      .eq("user_id", uid)
      .maybeSingle();
    if (e1 || !n) throw new Error("Not found");
    const { error: e2 } = await sb.from("notifications").update({ read: true }).eq("id", nid);
    if (e2) throw new Error(e2.message);
    return { ok: true };
  }

  if (pathname === "/api/v1/me/cases" && m === "GET") {
    const { sb, uid } = await requireProfile();
    // Prefer embedded `cases` via FK (same path as me/cases/:id fallback) so list matches
    // detail when a plain `cases` select returns no row under RLS.
    const { data: assigns, error: e1 } = await sb
      .from("case_assignments")
      .select(
        "case_id, cases!case_assignments_case_id_fkey(id, title, reference, status, archived, display_on_website, court, subject)",
      )
      .eq("user_id", uid);
    if (e1) throw new Error(e1.message);

    const orderedRaw: string[] = [];
    const seenKey = new Set<string>();
    const caseById = new Map<string, Record<string, unknown>>();

    for (const row of assigns ?? []) {
      const r = row as Record<string, unknown>;
      const cid = assignmentRowCaseId(r);
      if (!cid) continue;
      const key = cid.trim();
      const dedupeKey = key.toLowerCase();
      if (seenKey.has(dedupeKey)) continue;
      seenKey.add(dedupeKey);
      orderedRaw.push(key);

      let emb = r.cases as Record<string, unknown> | Record<string, unknown>[] | null | undefined;
      if (Array.isArray(emb)) emb = emb[0] ?? null;
      if (emb && typeof emb === "object") {
        caseById.set(key, emb as Record<string, unknown>);
      }
    }
    if (orderedRaw.length === 0) {
      return { cases: [] };
    }

    const missing = orderedRaw.filter((id) => !caseById.has(id));
    if (missing.length > 0) {
      const results = await Promise.all(
        missing.map((caseId) => sb.from("cases").select("*").eq("id", caseId).maybeSingle()),
      );
      missing.forEach((caseId, i) => {
        const { data, error } = results[i];
        if (error) console.warn("[me/cases] case fetch", caseId, error.message);
        if (data) caseById.set(caseId, data as Record<string, unknown>);
      });
    }

    const cases = orderedRaw.map((caseId) => {
      const data = caseById.get(caseId);
      if (data) return mapCaseRow(data);
      console.warn("[me/cases] no case row for assignment", caseId);
      return {
        id: caseId,
        title: "Matter",
        reference: null,
        status: "open",
        archived: false,
        court: null,
        subject: null,
      };
    });
    return { cases };
  }

  if (pathname === "/api/v1/me/hearings" && m === "GET") {
    const { sb, role } = await requireProfile();
    if (role !== "CLIENT") {
      throw new Error("Forbidden");
    }
    const { data: hearRows, error: e2 } = await sb
      .from("hearings")
      .select(HEARING_CASE_EMBED_CLIENT)
      .order("scheduled_at", { ascending: true })
      .limit(200);
    if (e2) throw new Error(e2.message);
    return {
      hearings: (hearRows ?? []).map((h) =>
        mapHearingListRow(h as Record<string, unknown>),
      ),
    };
  }

  const meCase = pathname.match(/^\/api\/v1\/me\/cases\/([^/]+)$/);
  if (meCase && m === "GET") {
    const x = await requireProfile();
    let caseIdParam = meCase[1];
    try {
      caseIdParam = decodeURIComponent(caseIdParam).trim();
    } catch {
      caseIdParam = caseIdParam.trim();
    }
    if (x.role === "CLIENT") {
      const { data: row } = await x.sb
        .from("case_assignments")
        .select("case_id")
        .eq("user_id", x.uid)
        .eq("case_id", caseIdParam)
        .maybeSingle();
      if (!row) throw new Error("Not found");
    }
    try {
      return await buildCaseDetail(getSupabase(), caseIdParam);
    } catch {
      // Fallback for environments where direct `cases` select is restricted
      // but assignment exists; still load key sections for case detail view.
      const { data: asg } = await x.sb
        .from("case_assignments")
        .select(
          "case_id, cases!case_assignments_case_id_fkey(id, title, reference, status, archived, display_on_website, court, subject)",
        )
        .eq("user_id", x.uid)
        .eq("case_id", caseIdParam)
        .maybeSingle();
      if (!asg) throw new Error("Not found");
      const c = (asg as Record<string, unknown> | null)?.cases as Record<string, unknown> | null;
      const [hearRes, docRes, histRes, noteRes] = await Promise.all([
        x.sb
          .from("hearings")
          .select("id, scheduled_at, venue, notes")
          .eq("case_id", caseIdParam)
          .order("scheduled_at", { ascending: true }),
        x.sb
          .from("documents")
          .select("id, original_name, size, created_at, visible_to_client")
          .eq("case_id", caseIdParam)
          .order("created_at", { ascending: false }),
        x.sb
          .from("case_status_history")
          .select("id, from_status, to_status, note, created_at, visible_to_client")
          .eq("case_id", caseIdParam)
          .order("created_at", { ascending: false }),
        x.sb
          .from("case_notes")
          .select("id, body, visible_to_client, created_at")
          .eq("case_id", caseIdParam)
          .order("created_at", { ascending: false }),
      ]);

      const hearings = (hearRes.data ?? []).map((h: Record<string, unknown>) => ({
        id: h.id,
        scheduledAt: h.scheduled_at,
        venue: (h.venue as string | null) ?? null,
        notes: (h.notes as string | null) ?? null,
      }));
      const documents = (docRes.data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id,
        originalName: d.original_name,
        size: d.size,
        createdAt: d.created_at,
        visibleToClient: d.visible_to_client !== false,
        uploadedBy: { email: "" },
      }));
      const statusHistory = (histRes.data ?? []).map((h: Record<string, unknown>) => ({
        id: h.id,
        fromStatus: (h.from_status as string | null) ?? null,
        toStatus: (h.to_status as string) ?? "open",
        note: (h.note as string | null) ?? null,
        createdAt: h.created_at as string,
        visibleToClient: h.visible_to_client !== false,
        author: { email: "" },
      }));
      const caseNotes = (noteRes.data ?? []).map((n: Record<string, unknown>) => ({
        id: n.id,
        body: n.body as string,
        visibleToClient: Boolean(n.visible_to_client),
        createdAt: n.created_at as string,
        author: { email: "" },
      }));
      return {
        case: {
          id: caseIdParam,
          title: (c?.title as string | undefined) ?? "Matter",
          reference: (c?.reference as string | null | undefined) ?? null,
          status: (c?.status as string | undefined) ?? "open",
          archived: Boolean(c?.archived),
          displayOnWebsite: Boolean(c?.display_on_website),
          assignments: [],
          statusHistory,
          documents,
          hearings,
          caseNotes,
        },
      };
    }
  }

  if (pathname === "/api/v1/admin/dashboard" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { sb } = x;
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nowIso = now.toISOString();
    const in30Iso = in30.toISOString();
    const sevenAgoIso = sevenAgo.toISOString();
    const [{ count: openCases }, { count: upcomingHearings30d }, { data: allOpen }, { data: clientIds }] =
      await Promise.all([
        sb.from("cases").select("id", { count: "exact", head: true }).eq("archived", false),
        sb
          .from("hearings")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_at", nowIso)
          .lte("scheduled_at", in30Iso),
        sb.from("cases").select("id").eq("archived", false),
        sb.from("profiles").select("id").eq("role", "CLIENT"),
      ]);
    const openIds = (allOpen ?? []).map((c: { id: string }) => c.id);
    let casesMissingUpcomingHearing = 0;
    let recentClientMessages = 0;
    const cids = (clientIds ?? []).map((p: { id: string }) => p.id);
    const [futureHRes, msgCountRes] = await Promise.all([
      openIds.length
        ? sb
            .from("hearings")
            .select("case_id")
            .in("case_id", openIds)
            .gte("scheduled_at", nowIso)
        : Promise.resolve({ data: [] as { case_id: string }[] }),
      cids.length
        ? sb
            .from("messages")
            .select("id", { count: "exact", head: true })
            .in("sender_id", cids)
            .gte("created_at", sevenAgoIso)
        : Promise.resolve({ count: 0 }),
    ]);
    const futureH = futureHRes.data;
    if (openIds.length) {
      const withFuture = new Set((futureH ?? []).map((h: { case_id: string }) => h.case_id));
      casesMissingUpcomingHearing = openIds.filter((id) => !withFuture.has(id)).length;
    }
    if (cids.length) {
      recentClientMessages = msgCountRes.count ?? 0;
    }
    return {
      openCases: openCases ?? 0,
      upcomingHearings30d: upcomingHearings30d ?? 0,
      casesMissingUpcomingHearing,
      recentClientMessages,
    };
  }

  /** Same date window as `upcomingHearings30d` on admin dashboard — list those hearings (not “missing date” alerts). */
  if (pathname === "/api/v1/admin/hearings/upcoming-30d" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { sb } = x;
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nowIso = now.toISOString();
    const in30Iso = in30.toISOString();
    const { data: hearRows, error: e2 } = await sb
      .from("hearings")
      .select(HEARING_CASE_EMBED_ADMIN)
      .gte("scheduled_at", nowIso)
      .lte("scheduled_at", in30Iso)
      .order("scheduled_at", { ascending: true })
      .limit(500);
    if (e2) throw new Error(e2.message);
    return {
      hearings: (hearRows ?? []).map((h) =>
        mapHearingListRow(h as Record<string, unknown>, { includeArchived: true }),
      ),
    };
  }

  /** Client-authored case messages in the last 7 days — matches dashboard `recentClientMessages`. */
  if (pathname === "/api/v1/admin/messages/client-recent" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { sb } = x;
    const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sevenAgoIso = sevenAgo.toISOString();
    const { data: clientProfiles, error: ep } = await sb
      .from("profiles")
      .select("id")
      .eq("role", "CLIENT");
    if (ep) throw new Error(ep.message);
    const cids = (clientProfiles ?? []).map((p: { id: string }) => p.id);
    if (cids.length === 0) {
      return { messages: [] };
    }
    const { data: rows, error } = await sb
      .from("messages")
      .select("id, body, created_at, case_id, profiles!messages_sender_id_fkey(email, role)")
      .in("sender_id", cids)
      .gte("created_at", sevenAgoIso)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const caseIds = [
      ...new Set(
        (rows ?? [])
          .map((r: Record<string, unknown>) => String(r.case_id ?? ""))
          .filter((id) => id.length > 0),
      ),
    ];
    const { data: caseRows } =
      caseIds.length === 0
        ? { data: [] as Record<string, unknown>[] }
        : await sb.from("cases").select("id, title, reference").in("id", caseIds);
    const caseById = new Map(
      (caseRows ?? []).map((c: Record<string, unknown>) => [
        String(c.id),
        {
          title: String(c.title ?? ""),
          reference: (c.reference as string | null) ?? null,
        },
      ]),
    );
    const messages = (rows ?? []).map((row: Record<string, unknown>) => {
      const s = row.profiles as { email: string; role: string };
      const caseId = String(row.case_id ?? "");
      const meta = caseById.get(caseId);
      return {
        id: row.id as string,
        caseId,
        body: String(row.body ?? ""),
        createdAt: row.created_at as string,
        senderEmail: s?.email ?? "",
        caseTitle: meta?.title ?? "Matter",
        caseReference: meta?.reference ?? null,
      };
    });
    return { messages };
  }

  if (pathname === "/api/v1/admin/clients" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data, error } = await x.sb
      .from("profiles")
      .select("id, email")
      .eq("role", "CLIENT")
      .eq("disabled", false)
      .order("email");
    if (error) throw new Error(error.message);
    return { clients: data ?? [] };
  }

  if (pathname === "/api/v1/admin/users" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data, error } = await x.sb
      .from("profiles")
      .select("id, email, role, disabled, created_at")
      .order("email");
    if (error) throw new Error(error.message);
    const users = (data ?? []).map((u: Record<string, unknown>) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      disabled: u.disabled,
      createdAt: u.created_at,
    }));
    return { users };
  }

  if (pathname === "/api/v1/admin/users" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { email?: string; password?: string; role?: string };
    const data = await invokeAdmin({
      action: "create",
      email: b.email,
      password: b.password,
      role: b.role,
    });
    return { user: data.user };
  }

  const adminUserId = pathname.match(/^\/api\/v1\/admin\/users\/([^/]+)$/);
  if (adminUserId && m === "PATCH") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as {
      email?: string;
      role?: string;
      disabled?: boolean;
      password?: string;
    };
    const { data: current } = await x.sb
      .from("profiles")
      .select("email")
      .eq("id", adminUserId[1])
      .maybeSingle();
    const emailChanged =
      b.email !== undefined && b.email !== (current as { email?: string } | null)?.email;
    const needsEdge = Boolean(b.password || emailChanged);
    if (needsEdge) {
      const data = await invokeAdmin({
        action: "update",
        userId: adminUserId[1],
        email: b.email,
        password: b.password,
        role: b.role,
        disabled: b.disabled,
      });
      return { user: data.user };
    }
    const { error } = await x.sb
      .from("profiles")
      .update({
        role: b.role,
        disabled: b.disabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminUserId[1]);
    if (error) throw new Error(error.message);
    const { data: row } = await x.sb
      .from("profiles")
      .select("id, email, role, disabled, created_at")
      .eq("id", adminUserId[1])
      .single();
    return {
      user: {
        id: row?.id,
        email: row?.email,
        role: row?.role,
        disabled: row?.disabled,
        createdAt: row?.created_at,
      },
    };
  }

  if (adminUserId && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    if (adminUserId[1] === x.uid) throw new Error("Cannot delete your own account");
    await invokeAdmin({ action: "delete", userId: adminUserId[1] });
    return { ok: true };
  }

  if (pathname === "/api/v1/admin/cases" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const archived = q.get("archived");
    const search = q.get("q")?.trim();
    let qy = x.sb.from("cases").select("*").order("updated_at", { ascending: false });
    if (archived === "true") qy = qy.eq("archived", true);
    else if (archived === "false") qy = qy.eq("archived", false);
    if (search) {
      qy = qy.or(`title.ilike.%${search}%,reference.ilike.%${search}%`);
    }
    const { data, error } = await qy;
    if (error) throw new Error(error.message);
    const cases = (data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id,
      title: c.title,
      reference: c.reference,
      status: c.status,
      archived: c.archived,
      displayOnWebsite: Boolean(c.display_on_website),
      court: c.court != null && String(c.court).trim() !== "" ? String(c.court).trim() : null,
      subject:
        c.subject != null && String(c.subject).trim() !== "" ? String(c.subject).trim() : null,
    }));
    return { cases };
  }

  if (pathname === "/api/v1/admin/cases" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as {
      title?: string;
      reference?: string;
      status?: string;
      displayOnWebsite?: boolean;
      court?: string;
      subject?: string;
    };
    const { data, error } = await x.sb
      .from("cases")
      .insert({
        title: b.title ?? "",
        reference: b.reference ?? null,
        status: b.status ?? "open",
        display_on_website: b.displayOnWebsite ?? false,
        court: (b.court ?? "").trim() || null,
        subject: (b.subject ?? "").trim() || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { case: data };
  }

  const adminCase = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)$/);
  if (adminCase && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const detail = await buildCaseDetail(x.sb, adminCase[1]);
    const { count } = await x.sb
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("case_id", adminCase[1]);
    return { case: { ...detail.case, _count: { messages: count ?? 0 } } };
  }

  if (adminCase && m === "PATCH") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as {
      title?: string;
      reference?: string | null;
      archived?: boolean;
      displayOnWebsite?: boolean;
      court?: string | null;
      subject?: string | null;
    };
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (b.title !== undefined) patch.title = b.title;
    if (b.reference !== undefined) patch.reference = b.reference;
    if (b.archived !== undefined) patch.archived = b.archived;
    if (b.displayOnWebsite !== undefined) patch.display_on_website = b.displayOnWebsite;
    if (b.court !== undefined) {
      patch.court =
        b.court === null || String(b.court).trim() === "" ? null : String(b.court).trim();
    }
    if (b.subject !== undefined) {
      patch.subject =
        b.subject === null || String(b.subject).trim() === ""
          ? null
          : String(b.subject).trim();
    }
    const { data, error } = await x.sb
      .from("cases")
      .update(patch)
      .eq("id", adminCase[1])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { case: data };
  }

  const assignPost = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/assign$/);
  if (assignPost && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { userId?: string };
    const { data: client } = await x.sb
      .from("profiles")
      .select("id")
      .eq("id", b.userId ?? "")
      .eq("role", "CLIENT")
      .eq("disabled", false)
      .maybeSingle();
    if (!client) throw new Error("User is not a client");
    const { data, error } = await x.sb
      .from("case_assignments")
      .insert({ case_id: assignPost[1], user_id: b.userId })
      .select("user_id, profiles!case_assignments_user_id_fkey(id, email)")
      .single();
    if (error) {
      throw new Error(
        /duplicate|unique/i.test(error.message) ? "Already assigned or invalid case" : error.message,
      );
    }
    const prof = (data as Record<string, unknown>).profiles as { id: string; email: string };
    const caseId = assignPost[1];
    const assignUserId = String(b.userId ?? "");
    const { data: caseRow } = await x.sb
      .from("cases")
      .select("title, reference")
      .eq("id", caseId)
      .maybeSingle();
    const matterLabel = [caseRow?.reference, caseRow?.title].filter(Boolean).join(" — ") || "a matter";
    const assignTitle = "Matter assigned to you";
    const assignBody = `You have been assigned to ${matterLabel}. Open the client portal to view documents, messages, and updates.`;
    await x.sb.from("notifications").insert({
      user_id: assignUserId,
      case_id: caseId,
      title: assignTitle,
      body: assignBody,
    });
    void notifyClientByEmail({
      recipientUserId: assignUserId,
      subject: `[N&A Jurists] ${assignTitle} — ${matterLabel}`,
      text: `${assignBody}\n\nSign in to the client portal to view your matter.${clientNotifyEmailLinks()}`,
    });
    const clientEmail = String(prof?.email ?? "").trim();
    void notifyPortalAdmins(
      `[Portal] Client assigned — ${matterLabel}`,
      `A client was assigned to this matter.\n\nMatter: ${matterLabel}\nClient email: ${clientEmail || "(not set on profile)"}\nInternal user id: ${assignUserId}\n\nOpen the portal to manage the matter.`,
    );
    return { assignment: { user: { id: prof.id, email: prof.email } } };
  }

  const assignDel = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/assign\/([^/]+)$/);
  if (assignDel && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { error } = await x.sb
      .from("case_assignments")
      .delete()
      .eq("case_id", assignDel[1])
      .eq("user_id", assignDel[2]);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  const statusPost = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/status$/);
  if (statusPost && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { status?: string; note?: string; visibleToClient?: boolean };
    const caseId = statusPost[1];
    const visibleToClient = b.visibleToClient !== false;
    const { data: existing, error: e0 } = await x.sb.from("cases").select("status").eq("id", caseId).single();
    if (e0 || !existing) throw new Error("Case not found");
    const fromStatus = existing.status as string;
    const toStatus = b.status ?? "";
    const { error: e1 } = await x.sb
      .from("cases")
      .update({ status: toStatus, updated_at: new Date().toISOString() })
      .eq("id", caseId);
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await x.sb.from("case_status_history").insert({
      case_id: caseId,
      author_id: x.uid,
      from_status: fromStatus,
      to_status: toStatus,
      note: b.note ?? null,
      visible_to_client: visibleToClient,
    });
    if (e2) throw new Error(e2.message);
    const { data: assigns } = await x.sb.from("case_assignments").select("user_id").eq("case_id", caseId);
    const title = "Case status updated";
    const bodyText = `Status changed from "${fromStatus}" to "${toStatus}".${b.note ? ` Note: ${b.note}` : ""}`;
    const { data: caseRow } = await x.sb
      .from("cases")
      .select("title, reference")
      .eq("id", caseId)
      .maybeSingle();
    const matterLabel = [caseRow?.reference, caseRow?.title].filter(Boolean).join(" — ") || "your matter";
    if (visibleToClient) {
      for (const a of assigns ?? []) {
        const assignUserId = (a as { user_id: string }).user_id;
        await x.sb.from("notifications").insert({
          user_id: assignUserId,
          case_id: caseId,
          title,
          body: bodyText,
        });
        const { data: prof } = await x.sb.from("profiles").select("role").eq("id", assignUserId).maybeSingle();
        if ((prof as { role?: string } | null)?.role !== "CLIENT") continue;
        void notifyClientByEmail({
          recipientUserId: assignUserId,
          subject: `[N&A Jurists] ${title}`,
          text: `Update for ${matterLabel}:\n\n${bodyText}\n\nSign in to the client portal to view your matter.${clientNotifyEmailLinks()}`,
        });
      }
    }
    const { data: updated } = await x.sb.from("cases").select("*").eq("id", caseId).single();
    return { case: updated };
  }

  const adminNotesPost = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/notes$/);
  if (adminNotesPost && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { body?: string; visibleToClient?: boolean };
    const noteBody = (b.body ?? "").trim();
    if (!noteBody) throw new Error("Note text required");
    const share = b.visibleToClient === true;
    const { data, error } = await x.sb
      .from("case_notes")
      .insert({
        case_id: adminNotesPost[1],
        author_id: x.uid,
        body: noteBody,
        visible_to_client: share,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { note: data };
  }

  const adminHearings = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/hearings$/);
  if (adminHearings && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data, error } = await x.sb
      .from("hearings")
      .select("*")
      .eq("case_id", adminHearings[1])
      .order("scheduled_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { hearings: data ?? [] };
  }

  if (adminHearings && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { scheduledAt?: string; venue?: string; notes?: string };
    const when = new Date(b.scheduledAt ?? "");
    if (Number.isNaN(when.getTime())) throw new Error("Invalid scheduledAt");
    const { data, error } = await x.sb
      .from("hearings")
      .insert({
        case_id: adminHearings[1],
        scheduled_at: when.toISOString(),
        venue: b.venue ?? null,
        notes: b.notes ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const caseId = adminHearings[1];
    const { data: caseRow } = await x.sb
      .from("cases")
      .select("title, reference")
      .eq("id", caseId)
      .maybeSingle();
    const matterLabel = [caseRow?.reference, caseRow?.title].filter(Boolean).join(" — ") || "your matter";
    const whenStr = new Date((data as { scheduled_at: string }).scheduled_at).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const venueStr = (data as { venue?: string | null }).venue
      ? `\nVenue: ${(data as { venue: string }).venue}`
      : "";
    const { data: assigns } = await x.sb.from("case_assignments").select("user_id").eq("case_id", caseId);
    for (const a of assigns ?? []) {
      const assignUserId = (a as { user_id: string }).user_id;
      const { data: prof } = await x.sb.from("profiles").select("role").eq("id", assignUserId).maybeSingle();
      if ((prof as { role?: string } | null)?.role !== "CLIENT") continue;
      void notifyClientByEmail({
        recipientUserId: assignUserId,
        subject: `[N&A Jurists] Hearing scheduled — ${matterLabel}`,
        text: `A hearing was scheduled for ${matterLabel}.\n\nDate & time: ${whenStr}${venueStr}\n\nSign in to the client portal for full details.${clientNotifyEmailLinks()}`,
      });
    }
    void notifyPortalAdmins(
      `[Portal] Hearing scheduled — ${matterLabel}`,
      `Case: ${matterLabel}\nDate & time: ${whenStr}${venueStr}\n\nScheduled by admin in the portal.`,
    );
    return { hearing: data };
  }

  const hearingPatch = pathname.match(/^\/api\/v1\/admin\/hearings\/([^/]+)$/);
  if (hearingPatch && m === "PATCH") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { scheduledAt?: string; venue?: string | null; notes?: string | null };
    const patch: Record<string, unknown> = {};
    if (b.scheduledAt !== undefined) {
      const d = new Date(b.scheduledAt);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid scheduledAt");
      patch.scheduled_at = d.toISOString();
    }
    if (b.venue !== undefined) patch.venue = b.venue;
    if (b.notes !== undefined) patch.notes = b.notes;
    const { data, error } = await x.sb
      .from("hearings")
      .update(patch)
      .eq("id", hearingPatch[1])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { hearing: data };
  }

  if (hearingPatch && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { error } = await x.sb.from("hearings").delete().eq("id", hearingPatch[1]);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  const adminDocDel = pathname.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/documents\/([^/]+)$/);
  if (adminDocDel && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data: doc } = await x.sb
      .from("documents")
      .select("storage_path")
      .eq("id", adminDocDel[2])
      .eq("case_id", adminDocDel[1])
      .maybeSingle();
    if (!doc) throw new Error("Document not found");
    await x.sb.storage.from("case-files").remove([(doc as { storage_path: string }).storage_path]);
    const { error } = await x.sb.from("documents").delete().eq("id", adminDocDel[2]);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  if (pathname === "/api/v1/admin/alerts/missing-upcoming-hearings" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const nowIso = new Date().toISOString();
    const [{ data: openCases, error: casesErr }, { data: futureHearings, error: hearErr }] =
      await Promise.all([
        x.sb.from("cases").select("id, title, reference, status").eq("archived", false),
        x.sb.from("hearings").select("case_id").gte("scheduled_at", nowIso),
      ]);
    if (casesErr) throw new Error(casesErr.message);
    if (hearErr) throw new Error(hearErr.message);
    const withFuture = new Set(
      (futureHearings ?? []).map((h: { case_id: string }) => h.case_id),
    );
    const missing = (openCases ?? []).filter(
      (c: { id: string }) => !withFuture.has(c.id),
    ) as Array<{
      id: string;
      title: string;
      reference: string | null;
      status: string;
    }>;
    if (missing.length === 0) {
      return { count: 0, cases: [] };
    }
    const missingIds = missing.map((c) => c.id);
    const { data: asgRows, error: asgErr } = await x.sb
      .from("case_assignments")
      .select("case_id, profiles!case_assignments_user_id_fkey(email)")
      .in("case_id", missingIds);
    if (asgErr) throw new Error(asgErr.message);
    const clientsByCase = new Map<string, string[]>();
    for (const row of asgRows ?? []) {
      const r = row as Record<string, unknown>;
      const caseId = String(r.case_id ?? "");
      const profile = r.profiles as { email?: string } | null;
      const email = profile?.email;
      if (!caseId || !email) continue;
      const list = clientsByCase.get(caseId) ?? [];
      list.push(email);
      clientsByCase.set(caseId, list);
    }
    const cases = missing.map((c) => ({
      id: c.id,
      title: c.title,
      reference: c.reference,
      status: c.status,
      clients: clientsByCase.get(c.id) ?? [],
    }));
    return { count: cases.length, cases };
  }

  if (pathname === "/api/v1/admin/reported-judgments" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data, error } = await x.sb
      .from("reported_judgments")
      .select("id, record, updated_at, display_on_website")
      .order("id", { ascending: true });
    if (error) throw new Error(error.message);
    const judgments = (data ?? []).map((row: Record<string, unknown>) => {
      const rec = row.record as Record<string, unknown>;
      return {
        id: row.id as number,
        citation: coerceStr(rec?.citation),
        title: coerceStr(rec?.title),
        dictumLaw: coerceStr(rec?.dictumLaw),
        updatedAt: row.updated_at as string,
        displayOnWebsite: row.display_on_website !== false,
      };
    });
    return { judgments };
  }

  if (pathname === "/api/v1/admin/reported-judgments" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { record?: unknown; displayOnWebsite?: boolean; previousId?: unknown };
    const rec = parseReportedJudgmentRecord(b.record ?? body);
    const displayOnWebsite = b.displayOnWebsite === false ? false : true;
    const prevRaw = b.previousId;
    const previousId =
      prevRaw !== undefined && prevRaw !== null && prevRaw !== ""
        ? Number(prevRaw)
        : undefined;
    if (
      previousId !== undefined &&
      Number.isFinite(previousId) &&
      previousId >= 1 &&
      previousId !== rec.id
    ) {
      const { error: delErr } = await x.sb.from("reported_judgments").delete().eq("id", previousId);
      if (delErr) throw new Error(delErr.message);
    }
    const { data: rowAtSerial, error: selSerialErr } = await x.sb
      .from("reported_judgments")
      .select("id")
      .eq("id", rec.id)
      .maybeSingle();
    if (selSerialErr) throw new Error(selSerialErr.message);
    const updatingSameRowInPlace =
      previousId !== undefined && Number.isFinite(previousId) && previousId === rec.id;
    if (rowAtSerial && !updatingSameRowInPlace) {
      throw new Error(
        "That serial number is already in use. Edit the existing judgment or use the next available number for a new entry.",
      );
    }
    const updatedAt = new Date().toISOString();
    const { error } = await x.sb.from("reported_judgments").upsert(
      {
        id: rec.id,
        record: rec,
        display_on_website: displayOnWebsite,
        updated_at: updatedAt,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return {
      judgment: {
        id: rec.id,
        record: rec,
        updatedAt: updatedAt,
        displayOnWebsite: displayOnWebsite,
      },
    };
  }

  const adminReportedJudgment = pathname.match(/^\/api\/v1\/admin\/reported-judgments\/(\d+)$/);
  if (adminReportedJudgment && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const numericId = Number(adminReportedJudgment[1]);
    const { data, error } = await x.sb
      .from("reported_judgments")
      .select("id, record, updated_at, display_on_website")
      .eq("id", numericId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Not found");
    const row = data as Record<string, unknown>;
    return {
      judgment: {
        id: row.id,
        record: row.record,
        updatedAt: row.updated_at,
        displayOnWebsite: row.display_on_website !== false,
      },
    };
  }

  if (adminReportedJudgment && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const numericId = Number(adminReportedJudgment[1]);
    const { error } = await x.sb.from("reported_judgments").delete().eq("id", numericId);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  // ── News & Alerts ──────────────────────────────────────────────────────────

  // ── Liquidation Organizations ────────────────────────────────────────────

  if (pathname === "/api/v1/admin/liquidation-orgs" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data, error } = await x.sb
      .from("liquidation_organizations")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { organizations: data ?? [] };
  }

  if (pathname === "/api/v1/admin/liquidation-orgs" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { name: string };
    if (!b.name?.trim()) throw new Error("name is required");
    const { data, error } = await x.sb
      .from("liquidation_organizations")
      .insert({ name: b.name.trim() })
      .select("id, name, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { organization: data };
  }

  const adminLiquidationOrgById = pathname.match(/^\/api\/v1\/admin\/liquidation-orgs\/([^/]+)$/);
  if (adminLiquidationOrgById && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const id = adminLiquidationOrgById[1];
    const { data: orgData, error: orgError } = await x.sb
      .from("liquidation_organizations")
      .select("name")
      .eq("id", id)
      .single();
    if (orgError) throw new Error(orgError.message);
    const { error: newsError } = await x.sb
      .from("news_alerts")
      .delete()
      .eq("organization", orgData.name);
    if (newsError) throw new Error(newsError.message);
    const { error } = await x.sb.from("liquidation_organizations").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  // ── News & Alerts ──────────────────────────────────────────────────────────

  if (pathname === "/api/v1/admin/news-alerts" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const org = q.get("organization") ?? undefined;
    let query = x.sb
      .from("news_alerts")
      .select("id, headline, organization, pdf_url, body_text, link_url, published_at, created_at")
      .order("published_at", { ascending: false });
    if (org) query = query.eq("organization", org);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { newsAlerts: data ?? [] };
  }

  if (pathname === "/api/v1/admin/news-alerts" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as { headline: string; organization: string; pdfUrl?: string; bodyText?: string; linkUrl?: string; publishedAt?: string };
    if (!b.headline?.trim()) throw new Error("headline is required");
    if (!b.organization?.trim()) throw new Error("organization is required");
    const { data, error } = await x.sb
      .from("news_alerts")
      .insert({
        headline: b.headline.trim(),
        organization: b.organization.trim(),
        pdf_url: b.pdfUrl?.trim() ?? null,
        body_text: b.bodyText?.trim() ?? null,
        link_url: b.linkUrl?.trim() ?? null,
        published_at: b.publishedAt ?? new Date().toISOString(),
      })
      .select("id, headline, organization, pdf_url, body_text, link_url, published_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { newsAlert: data };
  }

  const adminNewsAlertById = pathname.match(/^\/api\/v1\/admin\/news-alerts\/([^/]+)$/);
  if (adminNewsAlertById && m === "DELETE") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const id = adminNewsAlertById[1];
    const { error } = await x.sb.from("news_alerts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  const caseMsgs = pathname.match(/^\/api\/v1\/cases\/([^/]+)\/messages$/);
  if (caseMsgs && m === "GET") {
    await requireProfile();
    const sb = getSupabase();
    const caseId = caseMsgs[1];
    const { data, error } = await sb
      .from("messages")
      .select("id, body, created_at, profiles!messages_sender_id_fkey(email, role)")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true })
      .limit(300);
    if (error) throw new Error(error.message);
    const messages = (data ?? []).map((row: Record<string, unknown>) => {
      const s = row.profiles as { email: string; role: string };
      return {
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        sender: { email: s?.email ?? "", role: s?.role ?? "" },
      };
    });
    return { messages };
  }

  if (caseMsgs && m === "POST") {
    const x = await requireProfile();
    const b = body as { body?: string };
    const { data, error } = await x.sb
      .from("messages")
      .insert({ case_id: caseMsgs[1], sender_id: x.uid, body: b.body ?? "" })
      .select("id, body, created_at, profiles!messages_sender_id_fkey(email, role)")
      .single();
    if (error) throw new Error(error.message);
    const s = (data as Record<string, unknown>).profiles as { email: string; role: string };
    if (x.role === "ADMIN") {
      const caseId = caseMsgs[1];
      const { data: caseRow } = await x.sb
        .from("cases")
        .select("title, reference")
        .eq("id", caseId)
        .maybeSingle();
      const matterLabel = [caseRow?.reference, caseRow?.title].filter(Boolean).join(" — ") || "your matter";
      const preview =
        (b.body ?? "").length > 400 ? `${(b.body ?? "").slice(0, 400)}…` : (b.body ?? "");
      const { data: assigns } = await x.sb.from("case_assignments").select("user_id").eq("case_id", caseId);
      for (const a of assigns ?? []) {
        const assignUserId = (a as { user_id: string }).user_id;
        const { data: prof } = await x.sb.from("profiles").select("role").eq("id", assignUserId).maybeSingle();
        if ((prof as { role?: string } | null)?.role !== "CLIENT") continue;
        void notifyClientByEmail({
          recipientUserId: assignUserId,
          subject: `[N&A Jurists] New message — ${matterLabel}`,
          text: `Your legal team sent a message regarding ${matterLabel}:\n\n${preview}\n\nSign in to the client portal to read and reply.${clientNotifyEmailLinks()}`,
        });
      }
    }
    if (x.role === "CLIENT") {
      const caseId = caseMsgs[1];
      const { data: caseRow } = await x.sb
        .from("cases")
        .select("title, reference")
        .eq("id", caseId)
        .maybeSingle();
      const matterLabel = [caseRow?.reference, caseRow?.title].filter(Boolean).join(" — ") || "your matter";
      const preview =
        (b.body ?? "").length > 400 ? `${(b.body ?? "").slice(0, 400)}…` : (b.body ?? "");
      void notifyPortalAdmins(
        `[Portal] Client message — ${matterLabel}`,
        `Client ${s.email} wrote:\n\n${preview}`,
      );
    }
    return {
      message: {
        id: (data as Record<string, unknown>).id,
        body: (data as Record<string, unknown>).body,
        createdAt: (data as Record<string, unknown>).created_at,
        sender: { email: s.email, role: s.role },
      },
    };
  }

  const caseDocs = pathname.match(/^\/api\/v1\/cases\/([^/]+)\/documents$/);
  if (caseDocs && m === "GET") {
    await requireProfile();
    const sb = getSupabase();
    const { data, error } = await sb
      .from("documents")
      .select(
        "id, original_name, size, created_at, visible_to_client, profiles!documents_uploaded_by_id_fkey(email)",
      )
      .eq("case_id", caseDocs[1])
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const documents = (data ?? []).map((d: Record<string, unknown>) => {
      const u = d.profiles as { email: string };
      return {
        id: d.id,
        originalName: d.original_name,
        size: d.size,
        createdAt: d.created_at,
        visibleToClient: d.visible_to_client !== false,
        uploadedBy: { email: u?.email ?? "" },
      };
    });
    return { documents };
  }

  if (pathname === "/api/v1/admin/website-team/seed-defaults" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { error: delErr } = await x.sb
      .from("website_team_members")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) throw new Error(delErr.message);
    const seedRows = getDefaultWebsiteTeamSeedRows();
    const { error: insErr } = await x.sb.from("website_team_members").insert(seedRows);
    if (insErr) throw new Error(insErr.message);
    return { ok: true };
  }

  if (pathname === "/api/v1/admin/website-team/clear" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { error: delErr } = await x.sb
      .from("website_team_members")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) throw new Error(delErr.message);
    return { ok: true };
  }

  if (pathname === "/api/v1/admin/website-team" && m === "GET") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const { data, error } = await x.sb
      .from("website_team_members")
      .select("id, section, sort_order, name, title, bio, image_key, photo_storage_path, delay_ms");
    if (error) throw new Error(error.message);
    const raw = [...(data ?? [])] as Record<string, unknown>[];
    raw.sort((a, b) => {
      const ra = a.section === "founder" ? 0 : 1;
      const rb = b.section === "founder" ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
    });
    const rows = raw.map((row) => mapWebsiteTeamAdminRow(row));
    return { rows };
  }

  if (pathname === "/api/v1/admin/website-team" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as Record<string, unknown>;
    const section = b.section === "founder" ? "founder" : "member";
    const name = coerceStr(b.name);
    if (!name) throw new Error("Name is required");
    const sortOrder = Number(b.sortOrder ?? 0);
    const title = coerceStr(b.title);
    const bio = coerceStr(b.bio);
    const delayMs = Number(b.delayMs ?? 100);
    const { photo_storage_path, image_key } = normalizeTeamPhotoFields(
      b.photoStoragePath as string | null | undefined,
      b.imageKey as string | null | undefined,
    );
    const { data, error } = await x.sb
      .from("website_team_members")
      .insert({
        section,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
        name,
        title,
        bio,
        image_key,
        photo_storage_path,
        delay_ms: Number.isFinite(delayMs) ? delayMs : 100,
        updated_at: new Date().toISOString(),
      })
      .select("id, section, sort_order, name, title, bio, image_key, photo_storage_path, delay_ms")
      .single();
    if (error) throw new Error(error.message);
    const row = data as Record<string, unknown>;
    return {
      row: mapWebsiteTeamAdminRow(row),
    };
  }

  if (pathname === "/api/v1/admin/website-team/reorder" && m === "POST") {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const b = body as Record<string, unknown>;
    const section = b.section === "founder" ? "founder" : "member";
    const orderedIds = Array.isArray(b.orderedIds) ? b.orderedIds.map((id) => String(id)) : [];
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const id of orderedIds) {
      if (!uuidRe.test(id)) throw new Error("Invalid team row id");
    }
    if (new Set(orderedIds).size !== orderedIds.length) {
      throw new Error("Duplicate ids in reorder list");
    }

    const { data: secRows, error: secErr } = await x.sb
      .from("website_team_members")
      .select("id")
      .eq("section", section);
    if (secErr) throw new Error(secErr.message);
    const expectedIds = new Set((secRows ?? []).map((r: { id: string }) => String(r.id)));
    if (orderedIds.length !== expectedIds.size) {
      throw new Error("Reorder list must include every row in this section exactly once");
    }
    for (const id of orderedIds) {
      if (!expectedIds.has(id)) throw new Error("Reorder id does not belong to this section");
    }

    const updatedAt = new Date().toISOString();
    const results = await Promise.all(
      orderedIds.map((id, idx) =>
        x.sb
          .from("website_team_members")
          .update({
            sort_order: (idx + 1) * 10,
            updated_at: updatedAt,
          })
          .eq("id", id)
          .eq("section", section),
      ),
    );
    for (const r of results) {
      if (r.error) throw new Error(r.error.message);
    }

    return { ok: true };
  }

  const websiteTeamIdMatch = pathname.match(/^\/api\/v1\/admin\/website-team\/([^/]+)$/);
  if (websiteTeamIdMatch && (m === "PATCH" || m === "DELETE")) {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const rowId = websiteTeamIdMatch[1];
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(rowId)) throw new Error("Invalid team row id");

    if (m === "DELETE") {
      const { data: prevMeta } = await x.sb
        .from("website_team_members")
        .select("photo_storage_path")
        .eq("id", rowId)
        .maybeSingle();
      const { error } = await x.sb.from("website_team_members").delete().eq("id", rowId);
      if (error) throw new Error(error.message);
      const oldPath = (prevMeta as { photo_storage_path?: string | null } | null)?.photo_storage_path;
      if (oldPath) {
        await x.sb.storage.from(WEBSITE_TEAM_BUCKET).remove([oldPath]);
      }
      return { ok: true };
    }

    const b = body as Record<string, unknown>;
    const patchKeys = (
      [
        "section",
        "name",
        "title",
        "bio",
        "sortOrder",
        "delayMs",
        "photoStoragePath",
        "imageKey",
      ] as const
    ).filter((k) => b[k] !== undefined);
    const sortOrderOnly =
      patchKeys.length === 1 && patchKeys[0] === "sortOrder";
    const updatedAt = new Date().toISOString();

    if (sortOrderOnly) {
      const so = Number(b.sortOrder);
      if (!Number.isFinite(so)) throw new Error("Invalid sort order");
      const { data, error } = await x.sb
        .from("website_team_members")
        .update({ sort_order: so, updated_at: updatedAt })
        .eq("id", rowId)
        .select("id, section, sort_order, name, title, bio, image_key, photo_storage_path, delay_ms")
        .single();
      if (error) throw new Error(error.message);
      return { row: mapWebsiteTeamAdminRow(data as Record<string, unknown>) };
    }

    const { data: prevRow, error: prevErr } = await x.sb
      .from("website_team_members")
      .select("photo_storage_path, image_key")
      .eq("id", rowId)
      .single();
    if (prevErr) throw new Error(prevErr.message);
    const prev = prevRow as { photo_storage_path: string | null; image_key: string | null };

    const patch: Record<string, unknown> = {
      updated_at: updatedAt,
    };
    if (b.section === "founder" || b.section === "member") patch.section = b.section;
    if (typeof b.name === "string") patch.name = b.name;
    if (typeof b.title === "string") patch.title = b.title;
    if (typeof b.bio === "string") patch.bio = b.bio;
    if (b.sortOrder !== undefined) {
      const so = Number(b.sortOrder);
      if (Number.isFinite(so)) patch.sort_order = so;
    }
    if (b.delayMs !== undefined) {
      const dm = Number(b.delayMs);
      if (Number.isFinite(dm)) patch.delay_ms = dm;
    }
    if ("photoStoragePath" in b || "imageKey" in b) {
      const norm = normalizeTeamPhotoFields(
        "photoStoragePath" in b ? (b.photoStoragePath as string | null) : prev.photo_storage_path,
        "imageKey" in b ? (b.imageKey as string | null) : prev.image_key,
      );
      patch.photo_storage_path = norm.photo_storage_path;
      patch.image_key = norm.image_key;
    }

    const oldPhotoPath = prev.photo_storage_path ?? null;

    const { data, error } = await x.sb
      .from("website_team_members")
      .update(patch)
      .eq("id", rowId)
      .select("id, section, sort_order, name, title, bio, image_key, photo_storage_path, delay_ms")
      .single();
    if (error) throw new Error(error.message);
    const row = data as Record<string, unknown>;
    const newPhotoPath =
      row.photo_storage_path == null || row.photo_storage_path === ""
        ? null
        : String(row.photo_storage_path);
    if (oldPhotoPath && oldPhotoPath !== newPhotoPath) {
      await x.sb.storage.from(WEBSITE_TEAM_BUCKET).remove([oldPhotoPath]);
    }
    return {
      row: mapWebsiteTeamAdminRow(row),
    };
  }

  throw new Error(`Unsupported API: ${m} ${pathname}`);
}

/** Read-only GET — no full-screen loading overlay (inline skeleton on the page instead). */
export async function portalApiJsonSilent(
  method: string,
  pathWithQuery: string,
  body?: unknown,
): Promise<unknown> {
  return portalApiJsonInner(method, pathWithQuery, body);
}

export async function portalApiJson(
  method: string,
  pathWithQuery: string,
  body?: unknown,
): Promise<unknown> {
  const pathOnly = pathWithQuery.split("?")[0] ?? pathWithQuery;
  const silentGet =
    method === "GET" &&
    (pathOnly === "/api/v1/me/hearings" ||
      pathOnly === "/api/v1/admin/hearings/upcoming-30d" ||
      pathOnly === "/api/v1/admin/alerts/missing-upcoming-hearings");
  if (silentGet) {
    return portalApiJsonSilent(method, pathWithQuery, body);
  }
  return withPortalLoading(() => portalApiJsonInner(method, pathWithQuery, body));
}

export async function prefetchCaseDocumentSignedUrls(
  caseId: string,
  docIds: string[],
): Promise<Record<string, string>> {
  if (!docIds.length) return {};
  const { sb } = await requireProfile();
  const { data: docs, error } = await sb
    .from("documents")
    .select("id, storage_path")
    .eq("case_id", caseId)
    .in("id", docIds);
  if (error || !docs?.length) return {};

  const rows = docs as { id: string; storage_path: string }[];
  const paths = rows.map((d) => d.storage_path);
  const { data: signed, error: se } = await sb.storage
    .from("case-files")
    .createSignedUrls(paths, 3600);
  if (se || !signed) return {};

  const out: Record<string, string> = {};
  for (let i = 0; i < rows.length; i++) {
    const url = signed[i]?.signedUrl;
    if (url) out[rows[i].id] = url;
  }
  return out;
}

export async function getCaseDocumentSignedUrl(
  caseId: string,
  docId: string,
): Promise<{ url: string; fileName: string }> {
  const { sb } = await requireProfile();
  const { data: doc, error } = await sb
    .from("documents")
    .select("storage_path, original_name")
    .eq("id", docId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (error || !doc) throw new Error("Not found");
  const path = (doc as { storage_path: string }).storage_path;
  const { data: signed, error: se } = await sb.storage
    .from("case-files")
    .createSignedUrl(path, 3600);
  if (se || !signed?.signedUrl) throw new Error(se?.message ?? "Could not sign URL");
  return {
    url: signed.signedUrl,
    fileName: String((doc as { original_name?: string }).original_name ?? "document"),
  };
}

export async function downloadCaseDocumentBlob(caseId: string, docId: string): Promise<Blob> {
  const { url } = await getCaseDocumentSignedUrl(caseId, docId);
  const r = await fetch(url);
  if (!r.ok) throw new Error("Download failed");
  return r.blob();
}

export async function uploadWebsiteTeamPhoto(file: File): Promise<{ photoStoragePath: string }> {
  return withPortalLoading(async () => {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller");
    const path = `${crypto.randomUUID()}.${teamPhotoExtension(file)}`;
    const { error: upErr } = await x.sb.storage.from(WEBSITE_TEAM_BUCKET).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    return { photoStoragePath: path };
  });
}

export async function portalApiUpload(
  caseId: string,
  file: File,
  opts?: { visibleToClient?: boolean },
): Promise<unknown> {
  return withPortalLoading(async () => {
    const x = await requireProfile();
    if (x.role !== "ADMIN") throw new Error("Forbidden");
    const path = `${caseId}/${crypto.randomUUID()}_${file.name}`;
    const { error: upErr } = await x.sb.storage.from("case-files").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    const visibleToClient = opts?.visibleToClient !== false;
    const { data: row, error } = await x.sb
      .from("documents")
      .insert({
        case_id: caseId,
        uploaded_by_id: x.uid,
        original_name: file.name,
        storage_path: path,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        visible_to_client: visibleToClient,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { document: row };
  });
}
