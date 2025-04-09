import ContactCards from '@/components/Website/ContactPage/ContactCards';
import ContactForm from '@/components/Website/ContactPage/ContactForm';
import MapLocation from '@/components/Website/ContactPage/MapLocation';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Spacer from '@/components/Website/Global/Spacer/Spacer';

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-[#f0f3f6]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#2c415e] mb-4">Contact Us</h1>
            <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
            <p className="text-[#666b6f] mt-4 max-w-2xl mx-auto">
              Have questions or need legal assistance? Reach out to our team.
            </p>
          </div>
          <ContactCards />
          <Spacer height={2} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactForm />
            <MapLocation />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}