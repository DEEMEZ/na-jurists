// types.ts
export interface LegalCase {
  id: string;
  category: string;
  "Case No."?: string;
  "CASE NO"?: string;
  "Case Title"?: string;
  "CASE TITLE"?: string;
  "Case Title "?: string;
  "File Unit"?: string;
  "Issue / Revenue"?: string;
  Date?: number;
  Court?: string;
  HC?: string;
  "Party I"?: string;
  "Party II"?: string;
  [key: string]: any;
}

export interface CasesFilterProps {
  categories: string[];
  onFilter: (filters: { category: string; searchQuery: string }) => void;
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