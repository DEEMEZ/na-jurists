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