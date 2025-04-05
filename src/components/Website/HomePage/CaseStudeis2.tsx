"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import fbrimg from '@/assets/images/fbr.jpg'; 
import fiaimg from '@/assets/images/fia.jpeg';

// Updated stats data with the values from your image
const stats = [
  { value: 50, suffix: "+", label: "Cases in Supreme Court", duration: 2000 },
  { value: 1000, suffix: "+", label: "Cases in High Court", duration: 2500 },
  { value: 1000, suffix: "+", label: "Cases in District Courts", duration: 2500 },
  { value: 25, suffix: "+", label: "Years of Experience", duration: 1800 }
];

// Case studies data with properly referenced images
const caseStudies = [
  {
    id: 1,
    title: "POINT OF SALES CASE",
    description: "Federal Board of Revenue (FBR) has promulgated rules to install Point of Sale (POS) to monitor the sales by retailers in order to ensure maximum tax collection. Mr. Naqvi successfully represented the FBR before Islamabad High Court. Whereby Writ Petitions challenging the vires of POS were dismissed.",
    image: fbrimg
  },
  {
    id: 2,
    title: "AXACT",
    description: "Our Senior Partner was special prosecutor for Federal Investigation Agency (FIA) in a trial conducted before Session Judge Islamabad and accused including Chief Executive Officer of AXACT was convicted.",
    image: fiaimg
  }
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

    // Auto-rotate case studies
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
      {/* Left side decorative element - neutral color */}
      <div className="absolute left-0 top-0 bottom-0 w-1/6 bg-gray-400/5 -skew-x-12 transform origin-top-left"></div>
      
      {/* Right side decorative element - neutral color */}
      <div className="absolute right-0 top-1/4 bottom-0 w-1/12 bg-gray-400/5 skew-x-12 transform origin-bottom-right"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={sectionRef}
          className="transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          <div className="rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Left column - case studies content with background images */}
              <div className="col-span-3 relative">
                {/* Background images for each case study */}
                {caseStudies.map((caseStudy, index) => (
                  <div 
                    key={`bg-${caseStudy.id}`}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === activeIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Dark neutral overlay instead of blue */}
                    <div className="absolute inset-0 bg-black/30 z-10"></div>
                    <Image
                      src={caseStudy.image}
                      alt={caseStudy.title}
                      fill
                      className="object-cover object-center"
                      style={{ filter: 'brightness(0.8)' }} 
                      priority={index === 0}
                    />
                  </div>
                ))}
                
                {/* Content overlay */}
                <div className="relative z-20 p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-white mb-3">CASE STUDIES</h2>
                  <div className="h-1 w-24 bg-white/30 mb-8"></div>
                  
                  <div className="relative min-h-[250px]">
                    {caseStudies.map((caseStudy, index) => (
                      <div 
                        key={caseStudy.id}
                        className={`absolute inset-0 transition-all duration-1000 ${
                          index === activeIndex 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 translate-x-8'
                        }`}
                      >
                        <h3 className="text-2xl font-bold text-white mb-4">{caseStudy.title}</h3>
                        {/* Neutral dark background instead of blue */}
                        <p className="text-lg text-white mb-6 backdrop-blur-sm bg-black/20 p-4 rounded-lg shadow-lg">
                          {caseStudy.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation dots */}
                  <div className="flex justify-center space-x-2 mt-8">
                    {caseStudies.map((caseStudy, index) => (
                      <button
                        key={caseStudy.id}
                        onClick={() => setActiveIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === activeIndex 
                            ? 'bg-white w-8' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`View ${caseStudy.title} case study`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right column - stats/numbers with counter animation - dark gray instead of blue */}
              <div className="col-span-2 bg-gradient-to-br from-gray-700 to-gray-900 p-8 md:p-12 flex flex-col justify-center">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Our Track Record</h3>
                  <p className="text-white/70">Building trust through consistent results</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div 
                      key={index}
                      className="bg-white/10 rounded-lg p-6 text-center relative overflow-hidden group"
                    >
                      {/* Animated background pulse effect */}
                      <div className="absolute inset-0 bg-white/5 transform scale-0 group-hover:scale-100 transition-transform duration-700 rounded-lg"></div>
                      
                      <div className="relative">
                        <div className="flex items-center justify-center">
                          <div className="text-4xl font-bold text-white" aria-live="polite">
                            {counterValues[index]}
                          </div>
                          <div className="text-4xl font-bold text-white">{stat.suffix}</div>
                        </div>
                        <div className="text-white/70">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;