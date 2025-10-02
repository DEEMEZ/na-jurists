"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Custom icon component for better consistency
const Icon = ({ name }: { name: string }) => {
  const icons = {
    corporate: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
        <line x1="9" y1="9" x2="10" y2="9"></line>
        <line x1="9" y1="13" x2="15" y2="13"></line>
        <line x1="9" y1="17" x2="15" y2="17"></line>
      </svg>
    ),
    taxation: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    commercial: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    banking: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    merger: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="7" height="14" rx="1" ry="1"></rect>
        <rect x="15" y="7" width="7" height="14" rx="1" ry="1"></rect>
        <path d="M9 7h6"></path>
        <path d="M9 14h6"></path>
      </svg>
    ),
    ip: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 14.5L5 19l-1-1 4.5-4.5M19 8l-7 7-4-4 7-7 4 4zM16 5l3 3"></path>
        <path d="M15 6.5L17.5 9"></path>
      </svg>
    ),
    it: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    ),
    insurance: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    constitutional: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
        <path d="M5 7v12h14V7"></path>
      </svg>
    ),
    contracts: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
        <path d="M10 9H8"></path>
      </svg>
    ),
    adr: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h4v12a2 2 0 0 1-2 2h-6v-8h4"></path>
        <path d="M2 6h20v16H2z"></path>
        <path d="M2 13h9"></path>
        <path d="M9 13v6"></path>
      </svg>
    ),
    employment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-4V3H8v4H4v2h2v11h12V9h2V7zm-6 0h-4V5h4v2z"></path>
      </svg>
    ),
  };
  
  return (
    <div className="flex justify-center text-[#2c415e] mb-4">
      {icons[name as keyof typeof icons] || (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      )}
    </div>
  );
};

const PracticeAreas = () => {
  const practiceAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (practiceAreaRef.current) {
        const rect = practiceAreaRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
          practiceAreaRef.current.classList.add('opacity-100');
          practiceAreaRef.current.classList.remove('opacity-0', 'translate-y-10');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Updated practice areas data with icons and more detailed descriptions
  const practiceAreas = [
    {
      icon: 'corporate',
      title: 'Corporate Formation',
      description: 'We help you in establishing every type of business i.e. partnership, company & Joint Venture (JV).',
      delay: 100
    },
    {
      icon: 'taxation',
      title: 'Taxation',
      description: 'From tax advisory to tax planning & litigation, NA Jurists help your organization to save money.',
      delay: 150
    },
    {
      icon: 'commercial',
      title: 'Corporate & Commercial',
      description: 'We help your organization with robust practical advice on various corporate and commercial matters.',
      delay: 200
    },
    {
      icon: 'banking',
      title: 'Banking & Finance',
      description: 'Firm\'s substantial experience in banking & finance helps various banks in saving their cost & resources.',
      delay: 250
    },
    {
      icon: 'merger',
      title: 'Mergers and Acquisition',
      description: 'Our firm helps your organization / business on all legal and regulatory aspects of Merger and Acquisition.',
      delay: 300
    },
    {
      icon: 'ip',
      title: 'Intellectual Property (IP)',
      description: 'NA Jurists creates strategic advantages by helping your business in registration & protection IP of your business.',
      delay: 350
    },
    {
      icon: 'it',
      title: 'Information Technology (IT)',
      description: 'We help our clients in changing/updating software licensing, data privacy & security and e-signature issues.',
      delay: 400
    },
    {
      icon: 'insurance',
      title: 'Insurance',
      description: 'Our firm assists insurance companies in ensuring regulatory compliance, distributing products & resolving disputes.',
      delay: 450
    },
    {
      icon: 'constitutional',
      title: 'Constitutional Law',
      description: 'We protect all the rights of our clients as provided and guaranteed by the Constitution of Pakistan.',
      delay: 500
    },
    {
      icon: 'contracts',
      title: 'Contracts, Deeds & Instruments Drafting',
      description: 'Our experienced team manages the complete life cycle of your business contracts.',
      delay: 550
    },
    {
      icon: 'adr',
      title: 'Alternative Dispute Resolution (ADR)',
      description: "NA Jurists represents your organization before various ADRs to protect your organization's rights.",
      delay: 600
    },
    {
      icon: 'employment',
      title: 'Employment and Labor Laws',
      description: 'Firm advises organizations to develop & draft employment policies by complying relevant laws to save cost & lengthy litigation.',
      delay: 650
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-[#f7fafc] to-[#edf2f7]">
      {/* Enhanced background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-3"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M25 25h50v50H25V25zM0 0h20v20H0V0zM80 0h20v20H80V0zM0 80h20v20H0V80zM80 80h20v20H80V80z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '120px 120px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div
          ref={practiceAreaRef}
          className="transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-[#1a2b3d]/10 text-[#1a2b3d] px-4 py-2 rounded-full text-sm font-semibold">
                Our Expertise
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
              Legal Services We
              <span className="block text-[#4a6789]">Provide</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#d4af37] mx-auto mb-6"></div>
            <p className="text-[#718096] text-lg leading-relaxed max-w-3xl mx-auto">
              Comprehensive legal solutions delivered by experienced advocates committed to your success.
              Our specialized expertise spans across multiple practice areas.
            </p>
          </div>

          {/* Enhanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {practiceAreas.map((area, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-[#4a6789]/30 hover:-translate-y-2 group relative overflow-hidden"
                style={{ transitionDelay: `${area.delay}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b3d]/5 to-[#4a6789]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <Icon name={area.icon} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2b3d] mb-3 text-center group-hover:text-[#4a6789] transition-colors duration-300">
                    {area.title}
                  </h3>
                  <p className="text-[#718096] text-sm leading-relaxed text-center">
                    {area.description}
                  </p>

                  {/* Arrow icon that appears on hover */}
                  <div className="flex justify-center mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <svg className="w-5 h-5 text-[#4a6789]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action Section */}
          <div className="text-center mt-16 bg-white rounded-2xl p-8 shadow-lg border border-[#e2e8f0]">
            <h3 className="text-2xl font-bold text-[#1a2b3d] mb-4">
              Need Legal Assistance?
            </h3>
            <p className="text-[#718096] mb-6 max-w-2xl mx-auto">
              Our experienced legal team is ready to provide you with expert guidance and representation.
              Contact us today for a consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-[#1a2b3d] text-white px-8 py-3 rounded-lg hover:bg-[#2c415e] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View All Services
              </Link>
              <Link
                href="/contact"
                className="border-2 border-[#4a6789] text-[#4a6789] px-8 py-3 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold"
              >
                Get Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeAreas;