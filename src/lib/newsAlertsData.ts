import { createClient } from "@supabase/supabase-js";

export type NewsAlertItem = {
  id: string;
  headline: string;
  organization: string;
  pdf_url: string | null;
  body_text: string | null;
  link_url: string | null;
  published_at: string;
};

export type LiquidationOrg = {
  id: string;
  name: string;
  created_at: string;
};

function createNewsAlertsSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.SUPABASE_URL?.trim();
  if (!url) return null;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let warnedMissingEnv = false;

function warnMissing() {
  if (!warnedMissingEnv) {
    warnedMissingEnv = true;
    console.warn(
      "[newsAlertsData] No Supabase URL/key — news alerts will be empty. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

const SELECT_FIELDS =
  "id, headline, organization, pdf_url, body_text, link_url, published_at";

export async function loadNewsAlerts(organization?: string): Promise<NewsAlertItem[]> {
  const sb = createNewsAlertsSupabase();
  if (!sb) { warnMissing(); return []; }

  let query = sb
    .from("news_alerts")
    .select(SELECT_FIELDS)
    .order("published_at", { ascending: false });

  if (organization) {
    query = query.eq("organization", organization);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[newsAlertsData] Supabase:", error.message);
    }
    return [];
  }

  return (data ?? []) as NewsAlertItem[];
}

export async function loadNewsAlertById(id: string): Promise<NewsAlertItem | null> {
  const sb = createNewsAlertsSupabase();
  if (!sb) { warnMissing(); return null; }

  const { data, error } = await sb
    .from("news_alerts")
    .select(SELECT_FIELDS)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as NewsAlertItem;
}

export async function loadLiquidationOrgs(): Promise<LiquidationOrg[]> {
  const sb = createNewsAlertsSupabase();
  if (!sb) { warnMissing(); return []; }

  const { data, error } = await sb
    .from("liquidation_organizations")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[newsAlertsData] Supabase orgs:", error.message);
    }
    return [];
  }

  return (data ?? []) as LiquidationOrg[];
}
