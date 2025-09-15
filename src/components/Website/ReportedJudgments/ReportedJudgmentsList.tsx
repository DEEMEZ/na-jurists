import { ReportedJudgment } from '@/components/Website/ReportedJudgments/ReportedJudgements';
import Link from 'next/link';

interface ReportedJudgmentsListProps {
  judgments: ReportedJudgment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ReportedJudgmentsList = ({ judgments, currentPage, totalPages, onPageChange }: ReportedJudgmentsListProps) => {
  if (judgments.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-xl font-medium text-[#2c415e]">No judgments found</h3>
        <p className="text-[#666b6f] mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#2c415e] text-white">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Sr. No</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Citation</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Dictum/Law</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {judgments.map((judgment, index) => (
            <tr key={judgment.id} className="hover:bg-gray-50">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-[#2c415e]">
                  {(currentPage - 1) * 10 + index + 1}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="text-sm font-bold text-[#2c415e] max-w-xs">
                  {judgment.citation || judgment.caseNumber || judgment.title}
                </div>
                {/* Mobile view: Show dictum/law under citation */}
                <div className="sm:hidden text-xs text-[#4a6789] mt-1 max-w-xs">
                  {judgment.dictumLaw || judgment.subject}
                </div>
              </td>
              <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                <div className="text-sm text-[#666b6f] max-w-sm">
                  {judgment.dictumLaw || judgment.subject}
                </div>
                {judgment.court && (
                  <div className="text-xs text-[#4a6789] mt-1">
                    {judgment.court}
                  </div>
                )}
                {judgment.date && (
                  <div className="text-xs text-[#666b6f] mt-1">
                    {judgment.date}
                  </div>
                )}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/reported-judgments/${judgment.id}`}
                  className="text-[#4a6789] hover:text-[#2c415e] transition-colors text-sm"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 px-4 pb-2">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-[#2c415e] disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              ← Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                    currentPage === pageNum 
                      ? 'bg-[#2c415e] text-white border-[#2c415e]' 
                      : 'border-gray-300 text-[#2c415e] hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-3 py-1 text-sm text-[#666b6f]">...</span>
            )}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-[#2c415e] disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              Next →
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReportedJudgmentsList;