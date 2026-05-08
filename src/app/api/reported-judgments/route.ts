import { NextRequest, NextResponse } from 'next/server';
import { withPortalFetchCors } from '@/lib/portalFetchCors';
import { loadReportedJudgments, type ReportedJudgmentRecord } from '@/lib/reportedJudgmentsData';

/** Supabase-backed rows change from the portal; avoid stale CDN totals vs static JSON. */
export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  return withPortalFetchCors(request, new NextResponse(null, { status: 204 }));
}

function filterJudgments(
  judgments: ReportedJudgmentRecord[],
  {
    search,
    court,
    year,
  }: { search?: string; court?: string; year?: string }
) {
  let filtered = judgments;

  if (court) {
    const lowerCourt = court.toLowerCase();
    filtered = filtered.filter((item) =>
      (item.court || '').toLowerCase().includes(lowerCourt)
    );
  }

  if (year) {
    filtered = filtered.filter(
      (item) =>
        item.date?.includes(year) ||
        item.citation?.includes(year)
    );
  }

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const searchable = [
        item.title || '',
        item.citation || '',
        item.dictumLaw || '',
        item.subject || '',
        item.caseNumber || '',
        item.court || '',
        item.parties?.petitioner || '',
        item.parties?.respondent || '',
        ...(item.keywords || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(lower);
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
  const year = searchParams.get('year') || '';
  const id = searchParams.get('id');

  const judgments = await loadReportedJudgments();

  if (id) {
    const numericId = Number(id);
    const found = judgments.find((item) => item.id === numericId);
    if (!found) {
      return withPortalFetchCors(
        request,
        NextResponse.json({ error: 'Judgment not found' }, { status: 404 }),
      );
    }

    return withPortalFetchCors(
      request,
      NextResponse.json(
        { data: found },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        },
      ),
    );
  }

  const filtered = filterJudgments(judgments, { search, court, year });
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return withPortalFetchCors(
    request,
    NextResponse.json(
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
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    ),
  );
}
