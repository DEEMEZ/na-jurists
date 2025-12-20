"use client";

import { CaseDetailsProps, LegalCase } from '@/types/LegalCase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CaseDetails = ({ id }: CaseDetailsProps) => {
  const router = useRouter();
  const [caseData, setCaseData] = useState<LegalCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/cases?id=${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('Failed to fetch case');
        
        const data = await response.json();
        const foundCase = data.data as LegalCase | undefined;
        
        if (!foundCase) throw new Error('Case not found');
        setCaseData(foundCase);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c415e]"></div>
        <p className="mt-4 text-[#2c415e]">Loading case details...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-xl font-medium text-[#2c415e]">Error Loading Case</h3>
        <p className="text-[#666b6f] mt-2">
          {error || 'The requested case could not be found.'}
        </p>
        <button
          onClick={() => router.push('/cases')}
          className="mt-4 px-4 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2e4e]"
        >
          Back to Cases
        </button>
      </div>
    );
  }

  // Check if case is ongoing (Pending or Judgment Reserved)
  const isOngoing = caseData.Status?.toLowerCase().includes('pending') ||
                    caseData.Status?.toLowerCase().includes('judgment reserved');

  // If case is ongoing, show restricted message
  if (isOngoing) {
    return (
      <section className="relative py-8 sm:py-12 bg-[#f0f3f6] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-6 sm:p-8 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Case Information Restricted
              </h1>
            </div>

            <div className="p-6 sm:p-8 text-center">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-[#2c415e] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2c415e] mb-4">
                {caseData['Case Title']}
              </h2>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 bg-[#2c415e]/10 text-[#2c415e] rounded-full text-xs sm:text-sm">
                  {caseData['Case Number'] || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm font-medium">
                  {caseData.Status}
                </span>
              </div>
              <p className="text-[#666b6f] mb-6 text-sm sm:text-base">
                Details for ongoing cases are not publicly accessible. Only decided and disposed cases can be viewed without restrictions.
              </p>
              <button
                onClick={() => router.push('/cases')}
                className="px-6 py-3 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors w-full sm:w-auto"
              >
                Back to Cases List
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 sm:py-12 bg-[#f0f3f6] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-6 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {caseData['Case Title']}
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                {caseData.Court || 'N/A'}
              </span>
              {caseData['Case Number'] && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                  {caseData['Case Number']}
                </span>
              )}
              {caseData.Status && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                  {caseData.Status}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="prose max-w-none">
              <h2 className="text-xl sm:text-2xl font-bold text-[#2c415e] mb-4">Case Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {caseData['Case Number'] && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Case Number</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{caseData['Case Number']}</p>
                  </div>
                )}
                
                {caseData.Court && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Court</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{caseData.Court}</p>
                  </div>
                )}
                
                {caseData['Subject/Applicable Law'] && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Subject/Applicable Law</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{caseData['Subject/Applicable Law']}</p>
                  </div>
                )}
                
                {caseData.Status && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Status</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{caseData.Status}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => router.back()}
                className="px-6 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors w-full sm:w-auto"
              >
                Back to Cases
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseDetails;
