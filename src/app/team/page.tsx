import TeamHero from '@/components/Website/TeamPage/Hero';
import TeamIntro from '@/components/Website/TeamPage/Intro';
import TeamLeadership from '@/components/Website/TeamPage/Leadership';
import OurTeam from '@/components/Website/OurTeam/ourteam';
import TeamValues from '@/components/Website/TeamPage/TeamValues';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Team - N&A Jurists',
  description: 'Meet the dedicated legal professionals at N&A Jurists who bring expertise, integrity and excellence to every case.',
  keywords: ['lawyers', 'legal team', 'attorneys', 'advocates', 'legal experts'],
};

export default function TeamPage() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <TeamHero />
      <TeamIntro />
      <TeamLeadership />
      <OurTeam />
      <TeamValues />
      <Footer />
    </main>
  );
}