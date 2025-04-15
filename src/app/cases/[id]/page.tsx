"use client";

import CaseDetails from '@/components/Website/Cases/CaseDetails';
import CasesList from '@/components/Website/Cases/CasesList';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import { LegalCase } from '@/types/LegalCase';
import { useEffect, useState } from 'react';


// Add this to tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';

// Type matches Next.js expectations
export interface PageProps {
  params: { id: string }; // Remove '?' since id will always exist in [id] route
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function CaseDetailPage({ params }: PageProps) {
  const decodedId = decodeURIComponent(params.id);

  const [casesData, setCasesData] = useState<LegalCase[]>([]);
  const [currentCase, setCurrentCase] = useState<LegalCase | null>(null);
  const [relatedCases, setRelatedCases] = useState<LegalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        const foundCase = data.find((c: LegalCase) => c.id === decodedId);
        if (!foundCase) {
          throw new Error('Case not found');
        }
        setCurrentCase(foundCase);
        
        const related = data.filter((c: LegalCase) => 
          c.category === foundCase.category && c.id !== foundCase.id
        ).slice(0, 3);
        setRelatedCases(related);
      } catch (err) {
        console.error('Data loading error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load case data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [decodedId]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c415e]"></div>
            <p className="mt-4 text-[#2c415e]">Loading case details...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !currentCase) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-medium text-red-500 mb-2">Error Loading Case</h3>
            <p className="text-[#666b6f]">{error || 'The requested case could not be found.'}</p>
            <button
              onClick={() => window.location.href = '/cases'}
              className="mt-4 px-4 py-2 bg-[#2c415e] text-white rounded-lg hover:bg-[#1a2a3e]"
            >
              Back to Cases
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <CaseDetails id={decodedId} />
          </div>
          
          {relatedCases.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Related Cases</h2>
                <p className="text-white/90">
                  Explore other cases in the same category
                </p>
              </div>
              
              <div className="p-6">
                <CasesList 
                  cases={relatedCases} 
                  currentPage={1}
                  totalPages={1}
                  onPageChange={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}