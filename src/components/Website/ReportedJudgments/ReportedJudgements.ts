// TypeScript file with all 69 reported judgments
// Data loaded from JSON file extracted from DOCX and PDF files

export interface ReportedJudgment {
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
}

// Load judgments synchronously from public folder
let reportedJudgmentsData: ReportedJudgment[] = [];

// This will be populated by the page components
export let reportedJudgments: ReportedJudgment[] = reportedJudgmentsData;

// Function to set judgments data (called by components after fetch)
export const setReportedJudgments = (data: ReportedJudgment[]) => {
  reportedJudgments = data;
  reportedJudgmentsData = data;
};

// Helper functions for fetching judgments
export const getJudgmentById = (id: number): ReportedJudgment | undefined => {
  return reportedJudgments.find(judgment => judgment.id === id);
};

export const getAllJudgments = (): ReportedJudgment[] => {
  return reportedJudgments;
};

export const getJudgmentsByPage = (page: number, pageSize: number = 10): {
  judgments: ReportedJudgment[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
} => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedJudgments = reportedJudgments.slice(startIndex, endIndex);

  return {
    judgments: paginatedJudgments,
    totalPages: Math.ceil(reportedJudgments.length / pageSize),
    currentPage: page,
    totalCount: reportedJudgments.length
  };
};

export const searchJudgments = (query: string): ReportedJudgment[] => {
  if (!query.trim()) return reportedJudgments;

  const lowercaseQuery = query.toLowerCase();
  return reportedJudgments.filter(judgment =>
    judgment.title.toLowerCase().includes(lowercaseQuery) ||
    judgment.citation.toLowerCase().includes(lowercaseQuery) ||
    judgment.dictumLaw.toLowerCase().includes(lowercaseQuery) ||
    judgment.subject.toLowerCase().includes(lowercaseQuery) ||
    judgment.parties.petitioner.toLowerCase().includes(lowercaseQuery) ||
    judgment.parties.respondent.toLowerCase().includes(lowercaseQuery) ||
    judgment.keywords.some(keyword => keyword.includes(lowercaseQuery))
  );
};

export const filterJudgmentsByCourt = (court: string): ReportedJudgment[] => {
  if (!court) return reportedJudgments;
  return reportedJudgments.filter(judgment =>
    judgment.court.toLowerCase().includes(court.toLowerCase())
  );
};

export const filterJudgmentsByYear = (year: string): ReportedJudgment[] => {
  if (!year) return reportedJudgments;
  return reportedJudgments.filter(judgment =>
    judgment.date.includes(year) || judgment.citation.includes(year)
  );
};

export const getJudgmentsBySubject = (subject: string): ReportedJudgment[] => {
  return reportedJudgments.filter(judgment =>
    judgment.subject.toLowerCase().includes(subject.toLowerCase())
  );
};

export const getJudgmentsByKeyword = (keyword: string): ReportedJudgment[] => {
  return reportedJudgments.filter(judgment =>
    judgment.keywords.some(k => k.includes(keyword.toLowerCase()))
  );
};
