import ContactCards from '@/components/Website/ContactPage/ContactCards';
import ContactForm from '@/components/Website/ContactPage/ContactForm';
import MapLocation from '@/components/Website/ContactPage/MapLocation';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - N&A Jurists',
  description: 'Get in touch with our legal experts for consultation and inquiries.',
  keywords: ['legal consultation', 'contact lawyer', 'law firm contact', 'legal advice']
};

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section without image */}
      <section className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <div className="h-1 w-24 bg-white mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Contact our legal team for expert advice and consultation
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-grow bg-[#f0f3f6] py-16">
        <div className="container mx-auto px-4">
          {/* Contact Cards */}
          <ContactCards />
          
          {/* Form and Map Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-[#2c415e] mb-6">Send Us a Message</h2>
              <p className="text-[#666b6f] mb-8 max-w-lg">
                Have questions about our services or need legal advice? Fill out the form below and 
                we'll get back to you within 24 hours.
              </p>
              <ContactForm />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-[#2c415e] mb-6">Our Office</h2>
              <p className="text-[#666b6f] mb-8 max-w-lg">
                Visit us at our conveniently located office in Islamabad. We're available for 
                in-person consultations by appointment.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <MapLocation />
                <div className="mt-4">
                  <h3 className="font-semibold text-[#2c415e]">Office Hours</h3>
                  <p className="text-[#666b6f] mt-2">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}