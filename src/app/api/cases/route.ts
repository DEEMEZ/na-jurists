import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { LegalCase } from '@/types/LegalCase';

let cachedCases: LegalCase[] | null = null;

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

  const cases = await loadCases();

  if (id) {
    const found = cases.find((item) => item.id === id);
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
