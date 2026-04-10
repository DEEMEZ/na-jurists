import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
  if (rErr || !recipient?.email || recipient.disabled || recipient.role !== "CLIENT") {
    return json({ ok: false, error: "Invalid recipient" }, 400);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from =
    Deno.env.get("NOTIFY_EMAIL_FROM") ??
    Deno.env.get("EMAIL_FROM") ??
    "N&A Jurists <onboarding@resend.dev>";

  if (!resendKey) {
    console.log(
      `[portal-notify-email] RESEND_API_KEY not set — would send to ${recipient.email}: ${subject}`,
    );
    return json({ ok: true, skipped: true, reason: "RESEND_API_KEY not configured" });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient.email],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[portal-notify-email] Resend error:", res.status, errText);
    return json({ ok: false, error: "Email provider error" }, 502);
  }

  return json({ ok: true, sent: true });
});
