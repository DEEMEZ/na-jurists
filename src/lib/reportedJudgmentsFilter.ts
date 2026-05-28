import type { ReportedJudgmentRecord } from '@/lib/reportedJudgmentsData';

/** Minimal row shape for client/server search filters. */
export type FilterableJudgment = Pick<
  ReportedJudgmentRecord,
  | 'id'
  | 'citation'
  | 'title'
  | 'court'
  | 'date'
  | 'caseNumber'
  | 'dictumLaw'
  | 'subject'
  | 'parties'
  | 'keywords'
>;

/** Shared list/search filter for reported judgments (website + API). */
export function filterReportedJudgments<T extends FilterableJudgment>(
  judgments: T[],
  {
    search,
    court,
    year,
  }: { search?: string; court?: string; year?: string },
): T[] {
  let filtered = judgments;

  if (court) {
    const lowerCourt = court.toLowerCase();
    filtered = filtered.filter((item) => (item.court || '').toLowerCase().includes(lowerCourt));
  }

  if (year) {
    filtered = filtered.filter(
      (item) =>
        (item.date || '').includes(year) ||
        (item.citation || '').includes(year),
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