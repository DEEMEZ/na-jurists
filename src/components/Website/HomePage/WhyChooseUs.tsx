"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  Building2,
  DollarSign,
  Clock,
  Users,
  ShieldCheck
} from 'lucide-react';

const WhyChooseUs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    years: 0,
    cases: 0,
    clients: 0,
    satisfaction: 0
  });
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Supreme Court Advocates",
      description: "Our senior partners are qualified advocates of the Supreme Court of Pakistan, bringing the highest level of legal expertise to your case.",
      color: "bg-[#1a2b3d]"
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "Corporate Law Specialists",
      description: "Extensive experience in corporate formation, mergers & acquisitions, and commercial law with a proven track record of success.",
      color: "bg-[#4a6789]"
    },
    {
      icon: <DollarSign className="w-12 h-12" />,
      title: "Cost-Effective Solutions",
      description: "Transparent pricing with no hidden costs. We provide maximum value while maintaining the highest standards of legal service.",
      color: "bg-[#5a7a9b]"
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: "24/7 Client Support",
      description: "Round-the-clock availability for urgent matters. Our commitment to client service extends beyond business hours.",
      color: "bg-[#2c415e]"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Experienced Team",
      description: "Decades of combined legal experience across multiple practice areas with a focus on achieving the best outcomes for our clients.",
      color: "bg-[#1a2b3d]"
    },
    {
      icon: <ShieldCheck className="w-12 h-12" />,
      title: "Confidentiality Assured",
      description: "Strict adherence to attorney-client privilege and confidentiality protocols. Your sensitive information remains secure with us.",
      color: "bg-[#4a6789]"
    }
  ];

  const stats = [
    { end: 250, label: "Happy Clients", suffix: "+" },
    { end: 500, label: "Cases Won", suffix: "+" },
    { end: 100, label: "Corporate Clients", suffix: "+" },
    { end: 99, label: "Client Satisfaction", suffix: "%" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    stats.forEach((stat, index) => {
      let currentValue = 0;
      const increment = stat.end / steps;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= stat.end) {
          currentValue = stat.end;
          clearInterval(timer);
        }

        setCounters(prev => ({
          ...prev,
          [index === 0 ? 'years' : index === 1 ? 'cases' : index === 2 ? 'clients' : 'satisfaction']: Math.floor(currentValue)
        }));
      }, stepDuration);
    });
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#f7fafc] to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/2 bg-gradient-to-t from-[#edf2f7] to-transparent opacity-30"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block mb-4">
            <span className="bg-[#4a6789]/10 text-[#4a6789] px-4 py-2 rounded-full text-sm font-semibold">
              Why Choose N&A Jurists
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
            Your Trusted
            <span className="block text-[#4a6789]">Legal Partners</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
          <p className="text-[#718096] text-lg leading-relaxed max-w-3xl mx-auto">
            With decades of legal experience and a commitment to excellence, we provide comprehensive legal solutions
            tailored to meet your unique needs and objectives.
          </p>
        </div>

        {/* Statistics Section */}
        <div className={`mb-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-[#1a2b3d] to-[#2c415e] rounded-2xl p-8 text-white shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {index === 0 ? counters.years :
                     index === 1 ? counters.cases :
                     index === 2 ? counters.clients :
                     counters.satisfaction}{stat.suffix}
                  </div>
                  <div className="text-sm md:text-base text-blue-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${(index + 1) * 200}ms` }}
            >
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e2e8f0] hover:border-[#4a6789]/30 group">
                <div className={`${feature.color} text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-[#1a2b3d] mb-4 group-hover:text-[#4a6789] transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-[#718096] leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                  <svg className="w-5 h-5 text-[#4a6789]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-[#4a6789]/10 to-[#1a2b3d]/10 rounded-2xl p-8 border border-[#4a6789]/20">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a2b3d] mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-[#718096] mb-8 max-w-2xl mx-auto text-lg">
              Experience the difference of working with experienced legal professionals who prioritize your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#1a2b3d] text-white px-8 py-4 rounded-lg hover:bg-[#2c415e] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Schedule Free Consultation
              </button>
              <button className="border-2 border-[#4a6789] text-[#4a6789] px-8 py-4 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold">
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;