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
};

/** NOTIFY_EMAIL_FROM: `Name <email@domain.com>` or plain `email@domain.com`. */
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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ ok: false, error: "Server misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
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

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }
  const recipientUserId = typeof payload.recipientUserId === "string" ? payload.recipientUserId.trim() : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  const text = typeof payload.text === "string" ? payload.text : "";
  if (!recipientUserId || !subject || !text) {
    return json({ ok: false, error: "recipientUserId, subject, and text required" }, 400);
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
    const { data: authData, error: authErr } = await adminSb.auth.admin.getUserById(
      recipientUserId,
    );
    if (authErr || !authData?.user?.email?.trim()) {
      return json({ ok: false, error: "Invalid recipient" }, 400);
    }
    toEmail = authData.user.email.trim();
  }

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
  if (!sender.email.includes("@")) {
    return json({ ok: false, error: "Invalid NOTIFY_EMAIL_FROM" }, 400);
  }

  if (!useGmail && !brevoKey && !resendKey) {
    console.log(
      `[portal-notify-email] No email provider — would send to ${toEmail}: ${subject}`,
    );
    return json({
      ok: true,
      skipped: true,
      reason:
        "No provider: set GMAIL_SMTP_USER + GMAIL_APP_PASSWORD, or BREVO_API_KEY, or RESEND_API_KEY",
    });
  }

  const providerName = useGmail ? "gmail" : brevoKey ? "brevo" : "resend";
  console.info("[portal-notify-email] recipient resolved", {
    recipientUserId,
    toEmail,
    subject: subject.slice(0, 80),
    provider: providerName,
  });

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
      return json({ ok: true, sent: true, provider: "gmail" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[portal-notify-email] Gmail SMTP error:", msg);
      return json(
        { ok: false, error: "Email provider error", detail: msg.slice(0, 500) },
        502,
      );
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
      return json(
        {
          ok: false,
          error: "Email provider error",
          detail: providerErrorDetail(errText),
        },
        502,
      );
    }

    return json({ ok: true, sent: true, provider: "brevo" });
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
    return json(
      {
        ok: false,
        error: "Email provider error",
        detail: providerErrorDetail(errText),
      },
      502,
    );
  }

  return json({ ok: true, sent: true, provider: "resend" });
});
