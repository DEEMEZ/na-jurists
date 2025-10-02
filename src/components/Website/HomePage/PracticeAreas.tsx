"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calculator,
  Briefcase,
  Landmark,
  GitMerge,
  Copyright,
  Monitor,
  Shield,
  Scale,
  FileText,
  MessageSquare,
  Users
} from 'lucide-react';

// Professional Lucide icon component
const Icon = ({ name }: { name: string }) => {
  const icons = {
    corporate: <Building2 size={36} />,
    taxation: <Calculator size={36} />,
    commercial: <Briefcase size={36} />,
    banking: <Landmark size={36} />,
    merger: <GitMerge size={36} />,
    ip: <Copyright size={36} />,
    it: <Monitor size={36} />,
    insurance: <Shield size={36} />,
    constitutional: <Scale size={36} />,
    contracts: <FileText size={36} />,
    adr: <MessageSquare size={36} />,
    employment: <Users size={36} />,
  };

  return (
    <div className="flex justify-center text-[#4a6789] mb-4">
      {icons[name as keyof typeof icons] || <Building2 size={36} />}
    </div>
  );
};

const PracticeAreas = () => {
  const practiceAreaRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const handleScroll = () => {
      if (practiceAreaRef.current) {
        const rect = practiceAreaRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionHeight = practiceAreaRef.current.offsetHeight;

        // Check if section is in view and calculate progress
        if (rect.top <= 0 && rect.bottom >= 0) {
          const scrolledDistance = Math.abs(rect.top);
          const totalScrollDistance = sectionHeight - windowHeight;
          const progress = Math.min(Math.max(scrolledDistance / totalScrollDistance, 0), 1);
          setScrollProgress(progress);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
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
    <section
      ref={practiceAreaRef}
      className="relative h-[300vh] bg-gradient-to-br from-[#f7fafc] to-[#edf2f7]"
    >
      {/* Enhanced background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-3"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M25 25h50v50H25V25zM0 0h20v20H0V0zM80 0h20v20H80V0zM0 80h20v20H0V80zM80 80h20v20H80V80z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Sticky Container for Marquee */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <style dangerouslySetInnerHTML={{
          __html: `
            .marquee-container::-webkit-scrollbar {
              display: none;
            }
            .marquee-container {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `
        }} />
        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
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
            <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
            <p className="text-[#718096] text-lg leading-relaxed max-w-3xl mx-auto">
              Comprehensive legal solutions delivered by experienced advocates committed to your success.
              Our specialized expertise spans across multiple practice areas.
            </p>
          </div>

          {/* Horizontal Marquee Container */}
          <div
            ref={marqueeRef}
            className="marquee-container relative w-full overflow-hidden"
          >
            <div
              className="flex space-x-8 transition-transform duration-100 ease-linear"
              style={{
                transform: `translateX(-${Math.min(scrollProgress, 0.85) * (practiceAreas.length * 280)}px)`,
                width: `${practiceAreas.length * 320 + windowWidth}px`
              }}
            >
              {practiceAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-[#4a6789]/30 hover:-translate-y-2 group relative overflow-hidden"
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
          </div>

        </div>
      </div>

      {/* Call to Action Section - appears after marquee */}
      <div
        className="absolute bottom-0 w-full py-20 bg-white/90 backdrop-blur-sm"
        style={{
          opacity: scrollProgress,
          transform: `translateY(${(1 - scrollProgress) * 100}px)`
        }}
      >
        <div className="container mx-auto px-6">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-[#e2e8f0] max-w-4xl mx-auto">
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