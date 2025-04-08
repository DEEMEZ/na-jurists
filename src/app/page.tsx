import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Hero from '@/components/Website/HomePage/Hero';
import PracticeAreas from '@/components/Website/HomePage/PracticeAreas';
import Spacer from '@/components/Website/Global/Spacer/Spacer';
import CaseStudies2 from '@/components/Website/HomePage/CaseStudeis2';
import CaseStudies from '@/components/Website/HomePage/CaseStudies';
import ManagingPartner from '@/components/Website/HomePage/ManagingPartner';
import Footer from '@/components/Website/Global/Footer/Footer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Hero />
        <Spacer height={2} />
        <PracticeAreas />
        <Spacer height={1} />
        <CaseStudies2 />
        <Spacer height={1} />
        <ManagingPartner />
        <Spacer height={1} />
      </div>
      <Footer />
    </main>
  );
}