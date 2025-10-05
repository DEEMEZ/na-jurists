import { CasesListProps } from '@/types/LegalCase';
import Link from 'next/link';

const truncateTitle = (title: string, wordLimit: number = 10): string => {
  const words = title?.split(' ') || [];
  if (words.length <= wordLimit) return title || '';
  return words.slice(0, wordLimit).join(' ') + '...';
};

const CasesList = ({ cases, currentPage, totalPages, onPageChange }: CasesListProps) => {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-xl font-medium text-[#2c415e]">No cases found</h3>
        <p className="text-[#666b6f] mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="pb-4 overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-[#2c415e] text-white">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-wider">Case Title</th>
            <th className="hidden md:table-cell px-2 py-3 text-left text-xs font-bold uppercase tracking-wider">Case Number</th>
            <th className="hidden lg:table-cell px-2 py-3 text-left text-xs font-bold uppercase tracking-wider">Subject</th>
            <th className="hidden lg:table-cell px-2 py-3 text-left text-xs font-bold uppercase tracking-wider">Court</th>
            <th className="hidden md:table-cell px-2 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
            <th className="px-2 py-3 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases.map((caseItem) => (
            <tr key={caseItem.id} className="hover:bg-gray-50">
              <td className="px-2 py-3">
                <div className="text-sm font-bold text-[#2c415e]" title={caseItem['Case Title']}>
                  {truncateTitle(caseItem['Case Title'] || '', 10)}
                </div>
                {/* Mobile view: Show case number and status under title */}
                <div className="md:hidden text-xs text-[#666b6f] mt-1">
                  {caseItem['Case Number'] || 'N/A'}
                </div>
                <div className="md:hidden text-xs text-[#4a6789] mt-1">
                  {caseItem.Status || 'N/A'}
                </div>
              </td>
              <td className="hidden md:table-cell px-2 py-3">
                <div className="text-sm text-[#666b6f]">
                  {caseItem['Case Number'] || 'N/A'}
                </div>
              </td>
              <td className="hidden lg:table-cell px-2 py-3">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-[#2c415e]/10 text-[#2c415e] rounded-full">
                  {caseItem['Subject/Applicable Law'] || 'N/A'}
                </span>
              </td>
              <td className="hidden lg:table-cell px-2 py-3 text-sm text-[#666b6f]">
                {caseItem.Court || 'N/A'}
              </td>
              <td className="hidden md:table-cell px-2 py-3 text-sm text-[#666b6f]">
                {caseItem.Status || 'N/A'}
              </td>
              <td className="px-2 py-3 text-sm font-medium">
                <Link
                  href={`/cases/${caseItem.id}`}
                  className="text-[#4a6789] hover:text-[#2c415e]"
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
              className="px-3 py-1 rounded-md border border-gray-300 text-[#2c415e] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              aria-label="Previous page"
            >
            </button>
            
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage <= 2) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-md border text-sm ${currentPage === pageNum ? 'bg-[#2c415e] text-white border-[#2c415e]' : 'border-gray-300 text-[#2c415e]'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 3 && currentPage < totalPages - 1 && (
              <span className="px-3 py-1 text-sm text-[#666b6f]">...</span>
            )}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-[#2c415e] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              aria-label="Next page"
            >
              
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CasesList;