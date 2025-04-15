"use client";

import CasesFilter from '@/components/Website/Cases/CasesFilter';
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
  const casesPerPage = 9;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/data/cases.json?t=${new Date().getTime()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load data (HTTP ${response.status})`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected array');
        }

        setCasesData(data);
        setFilteredCases(data);
      } catch (err) {
        console.error('Data loading error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load cases data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const categories = [...new Set(casesData.map(caseItem => caseItem.category))];

  const handleFilter = (filters: { category: string; searchQuery: string }) => {
    let results = [...casesData];
    
    if (filters.category) {
      results = results.filter(caseItem => 
        caseItem.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(caseItem => {
        const title = (caseItem["Case Title"] || 
                      caseItem["CASE TITLE"] || 
                      caseItem["Case Title "] || 
                      "").toLowerCase();
        const description = (caseItem["File Unit"] || 
                            caseItem.Court || 
                            caseItem.HC || 
                            "").toLowerCase();
        
        return title.includes(query) || description.includes(query);
      });
    }
    
    setFilteredCases(results);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c415e]"></div>
            <p className="mt-4 text-[#2c415e]">Loading cases...</p>
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
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-medium text-red-500 mb-2">Error Loading Cases</h3>
            <p className="text-[#666b6f]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e]"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow relative py-16 bg-[#f0f3f6]">
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%232c415e\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Our Cases</h1>
              <p className="text-white/90 max-w-2xl">
                Browse through our extensive portfolio of legal cases across various practice areas
              </p>
            </div>
            
            <div className="p-6 border-b border-gray-200">
              <CasesFilter 
                categories={categories} 
                onFilter={handleFilter} 
                totalCases={filteredCases.length}
              />
            </div>
            
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