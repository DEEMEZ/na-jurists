"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Services', href: '/services' },
    { name: 'Our Team', href: '/team' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const legalServices = [
    { name: 'Corporate Formation', href: '/services#corporate' },
    { name: 'Taxation', href: '/services#taxation' },
    { name: 'Banking & Finance', href: '/services#banking' },
    { name: 'Mergers & Acquisition', href: '/services#mergers' },
    { name: 'Constitutional Law', href: '/services#constitutional' }
  ];

  const legalResources = [
    { name: 'Cases', href: '/cases' },
    { name: 'Reported Judgments', href: '/reported-judgments' },
    { name: 'Legal Updates', href: '/legal-updates' },
    { name: 'Publications', href: '/publications' }
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-[#1a2b3d] via-[#2c415e] to-[#1a2b3d] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M50 50m-40 0a40 40 0 1 1 80 0a40 40 0 1 1 -80 0M25 25l50 50M75 25l-50 50\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '150px 150px',
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#4a6789]/10 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl translate-x-40 translate-y-40"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated with Legal Insights
            </h3>
            <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
              Get the latest legal updates, case studies, and expert insights delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-[#d4af37] text-[#1a2b3d] px-6 py-3 rounded-lg font-semibold hover:bg-[#e6c04a] transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Image
                  src="/text-logo.png"
                  alt="N&A Jurists - Advocates, Corporate & Legal Consultants"
                  width={200}
                  height={80}
                  className="brightness-0 invert opacity-90 max-w-[200px] h-auto"
                />
              </div>

              <p className="text-blue-200 leading-relaxed max-w-md">
                Leading law firm providing comprehensive legal services with unwavering commitment to
                integrity, excellence, and client success. Trusted by businesses and individuals across Pakistan.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 mt-1 text-[#d4af37] flex-shrink-0">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      House No. 6-A, Street No. 12,<br />
                      Sector F-8/3, Islamabad, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-[#d4af37] flex-shrink-0">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href="mailto:ishfaqnaqvi@hotmail.com" className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300 text-sm">
                    ishfaqnaqvi@hotmail.com
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-[#d4af37] flex-shrink-0">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href="tel:+923332354476" className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300 text-sm">
                    +92 333 235 4476
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-200 hover:text-white hover:bg-[#d4af37] transition-all duration-300 transform hover:-translate-y-1"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 relative">
                Quick Links
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#d4af37] mt-2"></div>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#4a6789] rounded-full mr-3 group-hover:bg-[#d4af37] transition-colors duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Services */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 relative">
                Legal Services
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#d4af37] mt-2"></div>
              </h4>
              <ul className="space-y-3">
                {legalServices.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#4a6789] rounded-full mr-3 group-hover:bg-[#d4af37] transition-colors duration-300"></span>
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Resources */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 relative">
                Legal Resources
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#d4af37] mt-2"></div>
              </h4>
              <ul className="space-y-3">
                {legalResources.map((resource) => (
                  <li key={resource.name}>
                    <Link
                      href={resource.href}
                      className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#4a6789] rounded-full mr-3 group-hover:bg-[#d4af37] transition-colors duration-300"></span>
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-blue-200 text-sm">
                © {currentYear} N&A Jurists. All rights reserved.
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Advocates, Corporate & Legal Consultants
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs">
              <Link href="/privacy-policy" className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="text-blue-200 hover:text-[#d4af37] transition-colors duration-300">
                Legal Disclaimer
              </Link>
            </div>
          </div>

          {/* Professional Badge */}
          <div className="text-center mt-8 pt-6 border-t border-white/5">
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <div className="w-3 h-3 bg-[#d4af37] rounded-full"></div>
              <span className="text-blue-200 text-xs font-medium">
                Licensed Advocates of the Supreme Court of Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;