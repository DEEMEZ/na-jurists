"use client";

import Member1 from '@/assets/images/Member1.jpeg';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const ManagingPartner = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
        
        if (isVisible) {
          sectionRef.current.classList.add('opacity-100');
          sectionRef.current.classList.remove('opacity-0', 'translate-y-10');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative py-20 bg-white">
      {/* Enhanced background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-3"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M50 0L25 25h50L50 0zM0 50l25-25v50L0 50zM50 100l25-25H25l25 25zM100 50L75 75V25l25 25z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f7fafc] to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-t from-[#edf2f7] to-transparent opacity-30"></div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div
          ref={sectionRef}
          className="transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-[#4a6789]/10 text-[#4a6789] px-4 py-2 rounded-full text-sm font-semibold">
                Leadership
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
              Meet Our
              <span className="block text-[#4a6789]">Managing Partner</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#d4af37] mx-auto mb-6"></div>
            <p className="text-[#718096] text-lg leading-relaxed max-w-3xl mx-auto">
              Led by visionary legal expertise with decades of experience in corporate law and Supreme Court advocacy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Enhanced Image column */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="relative w-80 h-96 overflow-hidden rounded-2xl shadow-2xl border border-gray-200">
                  <Image
                    src={Member1}
                    alt="Syed Ishfaq Hussain Naqvi - Managing Partner"
                    width={320}
                    height={384}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    quality={95}
                  />
                  {/* Enhanced overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2b3d]/30 via-transparent to-transparent"></div>
                  {/* Professional border accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1a2b3d] via-[#4a6789] to-[#d4af37]"></div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#4a6789]/10 rounded-full -z-10"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#d4af37]/10 rounded-full -z-10"></div>
              </div>
            </div>

            {/* Enhanced Text column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[#1a2b3d]">
                  SYED ISHFAQ HUSSAIN NAQVI
                </h3>
                <div className="flex flex-col space-y-2">
                  <p className="text-[#4a6789] font-semibold text-lg">
                    Managing Partner | Advocate Supreme Court
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#1a2b3d] text-white px-3 py-1 rounded-full text-xs font-medium">
                      Supreme Court
                    </span>
                    <span className="bg-[#4a6789] text-white px-3 py-1 rounded-full text-xs font-medium">
                      Corporate Law
                    </span>
                    <span className="bg-[#d4af37] text-white px-3 py-1 rounded-full text-xs font-medium">
                      Taxation
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#f7fafc] to-white rounded-xl p-6 border-l-4 border-[#4a6789]">
                <p className="text-[#718096] leading-relaxed text-justify">
                  Mr. Naqvi is the founding father of N & A Jurists and a renowned corporate lawyer.
                  An energetic, commercially minded and self-motivated individual with a proven business law background,
                  he has significant expertise in delivering commercial solutions. He has been the legal advisor and
                  in-house attorney of several domestic and international corporate entities including the Securities &
                  Exchange Commission of Pakistan (SECP) and Federal Board of Revenue (FBR).
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e2e8f0]">
                <h4 className="font-semibold text-[#1a2b3d] mb-4">Areas of Expertise</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#4a6789] rounded-full"></div>
                    <span className="text-[#718096]">Corporate Formation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#4a6789] rounded-full"></div>
                    <span className="text-[#718096]">Taxation Law</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#4a6789] rounded-full"></div>
                    <span className="text-[#718096]">Energy & Power</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#4a6789] rounded-full"></div>
                    <span className="text-[#718096]">Banking & Finance</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/team"
                  prefetch={true}
                  className="bg-[#1a2b3d] text-white px-8 py-3 rounded-lg hover:bg-[#2c415e] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center flex items-center justify-center"
                >
                  Meet Our Full Team
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-[#4a6789] text-[#4a6789] px-8 py-3 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold text-center"
                >
                  Schedule Meeting
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManagingPartner;