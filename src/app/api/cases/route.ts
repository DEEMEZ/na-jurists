import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { LegalCase } from '@/types/LegalCase';
import { createClient } from '@supabase/supabase-js';

let cachedCases: LegalCase[] | null = null;

/** Matters marked “display on website” in the law firm portal (Supabase). */
async function loadPortalWebsiteCases(): Promise<LegalCase[]> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return [];

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb
    .from('cases')
    .select('id,title,reference,status')
    .eq('display_on_website', true)
    .eq('archived', false);
  if (error || !data?.length) return [];

  return data.map((row) => ({
    id: String(row.id),
    'Case Title': String(row.title ?? ''),
    'Case Number': row.reference ? String(row.reference) : '—',
    'Subject/Applicable Law': `Client matter (${String(row.status ?? 'open')})`,
    Court: 'N&A Jurists',
    Status: row.status != null ? String(row.status) : null,
    portalPublished: true,
  }));
}

async function loadPortalCaseById(id: string): Promise<LegalCase | null> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb
    .from('cases')
    .select('id,title,reference,status')
    .eq('id', id)
    .eq('display_on_website', true)
    .eq('archived', false)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: String(data.id),
    'Case Title': String(data.title ?? ''),
    'Case Number': data.reference ? String(data.reference) : '—',
    'Subject/Applicable Law': `Client matter (${String(data.status ?? 'open')})`,
    Court: 'N&A Jurists',
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
  const id = searchParams.get('id');

  const [jsonCases, portalCases] = await Promise.all([
    loadCases(),
    loadPortalWebsiteCases(),
  ]);
  const cases = [...portalCases, ...jsonCases];

  if (id) {
    const found =
      jsonCases.find((item) => item.id === id) ??
      portalCases.find((item) => item.id === id) ??
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
            'public, s-maxage=3600, stale-while-revalidate=7200',
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
          'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    }
  );
}
