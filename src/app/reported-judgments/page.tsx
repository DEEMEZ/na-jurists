'use client';

import { useState, useEffect } from 'react';
import {
  getJudgmentsByPage,
  getAllJudgments,
  searchJudgments,
  filterJudgmentsByCourt,
  filterJudgmentsByYear,
  ReportedJudgment
} from '@/components/Website/ReportedJudgments/ReportedJudgements';
import ReportedJudgmentsList from '@/components/Website/ReportedJudgments/ReportedJudgmentsList';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Footer from '@/components/Website/Global/Footer/Footer';
import { Search, Building2, Calendar, RotateCcw } from 'lucide-react';

const ReportedJudgmentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [filteredJudgments, setFilteredJudgments] = useState<ReportedJudgment[]>([]);
  const [paginationData, setPaginationData] = useState({
    judgments: [] as ReportedJudgment[],
    totalPages: 0,
    currentPage: 1,
    totalCount: 0
  });

  useEffect(() => {
    let results = filteredJudgments;

    // Apply search
    if (searchQuery.trim()) {
      results = searchJudgments(searchQuery);
    } else {
      // Start with all judgments if no search
      results = [...filteredJudgments];
    }

    // Apply court filter
    if (courtFilter) {
      results = results.filter(judgment => 
        judgment.court.toLowerCase().includes(courtFilter.toLowerCase())
      );
    }

    // Apply year filter
    if (yearFilter) {
      results = results.filter(judgment => 
        judgment.date.includes(yearFilter) || judgment.citation.includes(yearFilter)
      );
    }

    // Paginate the filtered results
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedResults = results.slice(startIndex, endIndex);

    setPaginationData({
      judgments: paginatedResults,
      totalPages: Math.ceil(results.length / 10),
      currentPage,
      totalCount: results.length
    });

    // Reset to page 1 if current page is beyond available pages
    if (currentPage > Math.ceil(results.length / 10) && Math.ceil(results.length / 10) > 0) {
      setCurrentPage(1);
    }
  }, [searchQuery, courtFilter, yearFilter, currentPage, filteredJudgments]);

  useEffect(() => {
    // Initialize with all judgments - load all at once
    const allJudgments = getAllJudgments();
    setFilteredJudgments(allJudgments);

    // Set initial pagination data
    const paginatedResults = allJudgments.slice(0, 10);
    setPaginationData({
      judgments: paginatedResults,
      totalPages: Math.ceil(allJudgments.length / 10),
      currentPage: 1,
      totalCount: allJudgments.length
    });
  }, []);

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

    // Reset to all judgments
    const allJudgments = getAllJudgments();
    setFilteredJudgments(allJudgments);

    const paginatedResults = allJudgments.slice(0, 10);
    setPaginationData({
      judgments: paginatedResults,
      totalPages: Math.ceil(allJudgments.length / 10),
      currentPage: 1,
      totalCount: allJudgments.length
    });
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
            <ReportedJudgmentsList
              judgments={paginationData.judgments}
              currentPage={paginationData.currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ReportedJudgmentsPage;