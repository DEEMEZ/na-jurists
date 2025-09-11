"use client";

import { ReportedJudgmentDetailsProps, ReportedJudgment } from '@/types/LegalCase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ReportedJudgmentDetails = ({ id }: ReportedJudgmentDetailsProps) => {
  const router = useRouter();
  const [judgmentData, setJudgmentData] = useState<ReportedJudgment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJudgmentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/reported-judgments.json');
        if (!response.ok) throw new Error('Failed to fetch reported judgments');
        
        const data = await response.json();
        const foundJudgment = data.find((j: ReportedJudgment) => j.id === id);
        
        if (!foundJudgment) throw new Error('Judgment not found');
        setJudgmentData(foundJudgment);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJudgmentDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c415e]"></div>
        <p className="mt-4 text-[#2c415e]">Loading judgment details...</p>
      </div>
    );
  }

  if (error || !judgmentData) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-xl font-medium text-[#2c415e]">Error Loading Judgment</h3>
        <p className="text-[#666b6f] mt-2">
          {error || 'The requested judgment could not be found.'}
        </p>
        <button
          onClick={() => router.push('/reported-judgments')}
          className="mt-4 px-4 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2e4e] transition-colors"
        >
          Back to Reported Judgments
        </button>
      </div>
    );
  }

  return (
    <section className="relative py-8 sm:py-12 bg-[#f0f3f6] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-6 sm:p-8 text-white">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold pr-4">
                {judgmentData.title}
              </h1>
              {judgmentData.isPdf && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex-shrink-0">
                  PDF Document
                </span>
              )}
            </div>
            
            {judgmentData.parties && judgmentData.parties !== 'Not extracted' && (
              <p className="text-lg opacity-90 mb-4">{judgmentData.parties}</p>
            )}
            
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                {judgmentData.court}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                {judgmentData.subject}
              </span>
              {judgmentData.date !== 'Date not available' && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                  {judgmentData.date}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2c415e] mb-4">Case Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Case Number</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{judgmentData.caseNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Court</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{judgmentData.court}</p>
                  </div>
                  
                  {judgmentData.judge !== 'Not specified' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Presiding Judge</h3>
                      <p className="text-[#666b6f] text-sm sm:text-base">{judgmentData.judge}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Subject Area</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{judgmentData.subject}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Date</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{judgmentData.date}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#2c415e]">Document Type</h3>
                    <p className="text-[#666b6f] text-sm sm:text-base">{judgmentData.type}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#2c415e] mb-3">Quick Facts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#666b6f]">File Name:</span>
                    <span className="text-[#2c415e] font-medium truncate ml-2">{judgmentData.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666b6f]">Format:</span>
                    <span className="text-[#2c415e] font-medium">{judgmentData.isPdf ? 'PDF' : 'DOCX'}</span>
                  </div>
                  {judgmentData.parties && judgmentData.parties !== 'Not extracted' && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-[#666b6f] block mb-1">Parties:</span>
                      <span className="text-[#2c415e] font-medium text-xs">{judgmentData.parties}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {judgmentData.summary && judgmentData.summary !== 'Summary not available' && (
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2c415e] mb-4">Summary</h2>
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-[#2c415e]">
                  <p className="text-[#666b6f] text-sm sm:text-base leading-relaxed">{judgmentData.summary}</p>
                </div>
              </div>
            )}
            
            {judgmentData.fullText && judgmentData.fullText !== 'PDF content not extracted' && judgmentData.fullText.trim().length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2c415e] mb-4">Full Text</h2>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm text-[#666b6f] whitespace-pre-wrap font-mono leading-relaxed">
                    {judgmentData.fullText.length > 5000 
                      ? `${judgmentData.fullText.substring(0, 5000)}...\n\n[Text truncated for display. Full content available in original document.]`
                      : judgmentData.fullText
                    }
                  </pre>
                </div>
              </div>
            )}
            
            {judgmentData.isPdf && (
              <div className="mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">PDF Document</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        This judgment is in PDF format. Text extraction may be limited. Please refer to the original document for complete content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.back()}
                className="px-6 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors"
              >
                Back to Reported Judgments
              </button>
              
              <button 
                onClick={() => window.print()}
                className="px-6 py-2 border border-[#2c415e] text-[#2c415e] rounded-lg hover:bg-[#2c415e] hover:text-white transition-colors"
              >
                Print Judgment
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportedJudgmentDetails;