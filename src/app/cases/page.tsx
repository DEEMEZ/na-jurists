"use client";

import CasesFilter from '@/components/Website/Cases/CasesFilter';
import CasesHero from '@/components/Website/Cases/CasesHero';
import CasesList from '@/components/Website/Cases/CasesList';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import { LegalCase } from '@/types/LegalCase';
import { useEffect, useState } from 'react';

export default function CasesPage() {
  const [casesData, setCasesData] = useState<LegalCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<LegalCase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const casesPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch('/data/cases.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load cases (HTTP ${response.status})`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected array of cases');
        }

        setCasesData(data);
        setFilteredCases(data);
      } catch (err) {
        console.error('Failed to load cases:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilter = (filters: { searchQuery: string; court: string; subject: string }) => {
    let results = [...casesData];
    
    if (filters.court) {
      results = results.filter(caseItem => 
        caseItem.Court?.toLowerCase().includes(filters.court.toLowerCase())
      );
    }
    
    if (filters.subject) {
      results = results.filter(caseItem => 
        caseItem["Subject/Applicable Law"]?.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(caseItem => {
        const searchFields = [
          caseItem["Case Title"] || '',
          caseItem["Case Number"] || '',
          caseItem["Subject/Applicable Law"] || '',
          caseItem.Court || '',
          caseItem.Status || ''
        ].join(' ').toLowerCase();
        
        return searchFields.includes(query);
      });
    }
    
    setFilteredCases(results);
    setCurrentPage(1);
  };

  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-[#f0f3f6]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c415e]"></div>
            <p className="mt-4 text-lg text-[#2c415e]">Loading our case database...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-[#f0f3f6]">
          <div className="text-center max-w-md mx-4">
            <h3 className="text-xl font-medium text-red-600 mb-3">Error Loading Cases</h3>
            <p className="text-[#666b6f] mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-200 text-[#2c415e] rounded-lg hover:bg-gray-300 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <CasesHero />
      
      <div className="flex-grow relative py-12 bg-[#f0f3f6]">
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%232c415e\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Filter Section */}
            <div className="p-6 border-b border-gray-200">
              <CasesFilter 
                onFilter={handleFilter} 
                totalCases={filteredCases.length}
              />
            </div>
            
            {/* Cases List */}
            <div className="p-6">
              <CasesList 
                cases={currentCases} 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}