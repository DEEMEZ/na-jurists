import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_WEBSITE_TEAM,
  type WebsiteTeamPublicMember,
  type WebsiteTeamPublicPayload,
} from "@/lib/websiteTeamDefaults";

function getSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL
  );
}

function createWebsiteTeamSupabase(): SupabaseClient | null {
  const url = getSupabaseUrl();
  if (!url) return null;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = anonKey ?? serviceKey;
  if (!key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const TEAM_BUCKET = "website-team";

function publicUrlForPath(sb: SupabaseClient, path: string | null): string | null {
  const p = path?.trim();
  if (!p) return null;
  const { data } = sb.storage.from(TEAM_BUCKET).getPublicUrl(p);
  return data.publicUrl ?? null;
}

type DbRow = {
  id: string;
  section: string;
  sort_order: number;
  name: string;
  title: string;
  bio: string;
  image_key: string | null;
  photo_storage_path: string | null;
  delay_ms: number;
};

let warnedMissingTeamEnv = false;

function dbMemberToPublic(r: DbRow, sb: SupabaseClient): WebsiteTeamPublicMember {
  return {
    id: r.id,
    sortOrder: r.sort_order,
    name: r.name,
    title: r.title,
    bio: r.bio,
    imageKey: r.image_key,
    photoUrl: publicUrlForPath(sb, r.photo_storage_path),
    delayMs: r.delay_ms,
  };
}

/**
 * Built-in roster is always the baseline on the public site. DB rows whose `sort_order` matches a
 * built-in member replace that card; any other DB rows are appended (portal additions).
 */
function mergeMembersWithDefaults(
  defaults: WebsiteTeamPublicMember[],
  dbMembers: WebsiteTeamPublicMember[],
): WebsiteTeamPublicMember[] {
  const merged = defaults.map((m) => ({ ...m }));
  const appended: WebsiteTeamPublicMember[] = [];

  for (const db of dbMembers) {
    const idx = merged.findIndex((m) => m.sortOrder === db.sortOrder);
    if (idx !== -1) {
      merged[idx] = db;
    } else {
      appended.push(db);
    }
  }

  return [...merged, ...appended].sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapRowsToPayload(rows: DbRow[], sb: SupabaseClient): WebsiteTeamPublicPayload {
  const founderRows = rows
    .filter((r) => r.section === "founder")
    .sort((a, b) => a.sort_order - b.sort_order);
  const memberRows = rows
    .filter((r) => r.section === "member")
    .sort((a, b) => a.sort_order - b.sort_order);

  const founderFromDb = founderRows[0];
  const founder =
    founderFromDb !== undefined
      ? {
          id: founderFromDb.id,
          name: founderFromDb.name,
          title: founderFromDb.title,
          bio: founderFromDb.bio,
          imageKey: founderFromDb.image_key,
          photoUrl: publicUrlForPath(sb, founderFromDb.photo_storage_path),
        }
      : DEFAULT_WEBSITE_TEAM.founder;

  const dbMembersPublic = memberRows.map((r) => dbMemberToPublic(r, sb));

  const members =
    dbMembersPublic.length === 0
      ? DEFAULT_WEBSITE_TEAM.members
      : mergeMembersWithDefaults(DEFAULT_WEBSITE_TEAM.members, dbMembersPublic);

  return {
    founder,
    members,
    source: "database",
  };
}

/**
 * When the table is empty, returns built-in defaults. Otherwise merges DB founder (or default) with
 * DB member rows into the built-in grid (overrides by matching sort_order; extra rows append).
 */
export async function loadWebsiteTeamPayload(): Promise<WebsiteTeamPublicPayload> {
  const sb = createWebsiteTeamSupabase();
  if (!sb && !warnedMissingTeamEnv) {
    warnedMissingTeamEnv = true;
    console.warn(
      "[websiteTeamData] Next.js has no Supabase URL/key — using built-in team only. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!sb) {
    return { ...DEFAULT_WEBSITE_TEAM, source: "default" };
  }

  const { data, error } = await sb
    .from("website_team_members")
    .select("id, section, sort_order, name, title, bio, image_key, photo_storage_path, delay_ms");

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[websiteTeamData] Supabase:", error.message);
    }
    return { ...DEFAULT_WEBSITE_TEAM, source: "default" };
  }

  const rows = [...((data ?? []) as DbRow[])].sort((a, b) => {
    const ra = a.section === "founder" ? 0 : 1;
    const rb = b.section === "founder" ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return a.sort_order - b.sort_order;
  });
  if (rows.length === 0) {
    return { ...DEFAULT_WEBSITE_TEAM, source: "default" };
  }

  return mapRowsToPayload(rows, sb);
}
