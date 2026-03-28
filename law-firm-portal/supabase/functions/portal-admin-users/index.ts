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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
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

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: prof, error: pErr } = await admin
    .from("profiles")
    .select("role, disabled")
    .eq("id", user.id)
    .single();
  if (pErr || !prof || prof.role !== "ADMIN" || prof.disabled) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const action = payload.action as string;

  if (action === "create") {
    const email = String(payload.email ?? "");
    const password = String(payload.password ?? "");
    const role = (payload.role as string) === "ADMIN" ? "ADMIN" : "CLIENT";
    if (!email || password.length < 8) {
      return json({ ok: false, error: "Invalid email or password" }, 400);
    }
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (cErr || !created.user) {
      return json({ ok: false, error: cErr?.message ?? "Create failed" }, 400);
    }
    const { error: uErr } = await admin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", created.user.id);
    if (uErr) {
      return json({ ok: false, error: uErr.message }, 400);
    }
    const { data: row } = await admin
      .from("profiles")
      .select("id, email, role, disabled, created_at")
      .eq("id", created.user.id)
      .single();
    return json({
      ok: true,
      user: row
        ? {
            id: row.id,
            email: row.email,
            role: row.role,
            disabled: row.disabled,
            createdAt: row.created_at,
          }
        : {},
    });
  }

  if (action === "update") {
    const userId = String(payload.userId ?? "");
    if (!userId) return json({ ok: false, error: "Missing userId" }, 400);

    const email = payload.email !== undefined ? String(payload.email) : undefined;
    const password =
      payload.password !== undefined ? String(payload.password) : undefined;
    const role = payload.role as string | undefined;
    const disabled = payload.disabled as boolean | undefined;

    if (password !== undefined && password.length > 0) {
      if (password.length < 8) {
        return json({ ok: false, error: "Password too short" }, 400);
      }
      const { error: pe } = await admin.auth.admin.updateUserById(userId, {
        password,
      });
      if (pe) return json({ ok: false, error: pe.message }, 400);
    }
    if (email !== undefined && email.length > 0) {
      const { error: ee } = await admin.auth.admin.updateUserById(userId, {
        email,
      });
      if (ee) return json({ ok: false, error: ee.message }, 400);
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (role === "ADMIN" || role === "CLIENT") patch.role = role;
    if (typeof disabled === "boolean") patch.disabled = disabled;

    const { error: re } = await admin.from("profiles").update(patch).eq("id", userId);
    if (re) return json({ ok: false, error: re.message }, 400);

    const { data: row } = await admin
      .from("profiles")
      .select("id, email, role, disabled, created_at")
      .eq("id", userId)
      .single();
    return json({
      ok: true,
      user: row
        ? {
            id: row.id,
            email: row.email,
            role: row.role,
            disabled: row.disabled,
            createdAt: row.created_at,
          }
        : {},
    });
  }

  if (action === "delete") {
    const userId = String(payload.userId ?? "");
    if (!userId) return json({ ok: false, error: "Missing userId" }, 400);
    if (userId === user.id) {
      return json({ ok: false, error: "Cannot delete your own account" }, 400);
    }

    const { data: target } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (target?.role === "ADMIN") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "ADMIN");
      if ((count ?? 0) <= 1) {
        return json({ ok: false, error: "Cannot delete the last admin" }, 400);
      }
    }

    const { error: de } = await admin.auth.admin.deleteUser(userId);
    if (de) return json({ ok: false, error: de.message }, 400);
    return json({ ok: true });
  }

  return json({ ok: false, error: "Unknown action" }, 400);
});
