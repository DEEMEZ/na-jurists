// CasesFilter.tsx
import { CasesFilterProps } from '@/types/LegalCase';
import { useState } from 'react';

const CasesFilter = ({ onFilter, totalCases }: CasesFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [court, setCourt] = useState('');
  const [subject, setSubject] = useState('');

  const courts = [
    'Supreme Court',
    'High Court',
    'Civil Court & Tribunal', 
  ];

  const subjects = [
    'Election',
    'Constitution',
    'Tax',
    'Access to Information',
    'Corporate Crime',
    'Banking',
    'PMDC',
    'Power',
    'Policy Decision of Government',
    'Company',
    'Liquidation',
    'Criminal',
    'Anti Money Laundering',
    'Family',
    'Defamation',
    'Contempt',
    'Insurance',
    'Service',
    'Rent',
    'Civil',
    'Contract'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ searchQuery, court, subject });
  };

  const handleReset = () => {
    setSearchQuery('');
    setCourt('');
    setSubject('');
    onFilter({ searchQuery: '', court: '', subject: '' });
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="w-full">
            <label htmlFor="court" className="block text-sm font-medium text-[#2c415e] mb-1">
              Filter by Court
            </label>
            <select
              id="court"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#2c415e] focus:border-[#2c415e] text-black"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
            >
              <option value="">All Courts</option>
              {courts.map((courtItem) => (
                <option key={courtItem} value={courtItem}>
                  {courtItem}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label htmlFor="subject" className="block text-sm font-medium text-[#2c415e] mb-1">
              Filter by Subject
            </label>
            <select
              id="subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#2c415e] focus:border-[#2c415e] text-black"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subjectItem) => (
                <option key={subjectItem} value={subjectItem}>
                  {subjectItem}
                </option>
              ))}
            </select>
          </div>
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