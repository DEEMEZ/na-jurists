"use client";

import teamMember1 from '@/assets/images/Member1.jpeg';
import teamMember2 from '@/assets/images/Member2.jpeg';
import teamMember3 from '@/assets/images/Member3.jpeg';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

// Team members data with images
const teamMembers = [
  {
    id: 1,
    name: "Syed Ishfaq Hussain Naqvi",
    title: "Managing Partner | Advocate Supreme Court",
    bio: "Mr. Naqvi is the founding father of N&A Jurists and a renowned corporate lawyer with expertise in corporate, taxation, and energy sectors.",
    image: teamMember1,
    delay: 100,
  },
  {
    id: 2,
    name: "Hassan Rasheed Siddique",
    title: "Senior Lawyer | Advocate High Court",
    bio: "He Specialized in International commercial law from University of Bedfordshire, London. He is also an alumni of international academy of leadership, FNST Gumersbach Germany and member of constitutional amendment committee Liberal Youth South Asia, Nepal. He is a Columnist/ senior analyst and an author.",
    image: teamMember2,
    delay: 150,
  },
  {
    id: 3,
    name: "SADAF NOMAN",
    title: "Senior Lawyer | Advocate High Court",
    bio: "Miss Sadaf Noman holds the professional degree of LLB from Islamic University, She has 6 years of experience in the field of criminal, civil, family and corporate law in the lower judiciary. She has special skills to file the income tax as well as sales tax returns of businesses and individuals. She is associated with NA Jurists since 2021.",
    image: teamMember3,
    delay: 200,
  },
];

const OurTeam = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Scroll reveal animation
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
        
        if (isVisible) {
          sectionRef.current.classList.add('opacity-100');
          sectionRef.current.classList.remove('opacity-0', 'translate-y-10');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="our-team" className="relative py-16">
      {/* Background pattern */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div
          ref={sectionRef}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 transition-all duration-1000 transform opacity-0 translate-y-10"
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2c415e] mb-4">Our Team</h2>
            <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
            <p className="text-[#666b6f] mt-4 max-w-3xl mx-auto">
              Meet the dedicated professionals at N&A Jurists, committed to delivering exceptional legal expertise with integrity.
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg p-6 border border-[#e5eaf4] shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[#a7c1d9] hover:-translate-y-1 group"
                style={{ transitionDelay: `${member.delay}ms` }}
              >
                {/* Team Member Image */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 overflow-hidden rounded-full shadow-md border border-gray-100">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      priority // Add priority for faster loading
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2c415e] to-[#4a6789]"></div>
                  </div>
                </div>

                {/* Team Member Info */}
                <h3 className="text-lg font-semibold text-[#2c415e] mb-1 text-center group-hover:text-[#1a2a3e]">
                  {member.name}
                </h3>
                <p className="text-[#4a6789] font-medium mb-3 text-center">{member.title}</p>
                <p className="text-[#666b6f] text-sm text-center">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;