import { NextRequest, NextResponse } from 'next/server';
import { withPortalFetchCors } from '@/lib/portalFetchCors';
import { filterReportedJudgments } from '@/lib/reportedJudgmentsFilter';
import { slimReportedJudgmentForList } from '@/lib/reportedJudgmentsListPayload';
import { loadReportedJudgments } from '@/lib/reportedJudgmentsData';

/** Supabase-backed rows change from the portal; avoid stale CDN totals vs static JSON. */
export const dynamic = 'force-dynamic';

/** Max rows per request (single fetch for ~100-row catalog + portal extras). */
const MAX_PAGE_LIMIT = 500;

export async function OPTIONS(request: NextRequest) {
  return withPortalFetchCors(request, new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(
    MAX_PAGE_LIMIT,
    Math.max(parseInt(searchParams.get('limit') || '10', 10), 1),
  );
  const search = searchParams.get('search') || '';
  const court = searchParams.get('court') || '';
  const year = searchParams.get('year') || '';
  const id = searchParams.get('id');
  /** Full `record` payload (e.g. portal admin merge). Public pages omit this for smaller JSON. */
  const includeFullText = searchParams.get('includeFullText') === '1';

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

  const filtered = filterReportedJudgments(judgments, { search, court, year });
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginatedRaw = filtered.slice(start, start + limit);
  const paginated = includeFullText ? paginatedRaw : paginatedRaw.map(slimReportedJudgmentForList);
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
