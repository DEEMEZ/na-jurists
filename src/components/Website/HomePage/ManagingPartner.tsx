"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    <section className="relative py-6">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 max-w-5xl py-4">
        <div 
          ref={sectionRef}
          className="bg-white rounded-xl shadow-lg p-6 transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2c415e] mb-2">Meet Our Managing Partner</h2>
            <div className="h-1 w-20 bg-[#2c415e] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image column */}
            <div className="flex justify-center">
              <div className="relative w-64 h-80 overflow-hidden rounded-lg shadow-lg border border-gray-100">
                {/* This would be replaced with an actual image of the managing partner */}
                <div className="absolute inset-0 bg-[#2c415e]/5 flex items-center justify-center">
                  <div className="rounded-full bg-[#2c415e] text-white w-32 h-32 flex items-center justify-center text-4xl shadow-md">
                    A.N.
                  </div>
                </div>
                {/* Stylish border accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2c415e] to-[#4a6789]"></div>
              </div>
            </div>
            
            {/* Text column */}
            <div className="flex flex-col lg:items-center items-center text-center lg:text-left">
              <h3 className="text-xl font-bold text-[#2c415e] mb-1">SYED ISHFAQ HUSSAIN NAQVI</h3>
              <p className="text-[#4a6789] font-medium mb-3">Managing Partner | Advocate Supreme Court</p>
              
              <div className="space-y-2 text-[#666b6f] text-sm leading-relaxed text-justify">
                <p>
                Mr. Naqvi is founding father of N & A Jurists and renowned corporate lawyer in the town. An energetic, commercially minded and self-motivated individual from a proven business law background who has significant expertise in delivering commercial solutions. He has been the legal advisor and in-house attorney of several domestic and international corporate entities including Securities & Exchange Commission of Pakistan (SECP) and Federal Board of Revenue. He has represented FBR and SECP in hundreds of cases before Islamabad High Court. Mr. Naqvi's area of specialty is Corporate, Taxation, Energy and Power Sector, and in addition thereof, he also possess ample experience in dealing with company / corporate matters including finance and banking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManagingPartner;