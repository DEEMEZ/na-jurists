// types.ts
export interface LegalCase {
  id: string;
  sourceFile?: string;
  tableIndex?: number;
  rowIndex?: number;
  "Case Number"?: string | null;
  "Case Title"?: string;
  "Subject/Applicable Law"?: string;
  Court?: string;
  Status?: string | null;
  /** Set when row comes from the law firm portal (display on website). */
  portalPublished?: boolean;
  [key: string]: any;
}

export interface CasesFilterProps {
  onFilter: (filters: { 
    searchQuery: string;
    court: string;
    subject: string;
  }) => void;
  totalCases: number;
  /** Active filters from parent/URL so dropdowns stay in sync after pagination or remount */
  filterValues: {
    searchQuery: string;
    court: string;
    subject: string;
  };
}

export interface CasesListProps {
  cases: LegalCase[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface CaseDetailsProps {
  id: string;
  /** Parent already fetched this case — avoids a second /api/cases request and stale cache. */
  prefetchedCase?: LegalCase | null;
}

// Reported Judgments Types
export interface ReportedJudgment {
  id: string;
  fileName: string;
  title: string;
  caseNumber: string;
  court: string;
  judge: string;
  date: string;
  parties: string;
  subject: string;
  summary: string;
  fullText: string;
  type: string;
  isPdf?: boolean;
}

export interface ReportedJudgmentsFilterProps {
  onFilter: (filters: { 
    searchQuery: string;
    court: string;
    subject: string;
  }) => void;
  totalJudgments: number;
}

export interface ReportedJudgmentsListProps {
  judgments: ReportedJudgment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface ReportedJudgmentDetailsProps {
  id: string;
}