'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Footer from '@/components/Website/Global/Footer/Footer';
import { reportedJudgmentsList } from '@/data/reportedJudgmentsList';
import { FileText, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

type ApiJudgment = {
  id: number;
  citation: string;
  dictumLaw?: string;
  subject?: string;
};

type DisplayRow = {
  id: number;
  citation: string;
  law: string;
};

const JUDGMENTS_PAGE_SIZE = 25;

async function fetchAllReportedJudgmentsFromApi(): Promise<Map<number, ApiJudgment>> {
  const pageSize = 50;
  const map = new Map<number, ApiJudgment>();
  let page = 1;
  let totalPages = 1;
  do {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    const res = await fetch(`/api/reported-judgments?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to load judgments (HTTP ${res.status})`);
    }
    const payload = await res.json();
    const chunk = (payload.data ?? []) as ApiJudgment[];
    for (const row of chunk) {
      if (typeof row.id === 'number') map.set(row.id, row);
    }
    totalPages = Math.max(1, Number(payload.pagination?.totalPages) || 1);
    page += 1;
  } while (page <= totalPages);
  return map;
}

function shortLawForDatabaseOnlyRow(rec: ApiJudgment): string {
  const sub = (rec.subject ?? '').trim();
  if (sub && sub.length <= 180) return sub;
  const d = (rec.dictumLaw ?? '').trim().replace(/\s+/g, ' ');
  if (!d) return '—';
  return d.length > 160 ? `${d.slice(0, 157)}…` : d;
}

export default function JudgmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [listPage, setListPage] = useState(1);
  const [overlay, setOverlay] = useState<Map<number, ApiJudgment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const map = await fetchAllReportedJudgmentsFromApi();
        if (!cancelled) setOverlay(map);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load judgments');
          setOverlay(new Map());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anon) return;

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const channel = supabase
      .channel('website-judgments-live')
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

  const rows: DisplayRow[] = useMemo(() => {
    const listIds = new Set(reportedJudgmentsList.map((j) => j.srNo));
    const merged = overlay ?? new Map<number, ApiJudgment>();

    const fromList: DisplayRow[] = reportedJudgmentsList.map((item) => {
      const o = merged.get(item.srNo);
      return {
        id: item.srNo,
        citation: (o?.citation ?? item.citation).trim() || item.citation,
        law: item.dictumLaw,
      };
    });

    const extras: DisplayRow[] = [];
    for (const id of [...merged.keys()].sort((a, b) => a - b)) {
      if (listIds.has(id)) continue;
      const rec = merged.get(id);
      if (!rec) continue;
      extras.push({
        id,
        citation: rec.citation.trim() || '—',
        law: shortLawForDatabaseOnlyRow(rec),
      });
    }

    return [...fromList, ...extras];
  }, [overlay]);

  const filteredJudgments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (judgment) =>
        judgment.citation.toLowerCase().includes(q) ||
        judgment.law.toLowerCase().includes(q) ||
        judgment.id.toString().includes(q)
    );
  }, [rows, searchTerm]);

  useEffect(() => {
    setListPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredJudgments.length / JUDGMENTS_PAGE_SIZE));
    setListPage((p) => Math.min(p, tp));
  }, [filteredJudgments.length]);

  const totalFiltered = filteredJudgments.length;
  const totalListPages = Math.max(1, Math.ceil(totalFiltered / JUDGMENTS_PAGE_SIZE));
  const currentListPage = Math.min(Math.max(1, listPage), totalListPages);
  const listOffset = (currentListPage - 1) * JUDGMENTS_PAGE_SIZE;
  const pagedJudgments = filteredJudgments.slice(listOffset, listOffset + JUDGMENTS_PAGE_SIZE);

  const handleOpenPDF = (judgmentId: number) => {
    const url = `/api/reported-judgments/pdf?id=${judgmentId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const totalCount = rows.length;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Reported Judgments</h1>
            <p className="text-lg text-blue-100 mb-6">Syed Ishfaq Hussain Shah (38387)</p>
            <p className="text-blue-100">
              {loading
                ? 'Loading Judgments…'
                : loadError
                  ? 'Using catalog list; merged citations may be unavailable until the API loads.'
                  : `Complete list of ${totalCount} reported judgments`}
            </p>
          </div>
        </div>
      </div>

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
              Showing {filteredJudgments.length} of {totalCount} judgments
            </p>
          )}
          {loadError && (
            <p className="mt-2 text-sm text-amber-800" role="status">
              {loadError}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600">Loading…</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold w-24">Sr. No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Citation</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Law</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold w-32">
                        Detail/View
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedJudgments.map((judgment, index) => (
                      <tr
                        key={judgment.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#2c415e]">
                          {judgment.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {judgment.citation}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{judgment.law}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenPDF(judgment.id)}
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

              <div className="md:hidden divide-y divide-gray-200">
                {pagedJudgments.map((judgment) => (
                  <div key={judgment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#2c415e] text-white rounded-full text-sm font-bold">
                          {judgment.id}
                        </span>
                        <span className="font-semibold text-gray-900">{judgment.citation}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{judgment.law}</p>
                    <button
                      type="button"
                      onClick={() => handleOpenPDF(judgment.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2c415e] text-white text-sm font-medium rounded-lg hover:bg-[#1a2a3e] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open PDF
                    </button>
                  </div>
                ))}
              </div>

              {totalFiltered > JUDGMENTS_PAGE_SIZE && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row">
                  <p className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-medium text-[#2c415e]">
                      {totalFiltered === 0 ? 0 : listOffset + 1}–
                      {Math.min(listOffset + JUDGMENTS_PAGE_SIZE, totalFiltered)}
                    </span>{' '}
                    of {totalFiltered}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentListPage <= 1}
                      onClick={() => setListPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#2c415e] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="min-w-[8rem] text-center text-sm text-gray-700">
                      Page {currentListPage} of {totalListPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentListPage >= totalListPages}
                      onClick={() => setListPage((p) => Math.min(totalListPages, p + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#2c415e] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {filteredJudgments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Judgments Found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search term
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e] transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Total:{' '}
            <span className="font-semibold text-[#2c415e]">
              {loading ? '…' : totalCount}
            </span>{' '}
            Reported Judgments
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
