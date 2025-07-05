'use client';

import Image from 'next/image';
import teamHero from '@/assets/images/team.png';
import { useEffect, useRef, useState } from 'react';

const TeamHero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroBgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrollPosition = window.scrollY;
        heroBgRef.current.style.transform = `translateY(${scrollPosition * 0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden">
      <div ref={heroBgRef} className="absolute inset-0 z-0">
        <Image
          src={teamHero}
          alt="Team Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60 z-10" />
      </div>

      <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#2c415e]/90 to-transparent z-20" />
      <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#2c415e]/90 to-transparent z-20" />

      <div className="relative z-30 flex items-center justify-center h-full text-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
          Meet Our Team
        </h1>
      </div>
    </section>
  );
};

export default TeamHero;
