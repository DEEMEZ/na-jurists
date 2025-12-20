"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Award,
  Scale,
  Building2,
  ThumbsUp,
  Trophy,
  Users
} from 'lucide-react';

const Statistics = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    experience: 0,
    cases: 0,
    clients: 0,
    satisfaction: 0,
    awards: 0,
    team: 0
  });
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const achievements = [
    {
      value: 1500,
      suffix: "+",
      label: "Cases Handled",
      description: "Successfully resolved cases across all practice areas",
      icon: <Award className="w-12 h-12" />,
      color: "from-[#1a2b3d] to-[#2c415e]"
    },
    {
      value: 500,
      suffix: "+",
      label: "Successful Cases",
      description: "Favorable outcomes across all practice areas",
      icon: <Scale className="w-12 h-12" />,
      color: "from-[#4a6789] to-[#5a7a9b]"
    },
    {
      value: 100,
      suffix: "+",
      label: "Corporate Clients",
      description: "Trusted by leading businesses and organizations",
      icon: <Building2 className="w-12 h-12" />,
      color: "from-[#5a7a9b] to-[#6a8aab]"
    },
    {
      value: 99,
      suffix: "%",
      label: "Client Satisfaction",
      description: "Consistent delivery of exceptional legal services",
      icon: <ThumbsUp className="w-12 h-12" />,
      color: "from-[#2c415e] to-[#3d526f]"
    },
    {
      value: 15,
      suffix: "+",
      label: "Legal Awards",
      description: "Recognition for outstanding legal practice",
      icon: <Trophy className="w-12 h-12" />,
      color: "from-[#1a2b3d] to-[#4a6789]"
    },
    {
      value: 12,
      suffix: "+",
      label: "Expert Advocates",
      description: "Highly qualified legal professionals",
      icon: <Users className="w-12 h-12" />,
      color: "from-[#4a6789] to-[#5a7a9b]"
    }
  ];

  const milestones = [
    {
      year: "1998",
      title: "Firm Established",
      description: "N&A Jurists founded with a vision to provide exceptional legal services"
    },
    {
      year: "2005",
      title: "Supreme Court Recognition",
      description: "Senior partners qualified as Supreme Court advocates"
    },
    {
      year: "2010",
      title: "Corporate Expansion",
      description: "Expanded services to include comprehensive corporate law practice"
    },
    {
      year: "2015",
      title: "International Recognition",
      description: "Received international awards for legal excellence"
    },
    {
      year: "2020",
      title: "Digital Innovation",
      description: "Implemented cutting-edge legal technology solutions"
    },
    {
      year: "2023",
      title: "Market Leadership",
      description: "Recognized as a leading law firm in Pakistan"
    }
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
    const duration = 2500;
    const steps = 75;
    const stepDuration = duration / steps;

    achievements.forEach((achievement, index) => {
      let currentValue = 0;
      const increment = achievement.value / steps;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= achievement.value) {
          currentValue = achievement.value;
          clearInterval(timer);
        }

        const key = index === 0 ? 'experience' :
                   index === 1 ? 'cases' :
                   index === 2 ? 'clients' :
                   index === 3 ? 'satisfaction' :
                   index === 4 ? 'awards' : 'team';

        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(currentValue)
        }));
      }, stepDuration);
    });
  };

  return (
    <section ref={sectionRef} className="py-12 md:pt-20 md:pb-10 bg-gradient-to-br from-[#f7fafc] via-white to-[#edf2f7] relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M50 50m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0M0 0m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0M100 0m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0M0 100m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0M100 100m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-8 md:mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block mb-4">
            <span className="bg-[#1a2b3d]/10 text-[#1a2b3d] px-4 py-2 rounded-full text-sm font-semibold">
              Our Achievements
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a2b3d] mb-6">
            Proven Track Record of
            <span className="block text-[#4a6789]">Legal Excellence</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
          <p className="text-[#718096] text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-4">
            Our commitment to excellence has earned us recognition and the trust of clients across various industries.
            These numbers reflect our dedication to delivering outstanding legal outcomes.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#e2e8f0] hover:border-[#4a6789]/30 group relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative z-10 text-center">
                  <div className="text-[#4a6789] mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    {achievement.icon}
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-2">
                      {index === 0 ? counters.experience :
                       index === 1 ? counters.cases :
                       index === 2 ? counters.clients :
                       index === 3 ? counters.satisfaction :
                       index === 4 ? counters.awards :
                       counters.team}{achievement.suffix}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#4a6789] mb-2">
                      {achievement.label}
                    </h3>
                  </div>

                  <p className="text-[#718096] text-sm leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Statistics;