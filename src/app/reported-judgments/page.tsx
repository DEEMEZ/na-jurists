'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { ReportedJudgment } from '@/components/Website/ReportedJudgments/ReportedJudgements';
import ReportedJudgmentsList from '@/components/Website/ReportedJudgments/ReportedJudgmentsList';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Footer from '@/components/Website/Global/Footer/Footer';
import { Search, Building2, Calendar, RotateCcw } from 'lucide-react';

const ReportedJudgmentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [paginationData, setPaginationData] = useState({
    judgments: [] as ReportedJudgment[],
    totalPages: 0,
    currentPage: 1,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, courtFilter, yearFilter]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anon) return;

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const channel = supabase
      .channel('website-reported-judgments-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reported_judgments' },
        () => {
          setRefreshTick((v) => v + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadJudgments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '10');
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (courtFilter) params.set('court', courtFilter);
        if (yearFilter) params.set('year', yearFilter);

        const response = await fetch(`/api/reported-judgments?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error(`Failed to load judgments (HTTP ${response.status})`);
        }

        const payload = await response.json();
        const judgments: ReportedJudgment[] = payload.data || [];
        setPaginationData({
          judgments,
          totalPages: payload.pagination?.totalPages || 1,
          currentPage: payload.pagination?.page || 1,
          totalCount: payload.pagination?.total || judgments.length
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Error loading judgments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load judgments');
        setPaginationData({
          judgments: [],
          totalPages: 0,
          currentPage: 1,
          totalCount: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadJudgments();

    return () => {
      controller.abort();
    };
  }, [currentPage, debouncedSearch, courtFilter, yearFilter, refreshTick]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCourtFilter('');
    setYearFilter('');
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c415e] mb-2">Reported Judgments</h1>
            <p className="text-[#666b6f]">Browse through our collection of reported legal judgments</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <label htmlFor="search" className="block text-sm font-medium text-[#2c415e] mb-1 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Judgments
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by citation, title, parties, or keywords..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6789] focus:border-transparent"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                {/* Court Filter */}
                <div>
                  <label htmlFor="court" className="block text-sm font-medium text-[#2c415e] mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Court
                  </label>
                  <select
                    id="court"
                    value={courtFilter}
                    onChange={(e) => setCourtFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6789] focus:border-transparent"
                  >
                    <option value="">All Courts</option>
                    <option value="Islamabad High Court">Islamabad High Court</option>
                    <option value="Supreme Court">Supreme Court</option>
                    <option value="Lahore High Court">Lahore High Court</option>
                    <option value="Sindh High Court">Sindh High Court</option>
                    <option value="Peshawar High Court">Peshawar High Court</option>
                    <option value="Balochistan High Court">Balochistan High Court</option>
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-[#2c415e] mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Year
                  </label>
                  <select
                    id="year"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6789] focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                    <option value="2017">2017</option>
                    <option value="2016">2016</option>
                    <option value="2015">2015</option>
                    <option value="2014">2014</option>
                    <option value="2012">2012</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c415e] text-white rounded-md hover:bg-[#1e2d3f] transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-[#2c415e] rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </form>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-[#666b6f]">
              Showing {paginationData.judgments.length} of {paginationData.totalCount} judgments
            </p>
          </div>

          {/* Judgments List */}
          <div className="bg-white rounded-lg shadow-sm">
            {error ? (
              <div className="text-center py-12 px-4">
                <h3 className="text-xl font-medium text-red-600 mb-2">Error</h3>
                <p className="text-[#666b6f] mb-4">{error}</p>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-4 py-2 bg-[#2c415e] text-white rounded-md hover:bg-[#1e2d3f] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ReportedJudgmentsList
                judgments={paginationData.judgments}
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
            {isLoading && (
              <div className="p-4 text-sm text-[#666b6f]">Loading judgments...</div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ReportedJudgmentsPage;
