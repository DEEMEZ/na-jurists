import { FunctionsHttpError } from "@supabase/supabase-js";
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
      const j = (await res.json()) as { error?: string; message?: string };
      if (typeof j?.error === "string") return j.error;
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
const PROFILE_CACHE_TTL_MS = 20_000;
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

/** Map PostgREST row (snake_case columns). */
function mapCaseRow(c: Record<string, unknown>) {
  const id = normCaseId(c.id);
  const titleRaw = c.title ?? c["Case Title"];
  const refRaw = c.reference ?? c["Case Number"];
  const statusRaw = c.status ?? c.Status;
  return {
    id,
    title: titleRaw != null && String(titleRaw).trim() !== "" ? String(titleRaw) : "Matter",
    reference: refRaw != null && String(refRaw).trim() !== "" ? String(refRaw) : null,
    status: statusRaw != null && String(statusRaw).trim() !== "" ? String(statusRaw) : "open",
    archived: Boolean(c.archived),
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

/**
 * Email assigned clients when an admin action occurs (status, message, hearing).
 * Requires deployed `portal-notify-email` + Resend secrets (see law-firm-portal/DEPLOYMENT.md).
 */
async function notifyClientByEmail(payload: {
  recipientUserId: string;
  subject: string;
  text: string;
}): Promise<void> {
  try {
    const sb = getSupabase();
    const accessToken = await getFreshAccessToken();
    if (!accessToken) return;
    const { error } = await sb.functions.invoke("portal-notify-email", {
      body: payload,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error) {
      console.warn("[portal-notify-email]", error.message);
    }
  } catch (e) {
    console.warn("[portal-notify-email]", e instanceof Error ? e.message : e);
  }
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

  const [asg, hist, docs, hear] = await Promise.all([
    sb
      .from("case_assignments")
      .select("user_id, profiles!case_assignments_user_id_fkey(id, email)")
      .eq("case_id", caseId),
    sb
      .from("case_status_history")
      .select(
        "id, from_status, to_status, note, created_at, profiles!case_status_history_author_id_fkey(email)",
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    sb
      .from("documents")
      .select(
        "id, original_name, size, created_at, profiles!documents_uploaded_by_id_fkey(email)",
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    sb.from("hearings").select("*").eq("case_id", caseId).order("scheduled_at", { ascending: true }),
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
      uploadedBy: { email: up?.email ?? "" },
    };
  });

  const hearings = (hear.data ?? []).map((h: Record<string, unknown>) => ({
    id: h.id,
    scheduledAt: h.scheduled_at,
    venue: h.venue as string | null,
    notes: h.notes as string | null,
  }));

  return {
    case: {
      id: c.id,
      title: c.title,
      reference: c.reference,
      status: c.status,
      archived: c.archived,
      displayOnWebsite: Boolean((c as Record<string, unknown>).display_on_website),
      assignments,
      statusHistory,
      documents,
      hearings,
    },
  };
}

export async function portalApiJson(
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
        "case_id, cases!case_assignments_case_id_fkey(id, title, reference, status, archived, display_on_website)",
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
      };
    });
    return { cases };
  }

  if (pathname === "/api/v1/me/hearings" && m === "GET") {
    const { sb, uid, role } = await requireProfile();
    if (role !== "CLIENT") {
      throw new Error("Forbidden");
    }
    const { data: assigns, error: e1 } = await sb
      .from("case_assignments")
      .select("case_id")
      .eq("user_id", uid);
    if (e1) throw new Error(e1.message);
    const caseIds = [
      ...new Set(
        (assigns ?? [])
          .map((a) => assignmentRowCaseId(a as Record<string, unknown>))
          .filter((id) => id.length > 0),
      ),
    ];
    if (caseIds.length === 0) {
      return { hearings: [] };
    }
    const { data: hearRows, error: e2 } = await sb
      .from("hearings")
      .select("id, scheduled_at, venue, notes, case_id")
      .in("case_id", caseIds)
      .order("scheduled_at", { ascending: true })
      .limit(200);
    if (e2) throw new Error(e2.message);
    const hCaseIds = [
      ...new Set(
        (hearRows ?? [])
          .map((h: Record<string, unknown>) => String(h.case_id ?? ""))
          .filter((id) => id.length > 0),
      ),
    ];
    const { data: caseRows } =
      hCaseIds.length === 0
        ? { data: [] as Record<string, unknown>[] }
        : await sb.from("cases").select("id, title, reference").in("id", hCaseIds);
    const caseById = new Map(
      (caseRows ?? []).map((c: Record<string, unknown>) => [
        String(c.id),
        {
          title: String(c.title ?? ""),
          reference: (c.reference as string | null) ?? null,
        },
      ]),
    );
    const hearings = (hearRows ?? []).map((h: Record<string, unknown>) => {
      const caseId = String(h.case_id ?? "");
      const meta = caseById.get(caseId);
      return {
        id: h.id as string,
        caseId,
        scheduledAt: h.scheduled_at as string,
        venue: (h.venue as string | null) ?? null,
        notes: (h.notes as string | null) ?? null,
        caseTitle: meta?.title ?? "Matter",
        caseReference: meta?.reference ?? null,
      };
    });
    return { hearings };
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
          "case_id, cases!case_assignments_case_id_fkey(id, title, reference, status, archived, display_on_website)",
        )
        .eq("user_id", x.uid)
        .eq("case_id", caseIdParam)
        .maybeSingle();
      if (!asg) throw new Error("Not found");
      const c = (asg as Record<string, unknown> | null)?.cases as Record<string, unknown> | null;
      const [hearRes, docRes, histRes] = await Promise.all([
        x.sb
          .from("hearings")
          .select("id, scheduled_at, venue, notes")
          .eq("case_id", caseIdParam)
          .order("scheduled_at", { ascending: true }),
        x.sb
          .from("documents")
          .select("id, original_name, size, created_at")
          .eq("case_id", caseIdParam)
          .order("created_at", { ascending: false }),
        x.sb
          .from("case_status_history")
          .select("id, from_status, to_status, note, created_at")
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
        uploadedBy: { email: "" },
      }));
      const statusHistory = (histRes.data ?? []).map((h: Record<string, unknown>) => ({
        id: h.id,
        fromStatus: (h.from_status as string | null) ?? null,
        toStatus: (h.to_status as string) ?? "open",
        note: (h.note as string | null) ?? null,
        createdAt: h.created_at as string,
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
    };
    const { data, error } = await x.sb
      .from("cases")
      .insert({
        title: b.title ?? "",
        reference: b.reference ?? null,
        status: b.status ?? "open",
        display_on_website: b.displayOnWebsite ?? false,
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
    };
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (b.title !== undefined) patch.title = b.title;
    if (b.reference !== undefined) patch.reference = b.reference;
    if (b.archived !== undefined) patch.archived = b.archived;
    if (b.displayOnWebsite !== undefined) patch.display_on_website = b.displayOnWebsite;
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
    const b = body as { status?: string; note?: string };
    const caseId = statusPost[1];
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
    for (const a of assigns ?? []) {
      const assignUserId = (a as { user_id: string }).user_id;
      await x.sb.from("notifications").insert({
        user_id: assignUserId,
        case_id: caseId,
        title,
        body: bodyText,
      });
      void notifyClientByEmail({
        recipientUserId: assignUserId,
        subject: `[N&A Jurists] ${title}`,
        text: `Update for ${matterLabel}:\n\n${bodyText}\n\nSign in to the client portal to view your matter.`,
      });
    }
    const { data: updated } = await x.sb.from("cases").select("*").eq("id", caseId).single();
    return { case: updated };
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
        text: `A hearing was scheduled for ${matterLabel}.\n\nDate & time: ${whenStr}${venueStr}\n\nSign in to the client portal for full details.`,
      });
    }
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
    const now = new Date();
    const { data: cases } = await x.sb.from("cases").select("id, title, reference, status").eq("archived", false);
    const list = [];
    for (const c of cases ?? []) {
      const { data: fh } = await x.sb
        .from("hearings")
        .select("id")
        .eq("case_id", (c as { id: string }).id)
        .gte("scheduled_at", now.toISOString())
        .limit(1);
      if (fh?.length) continue;
      const { data: asg } = await x.sb
        .from("case_assignments")
        .select("profiles!case_assignments_user_id_fkey(email)")
        .eq("case_id", (c as { id: string }).id);
      const clients = (asg ?? []).map(
        (r: Record<string, unknown>) => (r.profiles as { email: string }).email,
      );
      list.push({
        id: (c as { id: string }).id,
        title: (c as { title: string }).title,
        reference: (c as { reference: string | null }).reference,
        status: (c as { status: string }).status,
        clients,
      });
    }
    return { count: list.length, cases: list };
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
          text: `Your legal team sent a message regarding ${matterLabel}:\n\n${preview}\n\nSign in to the client portal to read and reply.`,
        });
      }
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
        "id, original_name, size, created_at, profiles!documents_uploaded_by_id_fkey(email)",
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
        uploadedBy: { email: u?.email ?? "" },
      };
    });
    return { documents };
  }

  throw new Error(`Unsupported API: ${m} ${pathname}`);
}

