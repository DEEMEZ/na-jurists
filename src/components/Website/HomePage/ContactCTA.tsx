"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const ContactCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Call Us",
      description: "Speak with our legal experts",
      contact: "+92 51 123 4567",
      action: "tel:+925112345678"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Us",
      description: "Send us your legal inquiry",
      contact: "info@najurists.com",
      action: "mailto:info@najurists.com"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Visit Us",
      description: "Meet us at our office",
      contact: "Islamabad, Pakistan",
      action: "/contact"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "24/7 Support",
      description: "Emergency legal assistance",
      contact: "Always Available",
      action: "tel:+925112345678"
    }
  ];

  const services = [
    "Corporate Formation",
    "Legal Consultation",
    "Contract Drafting",
    "Litigation Support",
    "Tax Advisory",
    "Regulatory Compliance"
  ];

  return (
    <section ref={sectionRef} className="pt-10 pb-20 bg-gradient-to-br from-[#1a2b3d] via-[#2c415e] to-[#1a2b3d] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M50 50m-40 0a40 40 0 1 1 80 0a40 40 0 1 1 -80 0M50 10a5 5 0 1 1 0 10a5 5 0 1 1 0 -10M50 80a5 5 0 1 1 0 10a5 5 0 1 1 0 -10M10 50a5 5 0 1 1 10 0a5 5 0 1 1 -10 0M80 50a5 5 0 1 1 10 0a5 5 0 1 1 -10 0\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
          }}
          className="w-full h-full"
        />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#4a6789]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block mb-4">
            <span className="bg-[#d4af37]/20 text-[#d4af37] px-4 py-2 rounded-full text-sm font-semibold">
              Get In Touch
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Discuss Your
            <span className="block text-[#d4af37]">Legal Needs?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#d4af37] mx-auto mb-6"></div>
          <p className="text-blue-200 text-lg leading-relaxed max-w-3xl mx-auto">
            Take the first step towards resolving your legal matters. Our experienced team is ready to provide
            you with expert guidance and representation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Contact Methods */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contactMethods.map((method, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer"
                      onClick={() => {
                        if (method.action.startsWith('tel:') || method.action.startsWith('mailto:')) {
                          window.location.href = method.action;
                        } else {
                          window.location.href = method.action;
                        }
                      }}
                    >
                      <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                        <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center text-[#1a2b3d] group-hover:bg-white group-hover:text-[#1a2b3d] transition-colors duration-300">
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-[#d4af37] transition-colors duration-300">
                            {method.title}
                          </h4>
                          <p className="text-blue-200 text-sm">{method.description}</p>
                          <p className="text-[#d4af37] text-sm font-medium">{method.contact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="font-semibold text-white mb-4">Our Legal Services</h4>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                      <span className="text-blue-200 text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - CTA Card */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#1a2b3d] rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#1a2b3d] mb-2">
                    Free Initial Consultation
                  </h3>
                  <p className="text-[#718096] mb-6">
                    Discuss your legal requirements with our experts. No obligation, no hidden fees.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#f7fafc] to-[#edf2f7] rounded-xl p-6 border border-[#e2e8f0]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#718096]">Consultation Duration</span>
                      <span className="font-semibold text-[#1a2b3d]">30-45 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#718096]">Response Time</span>
                      <span className="font-semibold text-[#1a2b3d]">Within 24 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#718096]">Cost</span>
                      <span className="font-semibold text-[#d4af37]">FREE</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/contact"
                    className="w-full bg-[#1a2b3d] text-white px-8 py-4 rounded-lg hover:bg-[#2c415e] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block text-center"
                  >
                    Schedule Free Consultation
                  </Link>
                  <Link
                    href="tel:+925112345678"
                    className="w-full border-2 border-[#4a6789] text-[#4a6789] px-8 py-4 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold inline-block text-center"
                  >
                    Call Now: +92 51 123 4567
                  </Link>
                </div>

                <p className="text-xs text-[#718096]">
                  Available Monday - Saturday, 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4af37] mb-2">25+</div>
                <div className="text-blue-200 text-sm">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4af37] mb-2">500+</div>
                <div className="text-blue-200 text-sm">Cases Won</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4af37] mb-2">100+</div>
                <div className="text-blue-200 text-sm">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4af37] mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;