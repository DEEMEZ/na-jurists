import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export type ReportedJudgmentRecord = {
  id: number;
  citation: string;
  title: string;
  court: string;
  date: string;
  caseNumber: string;
  dictumLaw: string;
  subject: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  judges: string[];
  sections: string[];
  fullText: string;
  keywords: string[];
  pdfUrl?: string;
};

function getSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL
  );
}

/** Prefer anon key + RLS; else service_role fallback (same idea as `src/app/api/cases/route.ts`). */
let warnedMissingJudgmentsEnv = false;

function createReportedJudgmentsSupabase() {
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

async function loadHiddenJudgmentIds(sb: NonNullable<ReturnType<typeof createReportedJudgmentsSupabase>>): Promise<Set<number>> {
  const { data, error } = await sb.rpc('reported_judgments_hidden_ids');
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[reportedJudgmentsData] hidden ids RPC:', error.message);
    }
    return new Set();
  }
  const ids = new Set<number>();
  for (const row of data ?? []) {
    const id = (row as { id?: number }).id;
    if (typeof id === 'number') ids.add(id);
  }
  return ids;
}

async function loadSupabasePublishedOverrides(
  sb: NonNullable<ReturnType<typeof createReportedJudgmentsSupabase>>
): Promise<Map<number, ReportedJudgmentRecord>> {
  const { data, error } = await sb
    .from('reported_judgments')
    .select('id, record')
    .eq('display_on_website', true)
    .order('id');
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[reportedJudgmentsData] Supabase:', error.message);
    }
    return new Map();
  }

  const byId = new Map<number, ReportedJudgmentRecord>();
  for (const row of data ?? []) {
    const id = row.id as number;
    const rec = row.record as ReportedJudgmentRecord | null;
    if (typeof id !== 'number' || !rec || typeof rec.id !== 'number') continue;
    byId.set(id, rec);
  }
  return byId;
}

async function loadFromFile(): Promise<ReportedJudgmentRecord[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'reported-judgments.json');
  const file = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(file);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Static JSON is the baseline catalog; published rows in `reported_judgments` replace or append by `id`.
 * Rows with `display_on_website = false` omit that Sr. No. entirely (including static JSON fallback).
 */
export async function loadReportedJudgments(): Promise<ReportedJudgmentRecord[]> {
  const sb = createReportedJudgmentsSupabase();
  if (!sb && !warnedMissingJudgmentsEnv) {
    warnedMissingJudgmentsEnv = true;
    console.warn(
      '[reportedJudgmentsData] Next.js has no Supabase URL/key — using static JSON only. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (same project as the portal) so portal edits merge on /api/reported-judgments.',
    );
  }
  const [fileRows, hiddenIds, sbMap] = await Promise.all([
    loadFromFile(),
    sb ? loadHiddenJudgmentIds(sb) : Promise.resolve(new Set<number>()),
    sb ? loadSupabasePublishedOverrides(sb) : Promise.resolve(new Map<number, ReportedJudgmentRecord>()),
  ]);

  const byId = new Map<number, ReportedJudgmentRecord>();
  for (const r of fileRows) {
    if (hiddenIds.has(r.id)) continue;
    byId.set(r.id, r);
  }
  for (const [id, rec] of sbMap) {
    byId.set(id, rec);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}
