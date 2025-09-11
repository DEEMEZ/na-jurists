import { ReportedJudgmentsFilterProps } from '@/types/LegalCase';
import { useState } from 'react';

const ReportedJudgmentsFilter = ({ onFilter, totalJudgments }: ReportedJudgmentsFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [court, setCourt] = useState('');
  const [subject, setSubject] = useState('');

  const courts = [
    'Supreme Court of Pakistan',
    'Supreme Court',
    'Lahore High Court',
    'High Court of Punjab',
    'Islamabad High Court',
    'Sindh High Court',
    'Peshawar High Court',
    'Balochistan High Court',
    'Federal Shariat Court',
    'Anti-Terrorism Court',
    'District Court',
    'Sessions Court',
    'Civil Court',
    'Criminal Court'
  ];

  const subjects = [
    'Constitutional Law',
    'Criminal Law',
    'Civil Law',
    'Family Law',
    'Property Law',
    'Service Law',
    'Tax Law',
    'Banking Law',
    'Company Law',
    'Labour Law',
    'Administrative Law',
    'Contract Law',
    'Tort Law',
    'Evidence Law',
    'Appeal',
    'Bail',
    'Revision',
    'Writ',
    'Contempt',
    'Habeas Corpus',
    'General'
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
              Search Judgments
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, case number, or parties..."
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
        Showing {totalJudgments} {totalJudgments === 1 ? 'judgment' : 'judgments'}
      </div>
    </div>
  );
};

export default ReportedJudgmentsFilter;