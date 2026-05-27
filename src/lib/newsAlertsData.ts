import { createClient } from "@supabase/supabase-js";

export type NewsAlertItem = {
  id: string;
  headline: string;
  organization: string;
  pdf_url: string;
  published_at: string;
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

export async function loadNewsAlerts(): Promise<NewsAlertItem[]> {
  const sb = createNewsAlertsSupabase();
  if (!sb) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      console.warn(
        "[newsAlertsData] No Supabase URL/key — news alerts will be empty. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }
    return [];
  }

  const { data, error } = await sb
    .from("news_alerts")
    .select("id, headline, organization, pdf_url, published_at")
    .order("published_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[newsAlertsData] Supabase:", error.message);
    }
    return [];
  }

  return (data ?? []) as NewsAlertItem[];
}
