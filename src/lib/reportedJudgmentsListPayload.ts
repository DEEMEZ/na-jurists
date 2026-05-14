import type { ReportedJudgment } from '@/components/Website/ReportedJudgments/ReportedJudgements';
import type { ReportedJudgmentRecord } from '@/lib/reportedJudgmentsData';

/** Strip heavy fields for list/table API responses (keeps search/filter fields). */
export function slimReportedJudgmentForList(j: ReportedJudgmentRecord): ReportedJudgment {
  return {
    id: j.id,
    citation: j.citation ?? '',
    title: j.title ?? '',
    court: j.court ?? '',
    date: j.date ?? '',
    caseNumber: j.caseNumber ?? '',
    dictumLaw: j.dictumLaw ?? '',
    subject: j.subject ?? '',
    parties: j.parties ?? { petitioner: '', respondent: '' },
    judges: [],
    sections: [],
    fullText: '',
    keywords: j.keywords ?? [],
  };
}
