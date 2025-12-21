"use client";

import React, { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";

// Import team member images
import muhammadAliHaider1 from "@/assets/images/DSC04954.jpg";
import muhammadAliHaider2 from "@/assets/images/DSC04960.jpg";
import ayeshaRiaz from "@/assets/images/DSC04908.jpg";
import hijabEZainab from "@/assets/images/RNI-Films-IMG-C2361EA5-BC20-4E6F-865C-C43291D1CB96.jpg";
import zainHyderMalik from "@/assets/images/DSC05038.jpeg";
import hinaAhmad from "@/assets/images/DSC04932.jpg";
import jowariaGariq from "@/assets/images/DSC04918.jpg";
import ahmedArshad from "@/assets/images/DSC04966.jpg";
import farhatJamil from "@/assets/images/DSC05000.jpg";
import ishfaqHussain1 from "@/assets/images/DSC05022.jpg";
import ishfaqHussain2 from "@/assets/images/DSC05025.jpg";
import ishfaqHussain3 from "@/assets/images/DSC05027.jpg";
import mujeebUrRehman from "@/assets/images/DSC05108.jpg";

// Team member type
type TeamMember = {
  id: number;
  name: string;
  title: string;
  image: StaticImageData | null;
  fullBio: string;
  delay: number;
};

// Founder data
const founder: TeamMember = {
  id: 0,
  name: "Syed Ishfaq Hussain Naqvi",
  title: "Founder & Managing Partner",
  image: ishfaqHussain1,
  fullBio: "Syed Ishfaq Hussain Naqvi, Advocate Supreme Court, is the Founder and Managing Partner of N&A Jurists. With over 25 years of distinguished legal practice, he has built a reputation for excellence in corporate law, taxation, and constitutional matters. His visionary leadership has established N&A Jurists as one of Pakistan's most respected law firms, known for delivering exceptional legal solutions to clients across diverse sectors.",
  delay: 0,
};

// Leadership team (excluding founder)
const leadership: TeamMember[] = [
  {
    id: 1,
    name: "Muhammad Ali Haider",
    title: "Associate Partner",
    image: muhammadAliHaider1,
    fullBio: "Mr. Muhammad Ali Haider, Advocate High Court, holds an LL.B. (Hons) from the University of London and his areas of expertise include constitutional law, tax litigation, service matters, and regulatory compliance. He has represented a diverse clientele, including individuals, corporate entities, and government bodies, before the High Courts and specialized tribunals. Renowned for his analytical rigor and structured legal reasoning, he offers effective and result-oriented legal solutions.",
    delay: 100,
  },
];

// Team members data (ordered by seniority)
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Muhammad Ali Haider",
    title: "Associate Partner",
    image: muhammadAliHaider1,
    fullBio: "Mr. Muhammad Ali Haider, Advocate High Court, holds an LL.B. (Hons) from the University of London and his areas of expertise include constitutional law, tax litigation, service matters, and regulatory compliance. He has represented a diverse clientele, including individuals, corporate entities, and government bodies, before the High Courts and specialized tribunals. Renowned for his analytical rigor and structured legal reasoning, he offers effective and result-oriented legal solutions.",
    delay: 100,
  },
  {
    id: 2,
    name: "Hijab E Zainab",
    title: "Associate",
    image: hijabEZainab,
    fullBio: "Ms. Hijab E Zainab is a law graduate from the University of London, specializing in corporate law, civil and family litigation, and regulatory compliance. With expertise in company incorporation, SECP matters, REITs regulation, and NBFCs, she provides both legal advisory and hands-on services related to corporate structuring, regulatory filings, and compliance with SECP frameworks. Known for her pragmatic and solution-oriented approach, she has extensive experience representing clients before courts and regulatory tribunals, delivering effective and tailored legal solutions.",
    delay: 150,
  },
  {
    id: 3,
    name: "Zain Hyder Malik",
    title: "Associate",
    image: zainHyderMalik,
    fullBio: "Mr. Zain Hyder Malik is a committed and skilled legal practitioner with an LLB degree and a strong foundation in both criminal and civil law. He has successfully represented clients in a broad spectrum of serious matters, including murder trials, narcotics offences, financial crimes, and other complex criminal proceedings. Zain has also secured favorable outcomes in numerous bail petitions. His unwavering dedication to justice and sharp courtroom advocacy have earned him the trust of clients and respect within the legal community.",
    delay: 200,
  },
  {
    id: 4,
    name: "Jabbar Khan",
    title: "Associate",
    image: null,
    fullBio: "With over thirteen years of experience in income and sales tax, including service at the Federal Board of Revenue (2010–2023), Mr. Jabbar, Advocate High Court, is highly skilled in income and sales tax, accounting and has represented clients in complex and high-profile matters before the appellate tax forums.",
    delay: 100,
  },
  {
    id: 5,
    name: "Hina Ahmed",
    title: "Associate",
    image: hinaAhmad,
    fullBio: "Ms. Hina Ahmed, Advocate High Court, has substantial experience in family law, civil litigation, and property law. She has represented a diverse clientele in complex legal matters before various courts and forums. Her practice is marked by a thorough understanding of procedural and substantive law. She provides clear, effective, and results-driven legal solutions.",
    delay: 150,
  },
  {
    id: 6,
    name: "Jowaria Tariq",
    title: "Associate",
    image: jowariaGariq,
    fullBio: "Ms. Jowaria Tariq is a law graduate from the University of London with expertise in corporate and commercial law, mergers and acquisitions, intellectual property, and arbitration and mediation services. She has experience in handling a broad range of corporate transactions, commercial litigation and regulatory work. She has advised and represented multinational companies and clients, bringing a practical, business-oriented approach to legal problem-solving.",
    delay: 200,
  },
  {
    id: 7,
    name: "Ayesha Riaz",
    title: "Associate",
    image: ayeshaRiaz,
    fullBio: "Ms. Ayesha Riaz is a law graduate of the University of London with a focused practice in criminal litigation. She has handled a wide range of criminal matters, including narcotics prosecutions, white-collar offences, and other intricate criminal trials. Known for her meticulous case preparation and assertive courtroom presence, she is widely regarded for her commitment to safeguarding legal rights and upholding the principles of justice.",
    delay: 100,
  },
  {
    id: 8,
    name: "Ahmad Arshad",
    title: "Intern",
    image: ahmedArshad,
    fullBio: "Mr. Ahmad is currently serving as an Intern at N&A Jurists, where he actively contributes to the preparation of well-researched legal documents for proceedings before the District and High Courts. He is a dedicated team member focused on supporting effective legal strategies and delivering quality assistance in client matters.",
    delay: 150,
  },
  {
    id: 9,
    name: "Farhat Jamil",
    title: "Office Manager",
    image: farhatJamil,
    fullBio: "Ms. Farhat Jamil serves as Office Manager at N&A Jurists, providing essential administrative support to ensure the smooth operation of the firm and efficient handling of client matters.",
    delay: 200,
  },
  {
    id: 10,
    name: "Mujeeb Ur Rehman",
    title: "Office Boy/Clerk",
    image: mujeebUrRehman,
    fullBio: "",
    delay: 100,
  },
];

const CloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-gray-600 hover:text-gray-800 transition-colors"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};

const OurTeam = () => {
  const [active, setActive] = useState<TeamMember | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle modal effects
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActive(null);
      }
    };

    if (active) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [active]);

  // Scroll reveal animation
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
        
        if (isVisible && !sectionRef.current.classList.contains('opacity-100')) {
          setIsVisible(true);
          sectionRef.current.classList.add('opacity-100');
          sectionRef.current.classList.remove('opacity-0', 'translate-y-10');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Modal Overlay and Content */}
      {active && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/30 z-[90] transition-opacity duration-300 ${
              active ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            {/* Modal Content */}
            <div
              ref={modalRef}
              className={`relative w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white sm:rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${
                active ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
            >
              {/* Close button inside modal */}
              <button
                className="absolute top-4 right-4 flex items-center justify-center bg-white rounded-full h-10 w-10 shadow-lg z-10 transition-all hover:scale-110 hover:bg-gray-50"
                onClick={() => setActive(null)}
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
              {/* Team Member Photo in Modal */}
              <div className="flex justify-center p-8 bg-gradient-to-br from-[#f0f4f8] to-[#d9e2ec]">
                <div className="relative w-40 h-40 overflow-hidden rounded-full shadow-lg border-4 border-white bg-gray-200 flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                  {active.image ? (
                    <Image
                      src={active.image}
                      alt={active.name}
                      fill
                      className="object-cover object-top scale-110"
                      style={{ objectPosition: '50% 20%' }}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2c415e] to-[#4a6789]"></div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#2c415e] mb-2">
                    {active.name}
                  </h3>
                  <p className="text-[#4a6789] font-medium text-lg">
                    {active.title}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="text-[#666b6f] text-sm leading-relaxed max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <p>{active.fullBio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Section */}
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
                  onClick={() => setActive(member)}
                  className={`bg-white rounded-lg p-6 border border-[#e5eaf4] shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[#a7c1d9] hover:-translate-y-1 group cursor-pointer transform ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: isVisible ? `${member.delay}ms` : '0ms'
                  }}
                >
                  {/* Team Member Photo */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-32 overflow-hidden rounded-full shadow-md border border-gray-100 bg-gray-200 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover object-top scale-110"
                          style={{ objectPosition: '50% 20%' }}
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-20 w-20 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2c415e] to-[#4a6789]"></div>
                    </div>
                  </div>

                  {/* Team Member Info */}
                  <h3 className="text-lg font-semibold text-[#2c415e] mb-1 text-center group-hover:text-[#1a2a3e] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-[#4a6789] font-medium mb-3 text-center">
                    {member.title}
                  </p>
                  
                  {/* Truncated Bio Preview */}
                  <div className="text-[#666b6f] text-sm text-center">
                    <p className="line-clamp-3">
                      {member.fullBio.length > 120 
                        ? `${member.fullBio.substring(0, 120)}...` 
                        : member.fullBio
                      }
                    </p>
                  </div>

                  {/* Click to expand indicator */}
                  <div className="text-center mt-3">
                    <span className="text-xs text-[#4a6789] opacity-70 group-hover:opacity-100 transition-opacity">
                      Click to read more
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OurTeam;