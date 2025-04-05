"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Updated stats data
const stats = [
  { value: 50, suffix: "+", label: "Cases in Supreme Court", duration: 2000 },
  { value: 1000, suffix: "+", label: "Cases in High Court", duration: 2500 },
  { value: 1000, suffix: "+", label: "Cases in District Courts", duration: 2500 },
  { value: 25, suffix: "+", label: "Years of Experience", duration: 1800 },
];

// Case studies data
const caseStudies = [
  {
    id: 1,
    title: "POINT OF SALES CASE",
    description: "Federal Board of Revenue (FBR) has promulgated rules to install Point of Sale (POS) to monitor the sales by retailers in order to ensure maximum tax collection. Mr. N&A successfully represented the FBR before Islamabad High Court. Whereby Writ Petitions challenging the vires of POS were dismissed.",
    image: "/pos-case.jpg", // Replace with actual case image
    bgColor: "bg-[#3d4e6a]",
  },
  {
    id: 2,
    title: "AXACT",
    description: "Our Senior Partner was special prosecutor for Federal Investigation Agency (FIA) in a trial conducted before Session Judge Islamabad and accused including Chief Executive Officer of AXACT was convicted.",
    image: "/axact-case.jpg", // Replace with actual case image
    bgColor: "bg-[#3d4e6a]",
  },
  // You can add more case studies as needed
];

const CaseStudies = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countersStarted, setCountersStarted] = useState(false);
  const [counterValues, setCounterValues] = useState(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const hasAnimatedCounter = useRef(false);

  useEffect(() => {
    setIsLoaded(true);

    // Auto-rotate case studies if you want
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % caseStudies.length);
    }, 8000);

    // Reveal animation and counter trigger on scroll
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
        
        if (isVisible) {
          sectionRef.current.classList.add('opacity-100');
          sectionRef.current.classList.remove('opacity-0', 'translate-y-10');
          
          // Start counter animation when scrolled into view
          if (!hasAnimatedCounter.current) {
            hasAnimatedCounter.current = true;
            setCountersStarted(true);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Counter animation effect
  useEffect(() => {
    if (!countersStarted) return;

    // Create an array of intervals to clear later
    const intervals: NodeJS.Timeout[] = [];

    stats.forEach((stat, index) => {
      let startTime: number | null = null;
      let currentFrame: number | null = null;

      const animateCounter = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        
        // Calculate the current value based on progress
        const percentage = Math.min(progress / stat.duration, 1);
        const easedPercentage = easeOutQuart(percentage);
        const value = Math.floor(easedPercentage * stat.value);
        
        // Update state with new value
        setCounterValues(prev => {
          const newValues = [...prev];
          newValues[index] = value;
          return newValues;
        });
        
        // Continue animation if not complete
        if (progress < stat.duration) {
          currentFrame = requestAnimationFrame(animateCounter);
        } else {
          // Ensure final value is exact
          setCounterValues(prev => {
            const newValues = [...prev];
            newValues[index] = stat.value;
            return newValues;
          });
        }
      };
      
      // Start the animation
      const frameId = requestAnimationFrame(animateCounter);
      
      // Store cleanup function
      intervals.push(
        setTimeout(() => {
          if (currentFrame) cancelAnimationFrame(currentFrame);
        }, stat.duration + 100) // Add a small buffer
      );
    });

    return () => {
      // Clean up all timeouts
      intervals.forEach(id => clearTimeout(id));
    };
  }, [countersStarted]);

  // Easing function for smoother animation
  const easeOutQuart = (x: number): number => {
    return 1 - Math.pow(1 - x, 4);
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute left-0 top-0 bottom-0 w-1/6 bg-white/5 -skew-x-12 transform origin-top-left"></div>
      <div className="absolute right-0 top-1/4 bottom-0 w-1/12 bg-white/5 skew-x-12 transform origin-bottom-right"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={sectionRef}
          className="transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">CASE STUDIES</h2>
            <div className="h-1 w-24 bg-white/30 mx-auto mb-8"></div>
          </div>
          
          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {caseStudies.map((caseStudy) => (
              <div 
                key={caseStudy.id}
                className="relative overflow-hidden rounded-xl shadow-lg group h-[300px]"
              >
                {/* This would be replaced by actual images */}
                <div className="absolute inset-0 bg-gray-500 bg-opacity-50">
                  {/* Placeholder for image (replace with actual Image component) */}
                  <div className="w-full h-full bg-cover bg-center opacity-70" 
                    style={{backgroundImage: `url(${caseStudy.image})`}}>
                  </div>
                </div>
                
                {/* Dark overlay with text */}
                <div className={`absolute inset-0 ${caseStudy.bgColor} bg-opacity-80 p-6 flex flex-col justify-center text-center`}>
                  <h3 className="text-2xl font-bold text-white mb-4">{caseStudy.title}</h3>
                  <p className="text-white/80 text-sm md:text-base">{caseStudy.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Counter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-[#1a2a3e]/80 backdrop-blur-sm rounded-lg p-6 text-center relative overflow-hidden group hover:bg-[#1a2a3e] transition-all duration-300"
              >
                {/* Animated background pulse effect */}
                <div className="absolute inset-0 bg-white/5 transform scale-0 group-hover:scale-100 transition-transform duration-700 rounded-lg"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <div className="text-5xl font-bold text-white" aria-live="polite">
                      {counterValues[index]}
                    </div>
                    <div className="text-5xl font-bold text-white">{stat.suffix}</div>
                  </div>
                  <div className="text-white/80 mt-2">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Optional view more button */}
          <div className="mt-10 text-center">
            <Link 
              href="/case-studies" 
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all duration-300"
            >
              View More Case Studies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;