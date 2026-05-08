"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contactMethods = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Call Us",
      description: "Speak with our legal experts",
      contact: "051-8430814",
      action: "tel:+92518430814"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Us",
      description: "Send us your legal inquiry",
      contact: "info@najurists.com",
      action: "mailto:info@najurists.com"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Visit Us",
      description: "Meet us at our office",
      contact: "Islamabad, Pakistan",
      action: "/contact"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Emergency legal assistance",
      contact: "Always Available",
      action: "tel:+92518430814"
    }
  ];

  const services = [
    "Corporate and Commercial",
    "Taxation",
    "Banking and Project Finance",
    "Dispute Resolution",
    "Alternative Dispute Resolution",
    "Employment and Labour Laws",
    "Intellectual Property",
    "Corporate Crime and Anti-Money Laundering",
    "Criminal Law",
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
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#5a7a9b]/10 rounded-full blur-xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block mb-4">
            <span className="bg-[#4a6789]/20 text-[#4a6789] px-4 py-2 rounded-full text-sm font-semibold">
              Get In Touch
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Discuss Your
            <span className="block text-[#4a6789]">Legal Needs?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
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
                        <div className="w-12 h-12 bg-[#4a6789] rounded-lg flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#4a6789] transition-colors duration-300">
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-[#4a6789] transition-colors duration-300">
                            {method.title}
                          </h4>
                          <p className="text-blue-200 text-sm">{method.description}</p>
                          <p className="text-[#4a6789] text-sm font-medium">{method.contact}</p>
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
                      <div className="w-2 h-2 bg-[#4a6789] rounded-full"></div>
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
                  <CheckCircle className="w-10 h-10 text-white" />
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
                      <span className="font-semibold text-[#4a6789]">FREE</span>
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
                    href="tel:+92518430814"
                    className="w-full border-2 border-[#4a6789] text-[#4a6789] px-8 py-4 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold inline-block text-center"
                  >
                    Call Now: 051-8430814
                  </Link>
                </div>

                <p className="text-xs text-[#718096]">
                  Available Monday - Saturday, 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactCTA;