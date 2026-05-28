import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import nodemailer from "npm:nodemailer@6.9.16";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

type Body = {
  recipientUserId?: string;
  subject?: string;
  text?: string;
  /** When true, send to active portal ADMIN profiles only (not arbitrary env email lists). */
  notifyAdmin?: boolean;
  /** Logged-in admin only: extra admin profile emails to omit (lowercase). Ignored for service_role calls. */
  suppressAdminTo?: string[];
};

/** NOTIFY_EMAIL_FROM: `Name <email@domain.com>` or plain `email@domain.com`. */
/** Comma/space-separated lowercased addresses from an env var (optional suppression lists). */
function emailSuppressionSet(envName: string): Set<string> {
  const raw = Deno.env.get(envName)?.trim() ?? "";
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@")),
  );
}

/** Non-existent client mailbox → bounces hit the Gmail SMTP inbox; never send here. */
const SUPPRESS_CLIENT_NOTIFY_ALWAYS = new Set<string>(["najurist@gmail.com"]);

/** Inbox that should not receive `[Portal] …` admin copies (firm routing). */
const SUPPRESS_ADMIN_NOTIFY_ALWAYS = new Set<string>(["ab887812@gmail.com"]);

function mergedClientSuppress(): Set<string> {
  const s = emailSuppressionSet("CLIENT_NOTIFY_EXCLUDE_EMAILS");
  for (const e of SUPPRESS_CLIENT_NOTIFY_ALWAYS) s.add(e);
  return s;
}

function mergedAdminSuppress(): Set<string> {
  const s = emailSuppressionSet("ADMIN_NOTIFY_EXCLUDE_EMAILS");
  for (const e of SUPPRESS_ADMIN_NOTIFY_ALWAYS) s.add(e);
  return s;
}

/** Only addresses the server already treats as omit-from-admin can be reinforced from the portal (no arbitrary coworker suppression). */
function parseRequesterAdminSuppress(payload: Body): Set<string> | undefined {
  const raw = payload.suppressAdminTo;
  if (!Array.isArray(raw)) return undefined;
  const s = new Set<string>();
  for (const x of raw) {
    if (typeof x !== "string" || !x.includes("@")) continue;
    const e = x.trim().toLowerCase();
    if (SUPPRESS_ADMIN_NOTIFY_ALWAYS.has(e)) s.add(e);
    if (s.size > 48) break;
  }
  return s.size ? s : undefined;
}

function parseNotifyFrom(header: string): { name?: string; email: string } {
  const t = header.trim();
  const m = t.match(/^(.+?)\s*<([^>]+)>\s*$/);
  if (m) {
    const email = m[2].trim();
    const name = m[1].trim().replace(/^["']|["']$/g, "");
    if (email.includes("@")) {
      return { name: name || undefined, email };
    }
  }
  return { email: t };
}

function providerErrorDetail(errText: string): string {
  let detail = errText.slice(0, 500);
  try {
    const j = JSON.parse(errText) as { message?: string; name?: string };
    if (typeof j.message === "string") {
      detail = j.message.slice(0, 500);
    } else if (typeof j.name === "string") {
      detail = `${j.name}: ${detail}`.slice(0, 500);
    }
  } catch {
    /* use raw slice */
  }
  return detail;
}

type SendCtx = {
  gmailUser: string;
  gmailPass: string;
  useGmail: boolean;
  brevoKey: string | undefined;
  resendKey: string | undefined;
  fromHeader: string;
  sender: { name?: string; email: string };
};

function loadSendCtx(): SendCtx {
  const gmailUser = Deno.env.get("GMAIL_SMTP_USER")?.trim() ?? "";
  const gmailPass = (Deno.env.get("GMAIL_APP_PASSWORD") ?? "").replace(/\s/g, "").trim();
  const useGmail = gmailUser.includes("@") && gmailPass.length > 0;
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromHeader =
    Deno.env.get("NOTIFY_EMAIL_FROM") ??
    Deno.env.get("EMAIL_FROM") ??
    (useGmail ? `N&A Jurists <${gmailUser}>` : "N&A Jurists <onboarding@resend.dev>");
  const sender = parseNotifyFrom(fromHeader);
  return { gmailUser, gmailPass, useGmail, brevoKey, resendKey, fromHeader, sender };
}

async function sendOne(
  ctx: SendCtx,
  toEmail: string,
  subject: string,
  text: string,
): Promise<{ ok: true; provider: string } | { ok: false; detail: string }> {
  const { gmailUser, gmailPass, useGmail, brevoKey, resendKey, fromHeader, sender } = ctx;

  if (useGmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });
      const fromLine =
        sender.email.toLowerCase() === gmailUser.toLowerCase() && sender.name
          ? `"${sender.name}" <${gmailUser}>`
          : gmailUser;
      await transporter.sendMail({
        from: fromLine,
        to: toEmail,
        subject,
        text,
      });
      return { ok: true, provider: "gmail" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[portal-notify-email] Gmail SMTP error:", msg);
      return { ok: false, detail: msg.slice(0, 500) };
    }
  }

  if (brevoKey) {
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": brevoKey,
      },
      body: JSON.stringify({
        sender: {
          name: sender.name ?? sender.email.split("@")[0] ?? "Portal",
          email: sender.email,
        },
        to: [{ email: toEmail }],
        subject,
        textContent: text,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("[portal-notify-email] Brevo error:", brevoRes.status, errText);
      return { ok: false, detail: providerErrorDetail(errText) };
    }
    return { ok: true, provider: "brevo" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromHeader,
      to: [toEmail],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[portal-notify-email] Resend error:", res.status, errText);
    return { ok: false, detail: providerErrorDetail(errText) };
  }
  return { ok: true, provider: "resend" };
}

/** Active `profiles` with role ADMIN only (service role reads all rows). */
async function sendAdminNotifyEmails(
  subject: string,
  text: string,
  requesterSuppress?: ReadonlySet<string>,
): Promise<Response> {
  const ctx = loadSendCtx();
  if (!ctx.sender.email.includes("@")) {
    return json({ ok: false, error: "Invalid NOTIFY_EMAIL_FROM" }, 400);
  }

  const useGmail = ctx.useGmail;
  const brevoKey = ctx.brevoKey;
  const resendKey = ctx.resendKey;

  if (!useGmail && !brevoKey && !resendKey) {
    console.log(`[portal-notify-email] No email provider — would send: ${subject}`);
    return json({
      ok: true,
      skipped: true,
      reason:
        "No provider: set GMAIL_SMTP_USER + GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY",
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey =
    Deno.env.get("SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    "";
  let dbAdminEmails: string[] = [];
  if (supabaseUrl && serviceKey) {
    try {
      const adminSb = createClient(supabaseUrl, serviceKey);
      const { data: admins, error } = await adminSb
        .from("profiles")
        .select("email, disabled, role")
        .eq("role", "ADMIN")
        .eq("disabled", false);
      if (error) {
        console.warn("[portal-notify-email] admin profile query failed:", error.message);
      } else {
        dbAdminEmails = (admins ?? [])
          .map((row) => String((row as { email?: string }).email ?? "").trim().toLowerCase())
          .filter((email) => email.includes("@"));
      }
    } catch (e) {
      console.warn("[portal-notify-email] admin profile query error:", e instanceof Error ? e.message : String(e));
    }
  }

  const adminExclude = mergedAdminSuppress();
  if (requesterSuppress) {
    for (const e of requesterSuppress) adminExclude.add(e);
  }
  const emails = [...new Set(dbAdminEmails)].filter((e) => !adminExclude.has(e));
  if (emails.length === 0) {
    console.log("[portal-notify-email] no admin recipients after exclude list — skip admin notify:", subject.slice(0, 80));
    return json({
      ok: true,
      skipped: true,
      reason: "No active ADMIN profile emails, or all excluded by ADMIN_NOTIFY_EXCLUDE_EMAILS",
    });
  }
  const results: string[] = [];
  for (const toEmail of emails) {
    const r = await sendOne(ctx, toEmail, subject, text);
    if (!r.ok) {
      return json({ ok: false, error: "Email provider error", detail: r.detail }, 502);
    }
    results.push(r.provider);
  }
  console.info("[portal-notify-email] admin notify sent", { count: emails.length, subject: subject.slice(0, 80) });
  return json({ ok: true, sent: true, provider: results[0] ?? "multi", recipients: emails.length });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey =
    Deno.env.get("SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    "";
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ ok: false, error: "Server misconfigured" }, 500);
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  // Server-to-server only: Bearer must be the service_role JWT; body must be notifyAdmin (cron digest).
  if (serviceKey && bearerToken === serviceKey && payload.notifyAdmin === true) {
    const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
    const text = typeof payload.text === "string" ? payload.text : "";
    if (!subject || !text) {
      return json({ ok: false, error: "subject and text required" }, 400);
    }
    return await sendAdminNotifyEmails(subject, text);
  }

  if (!authHeader.startsWith("Bearer ")) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const adminSb = createClient(supabaseUrl, serviceKey);
  const { data: actor, error: profErr } = await adminSb
    .from("profiles")
    .select("role, disabled")
    .eq("id", user.id)
    .maybeSingle();
  if (profErr || !actor || actor.disabled) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }
  if (actor.role !== "ADMIN") {
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  const text = typeof payload.text === "string" ? payload.text : "";

  if (!subject || !text) {
    return json({ ok: false, error: "subject and text required" }, 400);
  }

  if (payload.notifyAdmin === true) {
    const extra = parseRequesterAdminSuppress(payload);
    return await sendAdminNotifyEmails(subject, text, extra);
  }

  const ctx = loadSendCtx();
  if (!ctx.sender.email.includes("@")) {
    return json({ ok: false, error: "Invalid NOTIFY_EMAIL_FROM" }, 400);
  }

  const useGmail = ctx.useGmail;
  const brevoKey = ctx.brevoKey;
  const resendKey = ctx.resendKey;

  if (!useGmail && !brevoKey && !resendKey) {
    console.log(`[portal-notify-email] No email provider — would send: ${subject}`);
    return json({
      ok: true,
      skipped: true,
      reason:
        "No provider: set GMAIL_SMTP_USER + GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY",
    });
  }

  // --- Client notify (existing behaviour)
  const recipientUserId =
    typeof payload.recipientUserId === "string" ? payload.recipientUserId.trim() : "";
  if (!recipientUserId) {
    return json({ ok: false, error: "recipientUserId required for client emails" }, 400);
  }

  const { data: recipient, error: rErr } = await adminSb
    .from("profiles")
    .select("email, role, disabled")
    .eq("id", recipientUserId)
    .maybeSingle();
  if (rErr || !recipient || recipient.disabled || recipient.role !== "CLIENT") {
    return json(
      {
        ok: false,
        error: "Invalid recipient",
        detail:
          "Assignee must exist in profiles with role CLIENT and not disabled. Status emails only go to clients.",
      },
      400,
    );
  }

  let toEmail = typeof recipient.email === "string" ? recipient.email.trim() : "";
  if (!toEmail) {
    const { data: authData, error: authErr } = await adminSb.auth.admin.getUserById(recipientUserId);
    if (authErr || !authData?.user?.email?.trim()) {
      return json({ ok: false, error: "Invalid recipient" }, 400);
    }
    toEmail = authData.user.email.trim();
  }

  const lower = toEmail.toLowerCase();
  const clientExclude = mergedClientSuppress();
  if (clientExclude.has(lower)) {
    console.info("[portal-notify-email] skip client (CLIENT_NOTIFY_EXCLUDE_EMAILS):", lower);
    return json({ ok: true, skipped: true, reason: "client_recipient_excluded" });
  }
  if (ctx.useGmail && ctx.gmailUser.toLowerCase() === lower) {
    console.info("[portal-notify-email] skip client: recipient equals GMAIL_SMTP_USER (avoids bogus sends/bounces)");
    return json({ ok: true, skipped: true, reason: "client_recipient_is_smtp_login" });
  }

  const providerName = useGmail ? "gmail" : brevoKey ? "brevo" : "resend";
  console.info("[portal-notify-email] recipient resolved", {
    recipientUserId,
    toEmail,
    subject: subject.slice(0, 80),
    provider: providerName,
  });

  const r = await sendOne(ctx, toEmail, subject, text);
  if (!r.ok) {
    return json({ ok: false, error: "Email provider error", detail: r.detail }, 502);
  }
  return json({ ok: true, sent: true, provider: r.provider });
});
