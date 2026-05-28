import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/** Same rule as portal GET /api/v1/admin/alerts/missing-upcoming-hearings */
async function casesMissingUpcomingHearing(
  admin: ReturnType<typeof createClient>,
): Promise<Array<{ id: string; title: string; reference: string | null; status: string }>> {
  const nowIso = new Date().toISOString();
  const { data: cases, error: cErr } = await admin
    .from("cases")
    .select("id, title, reference, status")
    .eq("archived", false);
  if (cErr) throw new Error(cErr.message);
  const caseList = cases ?? [];
  if (caseList.length === 0) return [];

  const ids = caseList.map((c: { id: string }) => c.id);
  const { data: fh, error: hErr } = await admin
    .from("hearings")
    .select("case_id")
    .gte("scheduled_at", nowIso)
    .in("case_id", ids);
  if (hErr) throw new Error(hErr.message);

  const hasFuture = new Set((fh ?? []).map((h: { case_id: string }) => h.case_id));
  return caseList.filter((c: { id: string }) => !hasFuture.has(c.id)) as Array<{
    id: string;
    title: string;
    reference: string | null;
    status: string;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only (cron or curl with CRON_HEARING_DIGEST_SECRET)" }, 405);
  }

  const text = await req.text();
  let payload: { force?: boolean } = {};
  if (text.trim()) {
    try {
      const p = JSON.parse(text) as Record<string, unknown>;
      if (p.force === true) payload.force = true;
    } catch {
      return json({ ok: false, error: "Invalid JSON body" }, 400);
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey =
    Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ ok: false, error: "Server misconfigured" }, 500);
  }

  const auth = req.headers.get("Authorization") ?? "";
  const headerSecret = req.headers.get("x-cron-secret") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const cronSecret = Deno.env.get("CRON_HEARING_DIGEST_SECRET")?.trim() ?? "";

  if (!cronSecret) {
    return json({ ok: false, error: "CRON_HEARING_DIGEST_SECRET not configured" }, 500);
  }
  const authorized =
    bearer === cronSecret || headerSecret === cronSecret;
  if (!authorized) {
    return json(
      {
        ok: false,
        error:
          "Unauthorized — send Bearer CRON_HEARING_DIGEST_SECRET or header x-cron-secret",
      },
      401,
    );
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1" || payload.force === true;

  const admin = createClient(supabaseUrl, serviceKey);
  const nowIso = new Date().toISOString();
  const todayUtc = nowIso.slice(0, 10);

  const { data: dedupeRow, error: dedupeErr } = await admin
    .from("portal_cron_state")
    .select("last_sent_on")
    .eq("job_key", "hearing_alert_digest")
    .maybeSingle();

  if (dedupeErr && /portal_cron_state|does not exist/i.test(dedupeErr.message)) {
    return json(
      {
        ok: false,
        error: "Run migration 20260430210000_portal_cron_state.sql (table portal_cron_state)",
      },
      500,
    );
  }
  if (dedupeErr) {
    return json({ ok: false, error: dedupeErr.message }, 500);
  }

  const lastDay =
    dedupeRow?.last_sent_on != null ? String(dedupeRow.last_sent_on).slice(0, 10) : null;
  if (!force && lastDay === todayUtc) {
    return json({
      ok: true,
      skipped: true,
      reason: "already_sent_today",
      date: todayUtc,
    });
  }

  let missing: Array<{ id: string; title: string; reference: string | null; status: string }>;
  try {
    missing = await casesMissingUpcomingHearing(admin);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, 500);
  }

  if (missing.length === 0) {
    return json({ ok: true, count: 0, emailed: false });
  }

  const lines = missing.slice(0, 45).map((c) => {
    const ref = c.reference?.trim() ? `${c.reference} · ` : "";
    return `- ${ref}${c.title} (status: ${c.status})`;
  });
  const bodyText = `Scheduled digest: open matters with no upcoming hearing from today onward.\n\n${lines.join("\n")}${missing.length > 45 ? `\n… and ${missing.length - 45} more` : ""}\n\nOpen the portal → Hearing alerts for assigned clients and links.`;

  const notifyRes = await fetch(`${supabaseUrl}/functions/v1/portal-notify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      notifyAdmin: true,
      subject: `[N&A Jurists Portal] Hearing alerts: ${missing.length} matter(s) need an upcoming hearing`,
      text: bodyText,
    }),
  });

  let notifyJson: { ok?: boolean; sent?: boolean; skipped?: boolean; error?: string } = {};
  try {
    notifyJson = (await notifyRes.json()) as typeof notifyJson;
  } catch {
    /* empty */
  }

  if (!notifyRes.ok || notifyJson.ok === false) {
    return json(
      {
        ok: false,
        error: "portal-notify-email failed",
        status: notifyRes.status,
        detail: notifyJson,
      },
      502,
    );
  }

  if (notifyJson.sent === true) {
    const { error: upErr } = await admin.from("portal_cron_state").upsert(
      {
        job_key: "hearing_alert_digest",
        last_sent_on: todayUtc,
        updated_at: nowIso,
      },
      { onConflict: "job_key" },
    );
    if (upErr) {
      console.warn("[portal-hearing-alert-digest] dedupe upsert failed:", upErr.message);
    }
  }

  return json({
    ok: true,
    count: missing.length,
    emailed: notifyJson.sent === true,
    skipped: notifyJson.skipped === true,
  });
});
