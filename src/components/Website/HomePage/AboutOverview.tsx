"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Award, Scale, Building2, Clock, Shield, Zap, Users } from 'lucide-react';

const AboutOverview = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const achievements = [
    { number: "300+", label: "Satisfied Clients", icon: Award },
    { number: "500+", label: "Cases Won", icon: Scale },
    { number: "100+", label: "Corporate Clients", icon: Building2 },
    { number: "24/7", label: "Client Support", icon: Clock }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f7fafc] to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-t from-[#edf2f7] to-transparent opacity-30"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div className="space-y-4">
              <div className="inline-block">
                <span className="bg-[#4a6789]/10 text-[#4a6789] px-4 py-2 rounded-full text-sm font-semibold">
                  About N&A Jurists
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] leading-tight">
                Leading Legal
                <span className="block text-[#4a6789]">Excellence Since 1998</span>
              </h2>

              <div className="w-20 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b]"></div>
            </div>

            <div className="space-y-6 text-[#718096] text-lg leading-relaxed">
              <p>
                <strong className="text-[#1a2b3d]">N&A Jurists</strong> stands as a beacon of legal excellence,
                providing comprehensive legal services with unwavering commitment to integrity, professionalism,
                and client success. Our firm has been at the forefront of legal advocacy for over two decades.
              </p>

              <p>
                Founded by renowned legal experts, we specialize in corporate law, taxation, commercial litigation,
                and provide strategic legal counsel to businesses of all sizes. Our team of Supreme Court advocates
                brings unparalleled expertise to every case.
              </p>

              <p>
                We believe in building lasting relationships with our clients through transparent communication,
                innovative legal solutions, and a deep understanding of the evolving business landscape.
              </p>
            </div>

            {/* Key Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1a2b3d] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#1a2b3d] mb-2">Integrity</h3>
                <p className="text-sm text-[#718096]">Unwavering ethical standards</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#4a6789] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#1a2b3d] mb-2">Excellence</h3>
                <p className="text-sm text-[#718096]">Superior legal expertise</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#5a7a9b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-[#1a2b3d] mb-2">Dedication</h3>
                <p className="text-sm text-[#718096]">Committed to client success</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="bg-[#1a2b3d] text-white px-8 py-3 rounded-lg hover:bg-[#2c415e] transition-all duration-300 font-semibold text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Learn More About Us
              </Link>
              <Link
                href="/team"
                className="border-2 border-[#4a6789] text-[#4a6789] px-8 py-3 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold text-center"
              >
                Meet Our Team
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <div className="relative">
              {/* Main Content Card */}
              <div className="bg-gradient-to-br from-[#1a2b3d] to-[#2c415e] rounded-2xl p-8 text-white shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <Image
                      src="/text-logo.png"
                      alt="N&A Jurists"
                      width={200}
                      height={80}
                      className="mx-auto brightness-0 invert opacity-90"
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Trusted Legal Partners</h3>
                    <p className="text-blue-200 text-sm">
                      Advocates, Corporate & Legal Consultants
                    </p>
                  </div>

                  {/* Achievements Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => {
                      const IconComponent = achievement.icon;
                      return (
                        <div
                          key={index}
                          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300"
                        >
                          <div className="flex justify-center mb-2">
                            <IconComponent className="w-6 h-6 text-[#4a6789]" />
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">
                            {achievement.number}
                          </div>
                          <div className="text-xs text-blue-200">
                            {achievement.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Call to Action */}
                  <div className="text-center pt-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center bg-[#4a6789] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a7a9b] transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Schedule Consultation
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutOverview;