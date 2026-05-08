"use client";

import homehero from '@/assets/images/homehero.png';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const heroSlides = [
    {
      title: "Legal Excellence",
      subtitle: "Trusted Legal Expertise",
      description: "Providing comprehensive legal solutions with unwavering commitment to integrity, excellence, and client success",
      cta1: "Our Services",
      cta2: "Schedule Consultation",
      cta1Href: "/services",
      cta2Href: "/contact",
    },
    {
      title: "Corporate Solutions",
      subtitle: "Business Law Specialists",
      description: "Expert guidance in corporate formation, mergers & acquisitions, and commercial legal matters for sustainable business growth",
      cta1: "Corporate Services",
      cta2: "Contact Us",
      cta1Href: "/services",
      cta2Href: "/contact",
    },
    {
      title: "Client Success",
      subtitle: "Client-Focused Approach",
      description: "Dedicated advocates with decades of experience, representing clients with the highest standards of legal excellence",
      cta1: "Meet Our Team",
      cta2: "Case Studies",
      cta1Href: "/team",
      cta2Href: "/cases",
    }
  ];

  useEffect(() => {
    setIsLoaded(true);

    // Auto-rotate slides with smooth transition
    const slideInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 500);
    }, 6000);

    // Subtle parallax scrolling effect (rAF-throttled)
    const handleScroll = () => {
      lastScrollY.current = window.scrollY;
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          if (heroBgRef.current) {
            heroBgRef.current.style.transform = `translateY(${lastScrollY.current * 0.15}px)`;
          }
          ticking.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(slideInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* Modern Hero Section with Background Image */}
      <div className="relative min-h-[600px] h-screen max-h-[900px] flex items-center">
        {/* Background Image with Parallax */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 z-0"
        >
          <Image
            src={homehero}
            alt="Legal background"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
        </div>

        {/* Professional Multi-layer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419]/80 via-[#1a2b3d]/70 to-[#2c415e]/75 z-10"></div>

        {/* Subtle Animated Pattern Overlay */}
        <div
          className="absolute inset-0 z-15 opacity-5"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M25 25h50v50H25V25zM0 0h20v20H0V0zM80 0h20v20H80V0zM0 80h20v20H0V80zM80 80h20v20H80V80z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '150px 150px',
          }}
        />

        {/* Professional Blue Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4a6789] via-[#5a7a9b] to-[#4a6789] z-30"></div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 relative z-30 h-full flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-14 items-center">
              {/* Left Side - Logo & Branding */}
              <div className={`space-y-3 md:space-y-4 lg:space-y-5 transition-all duration-1000 delay-200 ${
                isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                {/* Logo with side accent */}
                <div className="relative">
                  <div className="absolute -left-3 md:-left-4 lg:-left-5 top-0 bottom-0 w-1.5 md:w-2 bg-gradient-to-b from-[#4a6789] to-[#5a7a9b] rounded-full"></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-r-3xl pl-6 md:pl-8 lg:pl-10 pr-4 md:pr-6 lg:pr-8 py-3 md:py-4 lg:py-5 border-r border-white/20">
                    <div className="text-white">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-1">
                        N&A JURISTS
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium tracking-wider">
                        Advocates, Corporate & Legal Consultants
                      </p>
                    </div>
                  </div>
                </div>

                {/* Side badges */}
                <div className="space-y-1.5 md:space-y-2 lg:space-y-2.5 pl-3 md:pl-4 lg:pl-5">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#4a6789] rounded-full flex-shrink-0"></div>
                    <span className="text-white/80 text-xs md:text-sm font-medium">Supreme Court Advocates</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#5a7a9b] rounded-full flex-shrink-0"></div>
                    <span className="text-white/80 text-xs md:text-sm font-medium">Corporate Law Specialists</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#6a8aab] rounded-full flex-shrink-0"></div>
                    <span className="text-white/80 text-xs md:text-sm font-medium">5000+ Cases Handled</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className={`space-y-3 md:space-y-4 lg:space-y-5 transition-all duration-1000 delay-400 ${
                isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}>
                {/* Subtitle with corner accent */}
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="relative">
                    <div className="absolute -top-1 md:-top-1.5 -left-1 md:-left-1.5 w-4 h-4 md:w-5 md:h-5 border-l-2 border-t-2 border-[#4a6789]"></div>
                    <p className="text-[#4a6789] font-semibold text-xs md:text-sm tracking-wide uppercase pl-3 md:pl-4 lg:pl-5">
                      {heroSlides[currentSlide].subtitle}
                    </p>
                  </div>
                </div>

                {/* Large asymmetrical title */}
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    <span className="block">{heroSlides[currentSlide].title.split(' ')[0]}</span>
                    {heroSlides[currentSlide].title.split(' ').length > 1 && (
                      <span className="block text-white/70">
                        {heroSlides[currentSlide].title.split(' ').slice(1).join(' ')}
                      </span>
                    )}
                  </h1>
                </div>

                {/* Angled separator */}
                <div className="relative h-0.5 md:h-1 w-20 md:w-24 lg:w-28">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4a6789] to-transparent transform -skew-x-12"></div>
                </div>

                {/* Description */}
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed max-w-lg">
                    {heroSlides[currentSlide].description}
                  </p>
                </div>

                {/* Stacked CTA Buttons */}
                <div className="space-y-2 md:space-y-3">
                  <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <Link
                      href={heroSlides[currentSlide].cta1Href}
                      className="group flex items-center justify-between bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] text-white px-5 md:px-6 lg:px-7 py-2.5 md:py-3 lg:py-3.5 rounded-none hover:from-[#5a7a9b] hover:to-[#6a8aab] transition-all duration-300 font-bold w-full max-w-xs text-sm"
                    >
                      <span>{heroSlides[currentSlide].cta1}</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                  <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <Link
                      href={heroSlides[currentSlide].cta2Href}
                      className="group flex items-center justify-between border-l-4 border-[#4a6789] bg-white/5 backdrop-blur-sm text-white px-5 md:px-6 lg:px-7 py-2.5 md:py-3 lg:py-3.5 hover:bg-white/10 transition-all duration-300 font-semibold w-full max-w-xs text-sm"
                    >
                      <span>{heroSlides[currentSlide].cta2}</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className={`flex justify-center space-x-2 md:space-x-3 pt-4 md:pt-5 lg:pt-6 transition-all duration-1000 delay-1000 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index !== currentSlide) {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentSlide(index);
                        setTimeout(() => {
                          setIsTransitioning(false);
                        }, 100);
                      }, 500);
                    }
                  }}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-[#4a6789] scale-125 shadow-lg'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
