'use client';

import { useState } from 'react';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Footer from '@/components/Website/Global/Footer/Footer';
import { reportedJudgmentsList } from '@/data/reportedJudgmentsList';
import { FileText, ExternalLink } from 'lucide-react';

export default function JudgmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter judgments based on search
  const filteredJudgments = reportedJudgmentsList.filter(judgment =>
    judgment.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judgment.dictumLaw.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judgment.srNo.toString().includes(searchTerm)
  );

  const handleOpenPDF = (pdfFile: string) => {
    // Generate Supabase Storage URL for the PDF
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgzwtdtgskhuuhwhusuf.supabase.co';
    const url = `${supabaseUrl}/storage/v1/object/public/reportedjudgements/${pdfFile}`;

    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Reported Judgments
            </h1>
            <p className="text-lg text-blue-100 mb-6">
              Syed Ishfaq Hussain Shah (38387)
            </p>
            <p className="text-blue-100">
              Complete list of {reportedJudgmentsList.length} reported judgments
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <input
            type="text"
            placeholder="Search by citation, law, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-2xl px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6789] focus:border-transparent"
          />
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {filteredJudgments.length} of {reportedJudgmentsList.length} judgments
            </p>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold w-24">
                    Sr. No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Citation
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Law
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold w-32">
                    Detail/View
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJudgments.map((judgment, index) => (
                  <tr
                    key={judgment.srNo}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#2c415e]">
                      {judgment.srNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {judgment.citation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {judgment.dictumLaw}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenPDF(judgment.pdfFile!)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2c415e] text-white text-sm font-medium rounded-lg hover:bg-[#1a2a3e] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredJudgments.map((judgment) => (
              <div key={judgment.srNo} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2c415e] text-white rounded-full text-sm font-bold">
                      {judgment.srNo}
                    </span>
                    <span className="font-semibold text-gray-900">{judgment.citation}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{judgment.dictumLaw}</p>
                <button
                  onClick={() => handleOpenPDF(judgment.pdfFile!)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2c415e] text-white text-sm font-medium rounded-lg hover:bg-[#1a2a3e] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open PDF
                </button>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredJudgments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Judgments Found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search term
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Total: <span className="font-semibold text-[#2c415e]">{reportedJudgmentsList.length}</span> Reported Judgments
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
