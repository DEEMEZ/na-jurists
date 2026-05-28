"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calculator,
  Briefcase,
  Landmark,
  Scale,
  MessageSquare,
  Users,
  Copyright,
  ShieldAlert,
  Gavel
} from 'lucide-react';

// Professional Lucide icon component (high contrast on white cards)
const Icon = ({ name }: { name: string }) => {
  const className = "text-[#1a2b3d]";
  const icons = {
    corporate: <Building2 size={36} strokeWidth={2} className={className} />,
    taxation: <Calculator size={36} strokeWidth={2} className={className} />,
    commercial: <Briefcase size={36} strokeWidth={2} className={className} />,
    banking: <Landmark size={36} strokeWidth={2} className={className} />,
    dispute: <Scale size={36} strokeWidth={2} className={className} />,
    adr: <MessageSquare size={36} strokeWidth={2} className={className} />,
    employment: <Users size={36} strokeWidth={2} className={className} />,
    ip: <Copyright size={36} strokeWidth={2} className={className} />,
    corporateCrimeAml: <ShieldAlert size={36} strokeWidth={2} className={className} />,
    criminalLaw: <Gavel size={36} strokeWidth={2} className={className} />,
  };

  return (
    <div className="flex justify-center mb-4">
      {icons[name as keyof typeof icons] || <Building2 size={36} strokeWidth={2} className={className} />}
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

  /** Nine core practice areas — `serviceId` matches `src/constants.js` and `/services/[id]`. */
  const practiceAreas: {
    icon: string;
    title: string;
    description: string;
    delay: number;
    serviceId: number;
  }[] = [
    {
      icon: 'commercial',
      title: 'Corporate and Commercial',
      description:
        'Incorporation, governance, M&A support, commercial contracts, procurement, and corporate dispute resolution.',
      delay: 100,
      serviceId: 1,
    },
    {
      icon: 'taxation',
      title: 'Taxation',
      description:
        'From tax advisory and planning to litigation before tribunals and superior courts, including AML and Benami compliance.',
      delay: 150,
      serviceId: 2,
    },
    {
      icon: 'banking',
      title: 'Banking and Project Finance',
      description:
        'Financing documentation, inter-creditor arrangements, security due diligence, and charge registration for banks and developers.',
      delay: 200,
      serviceId: 3,
    },
    {
      icon: 'dispute',
      title: 'Dispute Resolution',
      description:
        'Civil and regulatory litigation, company jurisdiction, tax appeals, and international arbitration representation.',
      delay: 250,
      serviceId: 4,
    },
    {
      icon: 'adr',
      title: 'Alternative Dispute Resolution',
      description:
        'Domestic and international arbitration under the Arbitration Act, 1940, and ADR under tax, company, and insurance laws.',
      delay: 300,
      serviceId: 5,
    },
    {
      icon: 'employment',
      title: 'Employment and Labour Laws',
      description:
        'Employment policies, contracts for foreign nationals, disciplinary rules, union matters, and tribunal representation.',
      delay: 350,
      serviceId: 6,
    },
    {
      icon: 'ip',
      title: 'Intellectual Property',
      description:
        'IP ownership and disclosure compliance, disputes and appeals, trade mark and patent-related advice.',
      delay: 400,
      serviceId: 7,
    },
    {
      icon: 'corporateCrimeAml',
      title: 'Corporate Crime and Anti-Money Laundering',
      description:
        'Corporate crime advisory and litigation, AML/CFT compliance, internal investigations, and regulatory enforcement.',
      delay: 450,
      serviceId: 8,
    },
    {
      icon: 'criminalLaw',
      title: 'Criminal Law',
      description:
        'Trials and bail, narcotics and serious offences, white-collar crime, and criminal appeals before higher courts.',
      delay: 500,
      serviceId: 9,
    },
  ];

  /** w-80 (320px) + space-x-8 (32px) per card; full horizontal scroll so last cards (e.g. Criminal Law) are reachable. */
  const viewport = windowWidth > 0 ? windowWidth : 1280;
  const cardStride = 352;
  const marqueeMaxTranslate = Math.max(0, practiceAreas.length * cardStride - viewport * 0.88);

  return (
    <section
      ref={practiceAreaRef}
      className="relative bg-gradient-to-br from-[#eef2f7] to-[#e2e8f0]"
    >
      {/* Scroll runway for horizontal marquee only — CTA follows in normal flow so it never washes out cards */}
      <div className="relative h-[420vh]">
      {/* Enhanced background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.12\'%3E%3Cpath d=\'M25 25h50v50H25V25zM0 0h20v20H0V0zM80 0h20v20H80V0zM0 80h20v20H0V80zM80 80h20v20H80V80z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Sticky Container for Marquee */}
      <div className="sticky top-0 z-20 h-screen flex flex-col justify-center overflow-hidden bg-[#eef2f7]">
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
          <div className="mb-16 flex flex-col items-center text-center">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center justify-center rounded-full bg-[#1a2b3d]/10 px-4 py-2 text-center text-sm font-semibold text-[#1a2b3d]">
                Our Expertise
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
              Legal Services We
              <span className="block text-[#4a6789]">Provide</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
            <p className="text-[#334155] text-lg leading-relaxed max-w-3xl mx-auto font-medium">
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
                transform: `translateX(-${scrollProgress * marqueeMaxTranslate}px)`,
                width: `${practiceAreas.length * 320 + Math.max(windowWidth, 1280)}px`
              }}
            >
              {practiceAreas.map((area, index) => (
                <Link
                  key={index}
                  href={`/services/${area.serviceId}`}
                  className="flex-shrink-0 w-80 rounded-xl p-6 border-2 border-[#94a3b8] bg-white shadow-[0_6px_20px_-6px_rgba(15,23,42,0.28)] hover:shadow-[0_14px_32px_-10px_rgba(15,23,42,0.35)] hover:border-[#2c415e] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden block no-underline text-[#0f172a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c415e] focus-visible:ring-offset-2"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b3d]/[0.06] to-[#4a6789]/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <Icon name={area.icon} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0f172a] mb-3 text-center group-hover:text-[#1a2b3d] transition-colors duration-300">
                      {area.title}
                    </h3>
                    <p className="text-[#1e293b] text-sm leading-relaxed text-center font-semibold">
                      {area.description}
                    </p>

                    <div className="flex justify-center items-center gap-1.5 mt-4 text-[#1a2b3d] text-sm font-bold">
                      <span>View service</span>
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* CTA: normal flow after marquee scroll — avoids translucent overlay on service cards */}
      <div className="relative z-10 w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#cbd5e1]">
        <div className="container mx-auto px-6">
          <div className="text-center bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_-12px_rgba(26,43,61,0.25)] border-2 border-[#e2e8f0] max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#1a2b3d] mb-4">
              Need Legal Assistance?
            </h3>
            <p className="text-[#334155] text-base md:text-lg mb-6 max-w-2xl mx-auto leading-relaxed font-medium">
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