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
    <section className="relative">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl py-16">
        <div 
          ref={practiceAreaRef}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2c415e] mb-4">We Assist Our Clients in</h2>
            <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
            <p className="text-[#666b6f] mt-4 max-w-3xl mx-auto">
              Specialized legal expertise tailored to address your specific needs with the highest level of professionalism.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceAreas.map((area, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 border border-[#e5eaf4] shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[#a7c1d9] hover:-translate-y-1 group"
                style={{ transitionDelay: `${area.delay}ms` }}
              >
                <Icon name={area.icon} />
                <h3 className="text-lg font-semibold text-[#2c415e] mb-2 text-center group-hover:text-[#1a2a3e]">{area.title}</h3>
                <p className="text-[#666b6f] text-sm text-center">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeAreas;