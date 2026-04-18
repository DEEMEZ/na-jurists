import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { LegalCase } from '@/types/LegalCase';
import { createClient } from '@supabase/supabase-js';

/** Portal-published cases change when admins toggle visibility; avoid long-lived CDN cache of empty merges. */
export const dynamic = 'force-dynamic';

let cachedCases: LegalCase[] | null = null;
let warnedMissingPortalEnv = false;

function getSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL
  );
}

/** Prefer anon key + RLS (migration `cases_select_public_website`); else service_role fallback. */
function createPortalCasesSupabase() {
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

/** Normalize id from URL / JSON / Supabase (UUIDs are case-insensitive; browsers may vary casing). */
function normalizeCaseIdParam(raw: string): string {
  const s = decodeURIComponent(String(raw ?? '')).trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
  ) {
    return s.toLowerCase();
  }
  return s;
}

/** Matters marked “display on website” in the law firm portal (Supabase). */
async function loadPortalWebsiteCases(): Promise<LegalCase[]> {
  const sb = createPortalCasesSupabase();
  if (!sb) {
    if (process.env.NODE_ENV === 'development' && !warnedMissingPortalEnv) {
      warnedMissingPortalEnv = true;
      console.warn(
        '[api/cases] Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_* in .env.production) and run SQL migration `20260410180000_cases_public_website_anon_read.sql` — or set SUPABASE_SERVICE_ROLE_KEY. Otherwise portal “display on website” cases will not merge.',
      );
    }
    return [];
  }
  const { data, error } = await sb
    .from('cases')
    .select('id,title,reference,status,court,subject')
    .eq('display_on_website', true)
    .eq('archived', false);
  if (error) {
    console.error('[api/cases] loadPortalWebsiteCases:', error.message);
    return [];
  }
  if (!data?.length) return [];

  return data.map((row) => {
    const status = String(row.status ?? 'open');
    const subjectRaw = row.subject != null ? String(row.subject).trim() : '';
    const courtRaw = row.court != null ? String(row.court).trim() : '';
    const idStr = normalizeCaseIdParam(String(row.id));
    return {
      id: idStr,
      'Case Title': String(row.title ?? ''),
      'Case Number': row.reference ? String(row.reference) : '—',
      'Subject/Applicable Law':
        subjectRaw || `Client matter (${status})`,
      Court: courtRaw || '—',
      Status: row.status != null ? String(row.status) : null,
      portalPublished: true,
    };
  });
}

async function loadPortalCaseById(id: string): Promise<LegalCase | null> {
  const sb = createPortalCasesSupabase();
  if (!sb) return null;
  const nid = normalizeCaseIdParam(id);
  const { data, error } = await sb
    .from('cases')
    .select('id,title,reference,status,court,subject')
    .eq('id', nid)
    .eq('display_on_website', true)
    .eq('archived', false)
    .maybeSingle();
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[api/cases] loadPortalCaseById:', error.message, { id: nid });
    }
    return null;
  }
  if (!data) return null;
  const status = String(data.status ?? 'open');
  const subjectRaw = data.subject != null ? String(data.subject).trim() : '';
  const courtRaw = data.court != null ? String(data.court).trim() : '';
  return {
    id: normalizeCaseIdParam(String(data.id)),
    'Case Title': String(data.title ?? ''),
    'Case Number': data.reference ? String(data.reference) : '—',
    'Subject/Applicable Law':
      subjectRaw || `Client matter (${status})`,
    Court: courtRaw || '—',
    Status: data.status != null ? String(data.status) : null,
    portalPublished: true,
  };
}

async function loadCases(): Promise<LegalCase[]> {
  if (cachedCases) return cachedCases;

  const filePath = path.join(process.cwd(), 'public', 'data', 'cases.json');
  const file = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(file);

  cachedCases = Array.isArray(parsed) ? parsed : [];
  return cachedCases;
}

function filterCases(
  cases: LegalCase[],
  {
    search,
    court,
    subject,
  }: { search?: string; court?: string; subject?: string }
) {
  let filtered = cases;

  if (court) {
    const lowerCourt = court.toLowerCase();
    filtered = filtered.filter((item) => {
      const caseCourt = item.Court?.toLowerCase() || '';
      if (lowerCourt === 'civil court & tribunal') {
        return (
          caseCourt.includes('civil court') ||
          caseCourt.includes('tribunal')
        );
      }
      return caseCourt.includes(lowerCourt);
    });
  }

  if (subject) {
    const lowerSubject = subject.toLowerCase();
    filtered = filtered.filter((item) =>
      (item['Subject/Applicable Law'] || '').toLowerCase().includes(lowerSubject)
    );
  }

  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const searchFields = [
        item['Case Title'] || '',
        item['Case Number'] || '',
        item['Subject/Applicable Law'] || '',
        item.Court || '',
        item.Status || '',
      ]
        .join(' ')
        .toLowerCase();
      return searchFields.includes(lowerSearch);
    });
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(
    50,
    Math.max(parseInt(searchParams.get('limit') || '10', 10), 1)
  );
  const search = searchParams.get('search') || '';
  const court = searchParams.get('court') || '';
  const subject = searchParams.get('subject') || '';
  const rawId = searchParams.get('id');
  const id = rawId ? normalizeCaseIdParam(rawId) : null;

  const [jsonCases, portalCases] = await Promise.all([
    loadCases(),
    loadPortalWebsiteCases(),
  ]);
  const jsonCasesNorm = jsonCases.map((c) => ({
    ...c,
    id: normalizeCaseIdParam(String(c.id ?? '')),
  }));
  const cases = [...portalCases, ...jsonCasesNorm];

  if (id) {
    /** Prefer portal rows when resolving detail so Supabase remains source of truth for published matters. */
    const found =
      portalCases.find((item) => normalizeCaseIdParam(String(item.id)) === id) ??
      jsonCasesNorm.find((item) => item.id === id) ??
      (await loadPortalCaseById(id));
    if (!found) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const related = cases
      .filter(
        (item) =>
          item.id !== found.id &&
          (item.Court && found.Court
            ? item.Court.toLowerCase() === found.Court.toLowerCase()
            : false)
      )
      .slice(0, 3);

    return NextResponse.json(
      { data: found, related },
      {
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0, must-revalidate',
        },
      }
    );
  }

  const filtered = filterCases(cases, { search, court, subject });
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json(
    {
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    },
    {
      headers: {
        'Cache-Control':
          'private, no-store, max-age=0, must-revalidate',
      },
    }
  );
}
