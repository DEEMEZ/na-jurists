import type { LegalCase } from '@/types/LegalCase';

const CIVIL_LIST_SOURCE_PREFIX = 'Civil Courts cases list';

/** Courts from the civil Word/JSON import that are not named "Civil Court" but belong in the lower-courts bucket. */
const LOWER_COURT_COURT_MARKERS = [
  'civil court',
  'tribunal',
  'banking court',
  'custom court',
  'fst',
  'nirc',
  'fospah',
  'president of pakistan',
  'accountability court',
  'federal shariat court',
  'adcg',
  'atir',
  'district court',
  'family court',
  'rent tribunal',
  'labour court',
  'consumer court',
  'fia court',
] as const;

export function isLowerCourtsFilterValue(courtFilter: string): boolean {
  const lower = courtFilter.trim().toLowerCase();
  return (
    lower === 'lower courts & tribunals' || lower === 'civil court & tribunal'
  );
}

export function isCivilCourtsListSource(sourceFile: string | undefined): boolean {
  return String(sourceFile ?? '').startsWith(CIVIL_LIST_SOURCE_PREFIX);
}

export function matchesLowerCourtsAndTribunalsCase(item: Pick<LegalCase, 'Court' | 'sourceFile'>): boolean {
  if (isCivilCourtsListSource(item.sourceFile)) return true;

  const caseCourt = (item.Court ?? '').toLowerCase();
  if (!caseCourt) return false;

  return LOWER_COURT_COURT_MARKERS.some((marker) => caseCourt.includes(marker));
}