export async function downloadCaseDocumentBlob(caseId: string, docId: string): Promise<Blob> {
  await requireProfile();
  const sb = getSupabase();
  const { data: doc, error } = await sb
    .from("documents")
    .select("storage_path")
    .eq("id", docId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (error || !doc) throw new Error("Not found");
  const { data: signed, error: se } = await sb.storage
    .from("case-files")
    .createSignedUrl((doc as { storage_path: string }).storage_path, 120);
  if (se || !signed?.signedUrl) throw new Error(se?.message ?? "Could not sign URL");
  const r = await fetch(signed.signedUrl);
  if (!r.ok) throw new Error("Download failed");
  return r.blob();
}

export async function portalApiUpload(caseId: string, file: File): Promise<unknown> {
  const x = await requireProfile();
  if (x.role !== "ADMIN") throw new Error("Forbidden");
  const path = `${caseId}/${crypto.randomUUID()}_${file.name}`;
  const { error: upErr } = await x.sb.storage.from("case-files").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) throw new Error(upErr.message);
  const { data: row, error } = await x.sb
    .from("documents")
    .insert({
      case_id: caseId,
      uploaded_by_id: x.uid,
      original_name: file.name,
      storage_path: path,
      mime_type: file.type || "application/octet-stream",
      size: file.size,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { document: row };
}
