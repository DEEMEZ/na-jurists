"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getJudgmentById, ReportedJudgment } from '@/components/Website/ReportedJudgments/ReportedJudgements';
import { ArrowLeft, Printer, Share2, MapPin, Calendar, Scale, Hash, Building2, User, FileText, Tag } from 'lucide-react';

interface ReportedJudgmentDetailsProps {
  id: number;
}

const ReportedJudgmentDetails = ({ id }: ReportedJudgmentDetailsProps) => {
  const router = useRouter();
  const [judgmentData, setJudgmentData] = useState<ReportedJudgment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const judgment = getJudgmentById(id);
    setJudgmentData(judgment || null);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c415e]"></div>
          <p className="mt-4 text-[#2c415e]">Loading judgment details...</p>
        </div>
      </div>
    );
  }

  if (!judgmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 px-4">
          <h3 className="text-2xl font-bold text-[#2c415e] mb-2">Judgment Not Found</h3>
          <p className="text-[#666b6f] mb-6">The requested judgment could not be found.</p>
          <button
            onClick={() => router.push('/reported-judgments')}
            className="px-6 py-3 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2e4e] transition-colors"
          >
            Back to Reported Judgments
          </button>
        </div>
      </div>
    );
  }

  // Format the full text for better readability
  const formatFullText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/---(.*?)---/g, '<em class="text-[#4a6789]">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Case #{judgmentData.id}
                  </span>
                  <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                    {judgmentData.citation}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-3 leading-tight">
                  {judgmentData.title}
                </h1>
                <div className="text-xl opacity-90 mb-4">
                  <strong>{judgmentData.parties.petitioner}</strong>
                  <span className="mx-3 opacity-70">vs</span>
                  <strong>{judgmentData.parties.respondent}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {judgmentData.court}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {judgmentData.date}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Scale className="w-4 h-4" />
                {judgmentData.judges[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#2c415e] mb-6 border-b pb-3">Case Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#4a6789] uppercase tracking-wide mb-1">Case Number</h3>
                    <p className="text-[#2c415e] font-medium">{judgmentData.caseNumber}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#4a6789] uppercase tracking-wide mb-1">Court</h3>
                    <p className="text-[#2c415e] font-medium">{judgmentData.court}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#4a6789] uppercase tracking-wide mb-1">Presiding Judge(s)</h3>
                    <div className="space-y-1">
                      {judgmentData.judges.map((judge, index) => (
                        <p key={index} className="text-[#2c415e] font-medium">{judge}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#4a6789] uppercase tracking-wide mb-1">Subject Area</h3>
                    <p className="text-[#2c415e] font-medium">{judgmentData.subject}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#4a6789] uppercase tracking-wide mb-1">Legal Sections</h3>
                    <div className="space-y-1">
                      {judgmentData.sections.map((section, index) => (
                        <p key={index} className="text-[#2c415e] font-medium">{section}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#4a6789] uppercase tracking-wide mb-1 flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {judgmentData.keywords.map((keyword, index) => (
                        <span key={index} className="bg-[#f0f3f6] text-[#2c415e] px-3 py-1 rounded-full text-sm capitalize flex items-center gap-1">
                          <Tag className="w-2 h-2" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Principle */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#2c415e] mb-4 border-b pb-3">Legal Principle</h2>
              <div className="bg-blue-50 border-l-4 border-[#2c415e] p-6 rounded-r-lg">
                <p className="text-[#2c415e] text-lg font-medium leading-relaxed">
                  {judgmentData.dictumLaw}
                </p>
              </div>
            </div>

            {/* Full Judgment Text */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#2c415e] mb-6 border-b pb-3">Full Judgment Text</h2>
              <div className="max-w-none">
                <div
                  className="text-[#2c415e] leading-relaxed text-justify space-y-4"
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<div class="space-y-4">${formatFullText(judgmentData.fullText)}</div>`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6 print:hidden">
                <h3 className="text-lg font-bold text-[#2c415e] mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.back()}
                    className="w-full px-4 py-3 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to List
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full px-4 py-3 border border-[#2c415e] text-[#2c415e] rounded-lg hover:bg-[#2c415e] hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Judgment
                  </button>

                  <button
                    onClick={() => {
                      const text = `${judgmentData.title}\n\n${judgmentData.citation}\n\n${judgmentData.dictumLaw}\n\nView full details at: ${window.location.href}`;
                      navigator.share ? navigator.share({title: judgmentData.title, text, url: window.location.href}) : navigator.clipboard.writeText(text);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 text-[#666b6f] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share/Copy
                  </button>
                </div>
              </div>

              {/* Case Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#2c415e] mb-4">Case Summary</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[#666b6f] flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      Case ID:
                    </span>
                    <span className="text-[#2c415e] font-medium">#{judgmentData.id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[#666b6f] flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Citation:
                    </span>
                    <span className="text-[#2c415e] font-medium">{judgmentData.citation}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[#666b6f] flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      Court:
                    </span>
                    <span className="text-[#2c415e] font-medium text-right">{judgmentData.court}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-[#666b6f] flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Date:
                    </span>
                    <span className="text-[#2c415e] font-medium">{judgmentData.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666b6f] flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Judge:
                    </span>
                    <span className="text-[#2c415e] font-medium text-right">{judgmentData.judges[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
     );
};

export default ReportedJudgmentDetails;