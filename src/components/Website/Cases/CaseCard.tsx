// CaseCard.tsx
import { LegalCase } from '@/types/LegalCase';
import { formatExcelDate, getCaseNumber, getCaseTitle } from '@/types/utils';
import Link from 'next/link';

interface CaseCardProps {
  caseItem: LegalCase;
}

const CaseCard = ({ caseItem }: CaseCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group">
      <div className="bg-gradient-to-r from-[#3d4e6a] to-[#2c415e] h-32 sm:h-40 flex items-center justify-center text-white relative overflow-hidden">
        <span className="text-base sm:text-xl font-medium z-10 px-4 text-center">{caseItem.category}</span>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#2c415e]/30 group-hover:opacity-80 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold bg-[#2c415e]/10 text-[#2c415e] rounded-full">
            {caseItem.category}
          </span>
          <span className="text-xs text-[#666b6f]">
            {caseItem.Date ? formatExcelDate(caseItem.Date) : 'N/A'}
          </span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-[#2c415e] mb-2 sm:mb-3 line-clamp-2">
          {getCaseTitle(caseItem)}
        </h3>
        <p className="text-[#666b6f] text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
          {caseItem["File Unit"] || caseItem["Issue / Revenue"] || caseItem.Court || 'Case details available'}
        </p>
        
        <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-100">
          <span className="text-xs sm:text-sm font-medium text-[#2c415e]">
            {getCaseNumber(caseItem)}
          </span>
          <Link 
            href={`/cases/${caseItem.id}`}
            className="text-xs sm:text-sm font-medium text-[#4a6789] hover:text-[#2c415e] transition-colors flex items-center gap-1"
          >
            Read More <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;