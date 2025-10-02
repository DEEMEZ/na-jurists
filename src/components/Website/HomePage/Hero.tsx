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
            <div className="text-center space-y-8">
              {/* Logo */}
              <div className={`transition-all duration-1000 delay-200 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Image
                    src="/text-logo.png"
                    alt="N&A Jurists - Advocates, Corporate & Legal Consultants"
                    width={350}
                    height={120}
                    className="brightness-0 invert max-w-[280px] md:max-w-[350px] h-auto"
                    priority
                  />
                </div>
              </div>

              {/* Dynamic Content with Smooth Fade Transitions */}
              <div className={`space-y-6 transition-all duration-1000 delay-400 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="space-y-4">
                  <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-white font-semibold text-lg md:text-xl tracking-wide uppercase drop-shadow-lg">
                      {heroSlides[currentSlide].subtitle}
                    </p>
                  </div>

                  <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white max-w-5xl mx-auto drop-shadow-2xl">
                      {heroSlides[currentSlide].title}
                    </h1>
                  </div>
                </div>

                <div className="w-32 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto"></div>

                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                    {heroSlides[currentSlide].description}
                  </p>
                </div>
              </div>

              {/* CTA Buttons with fade transitions */}
              <div className={`flex flex-col sm:flex-row gap-6 justify-center pt-8 transition-all duration-1000 delay-600 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <Link
                    href="/services"
                    className="bg-[#4a6789] text-white px-10 py-4 rounded-lg hover:bg-[#5a7a9b] transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 text-center uppercase tracking-wide"
                  >
                    {heroSlides[currentSlide].cta1}
                  </Link>
                </div>
                <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <Link
                    href="/contact"
                    className="bg-[#4a6789] text-white px-10 py-4 rounded-lg hover:bg-[#5a7a9b] transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 text-center uppercase tracking-wide"
                  >
                    {heroSlides[currentSlide].cta2}
                  </Link>
                </div>
              </div>

              {/* Professional Statistics */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 transition-all duration-1000 delay-800 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-[#4a6789] mb-2">25+</div>
                  <div className="text-blue-200 text-sm uppercase tracking-wide">Years Experience</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-[#4a6789] mb-2">500+</div>
                  <div className="text-blue-200 text-sm uppercase tracking-wide">Cases Won</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-[#4a6789] mb-2">100+</div>
                  <div className="text-blue-200 text-sm uppercase tracking-wide">Corporate Clients</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-[#4a6789] mb-2">24/7</div>
                  <div className="text-blue-200 text-sm uppercase tracking-wide">Client Support</div>
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
            <svg className="w-6 h-6 text-[#4a6789]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
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

          {/* Enhanced team caption */}
          <div className="absolute bottom-8 left-8 right-8 z-20">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl py-6 px-8 shadow-2xl text-center border border-white/20">
                <h3 className="text-[#1a2b3d] font-bold text-xl md:text-2xl mb-2">
                  Our Distinguished Legal Team
                </h3>
                <p className="text-[#718096] text-sm md:text-base mb-4">
                  Experienced advocates committed to delivering exceptional legal outcomes for our clients
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <span className="bg-[#1a2b3d] text-white px-3 py-1 rounded-full">Supreme Court Advocates</span>
                  <span className="bg-[#4a6789] text-white px-3 py-1 rounded-full">Corporate Law Specialists</span>
                  <span className="bg-[#4a6789] text-white px-3 py-1 rounded-full">Trusted Advisors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;