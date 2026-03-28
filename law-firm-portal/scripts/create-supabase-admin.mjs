/**
 * Create an Auth user and set public.profiles.role = ADMIN.
 * Run from repo: cd law-firm-portal/frontend && npm run seed:admin
 *
 * Requires law-firm-portal/scripts/seed-admin.env (copy from seed-admin.env.example)
 * or the same variables in the process environment.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadSeedEnv() {
  const envFile = path.join(__dirname, "seed-admin.env");
  if (!fs.existsSync(envFile)) return;
  const text = fs.readFileSync(envFile, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadSeedEnv();

const url = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
const email = process.env.ADMIN_EMAIL?.trim() ?? "";
const password = process.env.ADMIN_PASSWORD ?? "";

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy scripts/seed-admin.env.example → scripts/seed-admin.env and fill it in.",
  );
  process.exit(1);
}

if (!email || password.length < 8) {
  console.error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in scripts/seed-admin.env",
  );
  process.exit(1);
}

const authHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function main() {
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });

  const createBody = await createRes.json().catch(() => ({}));

  if (!createRes.ok) {
    const msg =
      createBody?.msg ||
      createBody?.message ||
      createBody?.error_description ||
      JSON.stringify(createBody);
    if (createRes.status === 422 || /already|exists|registered/i.test(String(msg))) {
      console.log("User may already exist. Setting profile to ADMIN if needed…");
      const profRes = await fetch(
        `${url}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`,
        { headers: authHeaders },
      );
      const rows = await profRes.json().catch(() => []);
      const userId = Array.isArray(rows) && rows[0]?.id ? rows[0].id : null;
      if (!userId) {
        console.error(
          "Could not find profiles row for this email. Run the SQL migration first, or create the user in the Dashboard.",
          msg,
        );
        process.exit(1);
      }
      await setAdminProfile(userId);
      console.log("OK — profile updated to ADMIN for:", email);
      return;
    }
    console.error("Create user failed:", createRes.status, msg);
    process.exit(1);
  }

  const userId = createBody?.id ?? createBody?.user?.id;
  if (!userId) {
    console.error("Unexpected response:", createBody);
    process.exit(1);
  }

  await setAdminProfile(userId);
  console.log("OK — admin user created:");
  console.log("  Email:", email);
  console.log("  Sign in at your portal /login with this email and password.");
}

async function setAdminProfile(userId) {
  const patchRes = await fetch(
    `${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: {
        ...authHeaders,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ role: "ADMIN" }),
    },
  );

  if (!patchRes.ok) {
    const t = await patchRes.text();
    console.error("Failed to set ADMIN on profiles:", patchRes.status, t);
    process.exit(1);
  }
}

await main();
