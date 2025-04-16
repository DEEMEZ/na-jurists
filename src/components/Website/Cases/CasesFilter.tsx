// CasesFilter.tsx
import { CasesFilterProps } from '@/types/LegalCase';
import { useState } from 'react';

const CasesFilter = ({ categories, onFilter, totalCases }: CasesFilterProps) => {
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ category, searchQuery });
  };

  const handleReset = () => {
    setCategory('');
    setSearchQuery('');
    onFilter({ category: '', searchQuery: '' });
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full">
          <label htmlFor="search" className="block text-sm font-medium text-[#2c415e] mb-1">
            Search Cases
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by title or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#2c415e] focus:border-[#2c415e] text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:min-w-[180px]"> {/* Changed from sm:w-48 to min-w-[180px] */}
          <label htmlFor="category" className="block text-sm font-medium text-[#2c415e] mb-1">
            Filter by Category
          </label>
          <select
            id="category"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#2c415e] focus:border-[#2c415e] text-black"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-black">
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="px-4 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors w-full sm:w-auto"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-[#2c415e] rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            Reset
          </button>
        </div>
      </form>
      
      <div className="mt-3 text-sm text-[#666b6f]">
        Showing {totalCases} {totalCases === 1 ? 'case' : 'cases'}
      </div>
    </div>
  );
};

export default CasesFilter;