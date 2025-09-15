"use client";

import ReportedJudgmentDetails from '@/components/Website/ReportedJudgments/ReportedJudgmentDetails';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import { useParams } from 'next/navigation';

export default function ReportedJudgmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const numericId = id ? parseInt(id, 10) : null;

  if (!id || !numericId || isNaN(numericId)) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-[#f0f3f6]">
          <div className="text-center">
            <h2 className="text-xl font-medium text-[#2c415e]">Invalid Judgment ID</h2>
            <p className="text-[#666b6f] mt-2">Please check the URL and try again.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <ReportedJudgmentDetails id={numericId} />
      </div>
      <Footer />
    </main>
  );
}