// utils.ts
import { LegalCase } from './LegalCase';

export const formatExcelDate = (excelDate?: number): string => {
  if (!excelDate) return 'N/A';
  try {
    const utcDays = Math.floor(excelDate - 25569);
    const utcValue = utcDays * 86400;
    const date = new Date(utcValue * 1000);
    return date.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

export const getCaseTitle = (caseItem: LegalCase): string => {
  return caseItem["Case Title"] || 
         caseItem["CASE TITLE"] || 
         caseItem["Case Title "] || 
         "Untitled Case";
};

export const getCaseNumber = (caseItem: LegalCase): string => {
  return caseItem["Case No."] || caseItem["CASE NO"] || 'N/A';
};