import { ReportedJudgmentsListProps } from '@/types/LegalCase';
import Link from 'next/link';

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
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Title</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Case Number</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Court</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Subject</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Type</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {judgments.map((judgment) => (
            <tr key={judgment.id} className="hover:bg-gray-50">
              <td className="px-4 sm:px-6 py-4">
                <div className="text-sm font-bold text-[#2c415e] w-full max-w-xs">
                  {judgment.title}
                </div>
                <div className="sm:hidden text-xs text-[#666b6f] mt-1">
                  {judgment.caseNumber}
                </div>
                {judgment.parties && judgment.parties !== 'Not extracted' && (
                  <div className="text-xs text-[#4a6789] mt-1 max-w-xs truncate">
                    {judgment.parties}
                  </div>
                )}
              </td>
              <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#666b6f]">
                  {judgment.caseNumber}
                </div>
              </td>
              <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#666b6f] max-w-32 truncate">
                  {judgment.court}
                </div>
              </td>
              <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-semibold bg-[#2c415e]/10 text-[#2c415e] rounded-full">
                  {judgment.subject}
                </span>
              </td>
              <td className="hidden xl:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#666b6f]">
                {judgment.date}
              </td>
              <td className="hidden 2xl:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666b6f]">
                    {judgment.isPdf ? 'PDF' : 'DOCX'}
                  </span>
                  {judgment.isPdf && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/reported-judgments/${judgment.id}`}
                  className="text-[#4a6789] hover:text-[#2c415e] transition-colors"
                >
                  View Details
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