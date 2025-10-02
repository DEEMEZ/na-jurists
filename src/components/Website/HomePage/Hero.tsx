"use client";

import heroimg from '@/assets/images/hero.png';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroBgRef = useRef<HTMLDivElement | null>(null);

  const heroSlides = [
    {
      title: "Legal Excellence",
      subtitle: "Trusted Legal Expertise",
      description: "Providing comprehensive legal solutions with unwavering commitment to integrity, excellence, and client success",
      cta1: "Our Services",
      cta2: "Schedule Consultation"
    },
    {
      title: "Corporate Solutions",
      subtitle: "Business Law Specialists",
      description: "Expert guidance in corporate formation, mergers & acquisitions, and commercial legal matters for sustainable business growth",
      cta1: "Corporate Services",
      cta2: "Contact Us"
    },
    {
      title: "Client Success",
      subtitle: "Client-Focused Approach",
      description: "Dedicated advocates with decades of experience, representing clients with the highest standards of legal excellence",
      cta1: "Meet Our Team",
      cta2: "Case Studies"
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

    // Subtle parallax scrolling effect
    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrollPosition = window.scrollY;
        heroBgRef.current.style.transform = `translateY(${scrollPosition * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(slideInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* Modern Hero Section with Background Image */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image with Parallax Effect */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Professional Multi-layer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b3d]/90 via-[#1a2b3d]/80 to-[#2c415e]/85 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20"></div>

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
        <div className="container mx-auto px-6 py-20 relative z-30">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
              {/* Left Side - Logo & Branding */}
              <div className={`space-y-8 transition-all duration-1000 delay-200 ${
                isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                {/* Logo with side accent */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-2 bg-gradient-to-b from-[#4a6789] to-[#5a7a9b] rounded-full"></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-r-3xl pl-12 pr-8 py-8 border-r border-white/20">
                    <Image
                      src="/text-logo.png"
                      alt="N&A Jurists - Advocates, Corporate & Legal Consultants"
                      width={350}
                      height={120}
                      className="brightness-0 invert max-w-[250px] md:max-w-[300px] h-auto"
                      priority
                    />
                  </div>
                </div>

                {/* Side badges */}
                <div className="space-y-4 pl-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#4a6789] rounded-full"></div>
                    <span className="text-white/80 text-sm font-medium">Supreme Court Advocates</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#5a7a9b] rounded-full"></div>
                    <span className="text-white/80 text-sm font-medium">Corporate Law Specialists</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#6a8aab] rounded-full"></div>
                    <span className="text-white/80 text-sm font-medium">1500+ Cases Handled</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className={`space-y-8 transition-all duration-1000 delay-400 ${
                isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}>
                {/* Subtitle with corner accent */}
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-[#4a6789]"></div>
                    <p className="text-[#4a6789] font-semibold text-lg md:text-xl tracking-wide uppercase pl-6">
                      {heroSlides[currentSlide].subtitle}
                    </p>
                  </div>
                </div>

                {/* Large asymmetrical title */}
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] text-left">
                    <span className="block">{heroSlides[currentSlide].title.split(' ')[0]}</span>
                    {heroSlides[currentSlide].title.split(' ').length > 1 && (
                      <span className="block text-right text-white/70 text-4xl md:text-5xl lg:text-6xl ml-8 -mt-2">
                        {heroSlides[currentSlide].title.split(' ').slice(1).join(' ')}
                      </span>
                    )}
                  </h1>
                </div>

                {/* Angled separator */}
                <div className="relative h-1 w-32">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4a6789] to-transparent transform -skew-x-12"></div>
                </div>

                {/* Description */}
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-lg">
                    {heroSlides[currentSlide].description}
                  </p>
                </div>

                {/* Stacked CTA Buttons */}
                <div className="space-y-4">
                  <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <Link
                      href="/services"
                      className="group flex items-center justify-between bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] text-white px-8 py-4 rounded-none hover:from-[#5a7a9b] hover:to-[#6a8aab] transition-all duration-300 font-bold w-full max-w-xs"
                    >
                      <span>{heroSlides[currentSlide].cta1}</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                  <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <Link
                      href="/contact"
                      className="group flex items-center justify-between border-l-4 border-[#4a6789] bg-white/5 backdrop-blur-sm text-white px-8 py-4 hover:bg-white/10 transition-all duration-300 font-semibold w-full max-w-xs"
                    >
                      <span>{heroSlides[currentSlide].cta2}</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className={`flex justify-center space-x-4 pt-12 transition-all duration-1000 delay-1000 ${
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
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-[#4a6789] scale-125 shadow-lg'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Professional Badges */}
            <div className={`flex flex-wrap justify-center gap-4 pt-8 transition-all duration-1000 delay-1200 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <span className="text-blue-200 text-sm font-medium">Supreme Court Advocates</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <span className="text-blue-200 text-sm font-medium">Corporate Law Specialists</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <span className="text-blue-200 text-sm font-medium">Trusted Legal Advisors</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Enhanced Team Photo Section */}
      <div className="relative w-full overflow-hidden bg-white">
        <div className="absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-[#1a2b3d]/90 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-[#1a2b3d]/90 to-transparent z-10"></div>

        <div className={`w-full transition-all duration-1000 delay-500 ${
          isLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}>
          <Image
            src={heroimg}
            alt="N&A Jurists Professional Team"
            width={1920}
            height={600}
            className="w-full object-cover h-[400px] md:h-[500px]"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2b3d]/40 via-transparent to-transparent z-5"></div>

        </div>
      </div>
    </div>
  );
};

export default Hero;