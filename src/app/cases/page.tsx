"use client";

import { Suspense } from 'react';
import CasesFilter from '@/components/Website/Cases/CasesFilter';
import CasesHero from '@/components/Website/Cases/CasesHero';
import CasesList from '@/components/Website/Cases/CasesList';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import { LegalCase } from '@/types/LegalCase';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

// Loading fallback component for the filter
function FilterFallback() {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Component to handle search params with Suspense
function CasesContentWithParams() {
  const searchParams = useSearchParams(); // Use useSearchParams inside Suspense
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const casesPerPage = 10;
  const [filters, setFilters] = useState<{ searchQuery: string; court: string; subject: string }>({
    searchQuery: '',
    court: '',
    subject: '',
  });
  const [totalPages, setTotalPages] = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  const buildQueryString = useCallback(
    (page: number, nextFilters: { searchQuery: string; court: string; subject: string }) => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', casesPerPage.toString());
      if (nextFilters.searchQuery) params.set('search', nextFilters.searchQuery);
      if (nextFilters.court) params.set('court', nextFilters.court);
      if (nextFilters.subject) params.set('subject', nextFilters.subject);
      return params.toString();
    },
    []
  );

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

        const query = buildQueryString(page, nextFilters);
        const response = await fetch(`/api/cases?${query}`, {
          signal: controller.signal,
          cache: 'no-store',
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
    [buildQueryString]
  );

  useEffect(() => {
    const initialFilters = {
      searchQuery: searchParams?.get('search') || '',
      court: searchParams?.get('court') || '',
      subject: searchParams?.get('subject') || '',
    };
    setFilters(initialFilters);
    setCurrentPage(1);
    fetchCases(1, initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFilter = (newFilters: { searchQuery: string; court: string; subject: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (newFilters.searchQuery) params.set('search', newFilters.searchQuery);
    if (newFilters.court) params.set('court', newFilters.court);
    if (newFilters.subject) params.set('subject', newFilters.subject);
    const queryString = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`);

    fetchCases(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCases(page, filters);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#f0f3f6]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c415e]"></div>
          <p className="mt-4 text-lg text-[#2c415e]">Loading our case database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <>
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
            {/* Filter Section with Suspense */}
            <div className="p-6 border-b border-gray-200">
              <Suspense fallback={<FilterFallback />}>
                <CasesFilter
                  onFilter={handleFilter}
                  totalCases={totalCases}
                  filterValues={filters}
                />
              </Suspense>
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
          </div>
        </div>
      </div>
    </>
  );
}

export default function CasesPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-grow flex items-center justify-center bg-[#f0f3f6]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c415e]"></div>
              <p className="mt-4 text-lg text-[#2c415e]">Loading page...</p>
            </div>
          </div>
        }
      >
        <CasesContentWithParams />
      </Suspense>
      <Footer />
    </main>
  );
}
