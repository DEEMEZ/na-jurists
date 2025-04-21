import groupPhoto from '@/assets/images/aboutushero.png';
import Footer from '@/components/Website/Global/Footer/Footer';
import Navbar from '@/components/Website/Global/Navbar/Navbar';
import OurTeam from '@/components/Website/OurTeam/ourteam';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us - N&A Jurists',
  description: 'Learn about N&A Jurists - our history, values, and the dedicated team of legal professionals serving clients with excellence.',
  keywords: ['law firm', 'legal services', 'corporate law', 'taxation law', 'legal experts'],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
        <div className="relative w-full overflow-hidden">

        <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#2c415e]/90 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#2c415e]/90 to-transparent z-10"></div>
        
        <div className="w-full">
          <Image
            src={groupPhoto}
            alt="N&A Jurists Team at Work"
            width={1920}
            height={600}
            className="w-full object-cover h-[500px]"
            priority
            quality={90}
          />
          
          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-5">
            <div className="text-center max-w-4xl px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                About N&A Jurists
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Excellence in legal services since 1995
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="relative py-16 bg-[#f0f3f6]">

        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%232c415e\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#2c415e] mb-4">Our Firm</h2>
              <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-[#2c415e] mb-4">Our History</h3>
                <div className="prose text-[#666b6f]">
                  <p>
                    Founded in 1995 by Syed Ishfaq Hussain Naqvi, N&A Jurists has grown from a small practice to one of the most respected law firms in Pakistan. 
                    Our journey reflects our commitment to excellence and our ability to adapt to the evolving legal landscape.
                  </p>
                  <p className="mt-4">
                    Over the past 25+ years, we've successfully represented clients in landmark cases before the Supreme Court, High Courts, and District Courts across Pakistan.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-[#2c415e] mb-4">Our Values</h3>
                <ul className="space-y-4 text-[#666b6f]">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-[#4a6789] mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Integrity: We uphold the highest ethical standards in all our dealings</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-[#4a6789] mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Excellence: We strive for the highest quality in our legal services</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-[#4a6789] mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Client Focus: We tailor solutions to meet each client's unique needs</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-[#2c415e] mb-4">Our Approach</h3>
              <p className="text-[#666b6f]">
                At N&A Jurists, we combine deep legal expertise with practical business understanding to deliver comprehensive solutions. 
                Our team of experienced lawyers specializes in corporate law, taxation, energy, and more, ensuring our clients receive 
                the highest quality representation tailored to their specific needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <OurTeam />

      {/* Practice Areas Preview */}
      <section className="relative py-16 bg-[#2c415e] text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Expertise</h2>
            <div className="h-1 w-24 bg-white/80 mx-auto"></div>
            <p className="text-white/90 mt-4 max-w-3xl mx-auto">
              We provide specialized legal services across multiple practice areas
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Corporate Law',
              'Taxation',
              'Commercial Litigation',
              'Banking & Finance',
              'Mergers & Acquisitions',
              'Intellectual Property',
              'Energy Law',
              'Dispute Resolution'
            ].map((area, index) => (
              <div 
                key={index}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors duration-300"
              >
                <div className="text-lg font-medium">{area}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}