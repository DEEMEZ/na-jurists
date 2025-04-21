"use client";

import casesHeroImage from '@/assets/images/cases.png';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const CasesHero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroBgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrollPosition = window.scrollY;
        heroBgRef.current.style.transform = `translateY(${scrollPosition * 0.15}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full overflow-hidden">

      <div className="relative bg-[#f0f3f6]">

        <div 
          ref={heroBgRef}
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%232c415e\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">

          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-[#2c415e] md:text-5xl">
              Our Legal Cases & Success Stories
              <span className="mt-2 block font-light italic text-[#4a6789]">Proven Results, Trusted Advocacy</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-[#666b6f]">
              Explore our portfolio of landmark cases and legal victories that demonstrate our expertise and commitment to achieving justice for our clients.
            </p>
          </div>
        </div>
      </div>


      <div className="relative w-full overflow-hidden">

        <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#2c415e]/80 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#2c415e]/80 to-transparent z-10"></div>
        
        <div className={`w-full transition-all duration-1000 delay-300 ${
          isLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}>
          <Image
            src={casesHeroImage}
            alt="N&A Jurists Case Studies"
            width={1920}
            height={600}
            className="w-full object-cover h-[500px]"
            priority
          />
          

          <div className="absolute inset-0 bg-[#2c415e]/10 z-5"></div>
        </div>
      </div>
    </div>
  );
};

export default CasesHero;