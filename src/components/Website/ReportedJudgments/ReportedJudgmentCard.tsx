import { ReportedJudgment } from '@/types/LegalCase';
import Link from 'next/link';

interface ReportedJudgmentCardProps {
  judgment: ReportedJudgment;
}

const ReportedJudgmentCard = ({ judgment }: ReportedJudgmentCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group">
      <div className="bg-gradient-to-r from-[#3d4e6a] to-[#2c415e] h-32 sm:h-40 flex items-center justify-center text-white relative overflow-hidden">
        <span className="text-base sm:text-xl font-medium z-10 px-4 text-center">{judgment.court}</span>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#2c415e]/30 group-hover:opacity-80 transition-opacity duration-300"></div>
        {judgment.isPdf && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            PDF
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold bg-[#2c415e]/10 text-[#2c415e] rounded-full">
            {judgment.subject}
          </span>
          <span className="text-xs text-[#666b6f]">
            {judgment.date}
          </span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-[#2c415e] mb-2 sm:mb-3 line-clamp-2">
          {judgment.title}
        </h3>
        
        {judgment.parties && judgment.parties !== 'Not extracted' && (
          <p className="text-sm text-[#4a6789] mb-2 font-medium">
            {judgment.parties}
          </p>
        )}
        
        <p className="text-[#666b6f] text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
          {judgment.summary}
        </p>
        
        {judgment.judge && judgment.judge !== 'Not specified' && (
          <p className="text-xs text-[#666b6f] mb-2">
            <span className="font-medium">Judge:</span> {judgment.judge}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-100">
          <span className="text-xs sm:text-sm font-medium text-[#2c415e]">
            {judgment.caseNumber}
          </span>
          <Link 
            href={`/reported-judgments/${judgment.id}`}
            className="text-xs sm:text-sm font-medium text-[#4a6789] hover:text-[#2c415e] transition-colors flex items-center gap-1"
          >
            Read More <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportedJudgmentCard;