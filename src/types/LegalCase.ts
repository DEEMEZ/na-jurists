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
  [key: string]: any;
}

export interface CasesFilterProps {
  onFilter: (filters: { 
    searchQuery: string;
    court: string;
    subject: string;
  }) => void;
  totalCases: number;
}

export interface CasesListProps {
  cases: LegalCase[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface CaseDetailsProps {
  id: string;
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