import dynamic from 'next/dynamic';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Hero from '@/components/Website/HomePage/Hero';
import Footer from '@/components/Website/Global/Footer/Footer';

import { NewsAlertsWidgetLoader } from '@/components/Website/HomePage/NewsAlertsWidgetLoader';

const AboutOverview = dynamic(() => import('@/components/Website/HomePage/AboutOverview'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
});
const PracticeAreas = dynamic(() => import('@/components/Website/HomePage/PracticeAreas'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
});
const WhyChooseUs = dynamic(() => import('@/components/Website/HomePage/WhyChooseUs'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
});
const ContactCTA = dynamic(() => import('@/components/Website/HomePage/ContactCTA'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse" />,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Hero />
        <AboutOverview />
        <PracticeAreas />

        <WhyChooseUs />
        <ContactCTA />
        {/* <ManagingPartner /> */}
      </div>
      <Footer />
      <NewsAlertsWidgetLoader />
    </main>
  );
}
