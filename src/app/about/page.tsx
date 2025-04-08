import Navbar from '@/components/Website/Global/Navbar/Navbar';
import Footer from '@/components/Website/Global/Footer/Footer';
import OurTeam from '@/components/Website/OurTeam/ourteam';
import Image from 'next/image'; // Import Image component
import groupPhoto from '@/assets/images/team-group-photo.jpeg'; // Adjust the path to your group photo
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - N&A Jurists',
  description: 'Learn more about N&A Jurists, our mission, and our dedicated team of legal professionals.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        {/* Full-Width Team Photo Section with Group Photo */}
        <div className="relative w-full overflow-hidden">
          {/* Subtle dark overlay on sides for framing */}
          <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#2c415e]/80 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#2c415e]/80 to-transparent z-10"></div>
          
          <div className="w-full">
            <Image
              src={groupPhoto}
              alt="N&A Jurists Team"
              width={1920}
              height={600}
              className="w-full object-cover h-[500px]"
              priority
            />
            {/* Very subtle overlay for better text contrast if needed */}
            <div className="absolute inset-0 bg-[#2c415e]/10 z-5"></div>
          </div>
        </div>

        {/* About Us Section */}
        <section className="relative py-16">
          <div
            className="absolute inset-0 z-0 opacity-5"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="container mx-auto px-4 relative z-10 max-w-7xl">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#2c415e] mb-4">About Us</h2>
                <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
                <p className="text-[#666b6f] mt-4 max-w-3xl mx-auto">
                  N&A Jurists is a premier law firm dedicated to providing exceptional legal services with integrity and professionalism. Our team of experienced lawyers specializes in corporate law, taxation, energy, and more, ensuring our clients receive the highest quality representation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <OurTeam />
      </div>
      <Footer />
    </main>
  );
}