"use client";

import CasesFilter from '@/components/Website/Cases/CasesFilter';
import CasesList from '@/components/Website/Cases/CasesList';
import { LegalCase } from '@/types/LegalCase';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function HomeCases() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ searchQuery: string; court: string; subject: string }>({
    searchQuery: '',
    court: '',
    subject: '',
  });
  const abortRef = useRef<AbortController | null>(null);
  const casesPerPage = 10;

  const fetchCases = useCallback(
    async (
      page: number,
      nextFilters: { searchQuery: string; court: string; subject: string }
    ) => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', casesPerPage.toString());
        if (nextFilters.searchQuery) params.set('search', nextFilters.searchQuery);
        if (nextFilters.court) params.set('court', nextFilters.court);
        if (nextFilters.subject) params.set('subject', nextFilters.subject);

        const response = await fetch(`/api/cases?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load cases (HTTP ${response.status})`);
        }

        const payload = await response.json();

        setCases(payload.data || []);
        setTotalCases(payload.pagination?.total || 0);
        setTotalPages(payload.pagination?.totalPages || 1);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to load cases:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setCases([]);
        setTotalCases(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCases(1, filters);
    // We intentionally only run this once for initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCases]);

  const handleFilter = (nextFilters: { searchQuery: string; court: string; subject: string }) => {
    setFilters(nextFilters);
    setCurrentPage(1);
    fetchCases(1, nextFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCases(page, filters);
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow flex items-center justify-center bg-[#f0f3f6]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c415e]"></div>
            <p className="mt-4 text-lg text-[#2c415e]">Loading our case database...</p>
          </div>
        </div>
        {/* <Footer /> */}
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
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
        {/* <Footer /> */}
      </main>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
          {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-[#4a6789]/10 text-[#4a6789] px-4 py-2 rounded-full text-sm font-semibold">
              Legal Cases
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
            Our Recent
            <span className="block text-[#4a6789]">Legal Cases</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
          <p className="text-[#718096] text-lg leading-relaxed max-w-3xl mx-auto">
            Explore our successful case history and legal victories across various practice areas
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Filter Section */}
            <div className="p-6 border-b border-gray-200">
              <CasesFilter
                onFilter={handleFilter}
                totalCases={totalCases}
                filterValues={filters}
              />
            </div>

            {/* Cases List */}
            <div className="p-6">
              <CasesList
                cases={cases}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
            <div className="py-3 flex w-full justify-center items-center">
              <Link href="/cases" className="bg-[#2c415e] px-4 py-2 rounded-lg text-white">View All Cases</Link>
            </div>
          </div>
        </div>
    </section>
  );
}
