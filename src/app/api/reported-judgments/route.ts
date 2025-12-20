import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type ReportedJudgment = {
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
};

let cachedJudgments: ReportedJudgment[] | null = null;

async function loadJudgments(): Promise<ReportedJudgment[]> {
  if (cachedJudgments) return cachedJudgments;

  const filePath = path.join(process.cwd(), 'public', 'data', 'reported-judgments.json');
  const file = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(file);

  cachedJudgments = Array.isArray(parsed) ? parsed : [];
  return cachedJudgments;
}

function filterJudgments(
  judgments: ReportedJudgment[],
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

  const judgments = await loadJudgments();

  if (id) {
    const numericId = Number(id);
    const found = judgments.find((item) => item.id === numericId);
    if (!found) {
      return NextResponse.json({ error: 'Judgment not found' }, { status: 404 });
    }

    return NextResponse.json(
      { data: found },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  }

  const filtered = filterJudgments(judgments, { search, court, year });
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
