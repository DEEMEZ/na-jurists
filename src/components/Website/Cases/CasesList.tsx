// CasesList.tsx
import { CasesListProps } from '@/types/LegalCase';
import { formatExcelDate, getCaseNumber, getCaseTitle } from '@/types/utils';
import Link from 'next/link';

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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#2c415e]">
          <tr>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Case Title
            </th>
            <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Case Number
            </th>
            <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="hidden xl:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Court
            </th>
            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases.map((caseItem) => (
            <tr key={caseItem.id} className="hover:bg-gray-50">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-[#2c415e]">
                  {getCaseTitle(caseItem)}
                </div>
                <div className="sm:hidden text-xs text-[#666b6f] mt-1">
                  {getCaseNumber(caseItem)}
                </div>
              </td>
              <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#666b6f]">
                  {getCaseNumber(caseItem)}
                </div>
              </td>
              <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-semibold bg-[#2c415e]/10 text-[#2c415e] rounded-full">
                  {caseItem.category}
                </span>
              </td>
              <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#666b6f]">
                {caseItem.Date ? formatExcelDate(caseItem.Date) : 'N/A'}
              </td>
              <td className="hidden xl:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#666b6f]">
                {caseItem.Court || 'N/A'}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 px-4">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-[#2c415e] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
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
                  className={`px-3 py-1 rounded-md border text-sm ${currentPage === pageNum ? 'bg-[#2c415e] text-white border-[#2c415e]' : 'border-gray-300 text-[#2c415e]'}`}
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
              className="px-3 py-1 rounded-md border border-gray-300 text-[#2c415e] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CasesList;