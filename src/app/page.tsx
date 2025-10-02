import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Hero from '@/components/Website/HomePage/Hero';
import AboutOverview from '@/components/Website/HomePage/AboutOverview';
import PracticeAreas from '@/components/Website/HomePage/PracticeAreas';
import WhyChooseUs from '@/components/Website/HomePage/WhyChooseUs';
import Statistics from '@/components/Website/HomePage/Statistics';
import ManagingPartner from '@/components/Website/HomePage/ManagingPartner';
import Testimonials from '@/components/Website/HomePage/Testimonials';
import ContactCTA from '@/components/Website/HomePage/ContactCTA';
import HomeCases from '@/components/Website/HomePage/HomeCases';
import Footer from '@/components/Website/Global/Footer/Footer';
import Spacer from '@/components/Website/Global/Spacer/Spacer'; 

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Hero />
        <AboutOverview />
        <PracticeAreas />
        <WhyChooseUs />
        <Statistics />
        <ContactCTA />
        <ManagingPartner />
        <HomeCases />
        <Testimonials />
      </div>
      <Footer />
    </main>
  );
}