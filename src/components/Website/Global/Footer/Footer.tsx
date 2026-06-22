"use client";

import { BrandLogo } from '@/components/Website/Global/BrandLogo';
import { FIRM_TAGLINE } from '@/constants/branding';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Linkedin,
  Shield
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Services', href: '/services' },
    { name: 'Our Team', href: '/team' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const legalServices = [
    { name: 'Corporate and Commercial', href: '/services/1' },
    { name: 'Taxation', href: '/services/2' },
    { name: 'Banking and Project Finance', href: '/services/3' },
    { name: 'Dispute Resolution', href: '/services/4' },
    { name: 'Alternative Dispute Resolution', href: '/services/5' },
    { name: 'Employment and Labour Laws', href: '/services/6' },
    { name: 'Intellectual Property', href: '/services/7' },
    { name: 'Corporate Crime and Anti-Money Laundering', href: '/services/8' },
    { name: 'Criminal Law', href: '/services/9' }
  ];

  const legalResources = [
    { name: 'Cases', href: '/cases' },
    { name: 'Judgments', href: '/judgments' },
   
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100077795273536&mibextid=wwXIfr&rdid=k9eLgUU5t6Y7H9u9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CkmVbxAr1%2F%3Fmibextid%3DwwXIfr%26ref%3D1#', icon: <Facebook className="w-5 h-5" /> },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/najurists/', icon: <Linkedin className="w-5 h-5" /> },
    { name: 'Instagram', href: 'https://www.instagram.com/najurists?igsh=aWJqdTJtYTRndm0y', icon: <FaInstagram className="w-5 h-5" /> }
  ];



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
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5a7a9b]/10 rounded-full blur-3xl translate-x-40 translate-y-40"></div>

      <div className="container mx-auto px-6 relative z-10">

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <BrandLogo inverted />
              </div>

              <p className="text-blue-200 leading-relaxed max-w-md mx-auto md:mx-0">
                Leading law firm providing comprehensive legal services with unwavering commitment to
                integrity, excellence, and client success. Trusted by businesses and individuals across Pakistan.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 flex flex-col items-center md:items-start">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 mt-1 text-[#4a6789] flex-shrink-0" />
                  <div className="space-y-3 text-sm text-blue-200 leading-relaxed">
                    <p>
                      <span className="font-semibold text-white/90">Islamabad: </span>
                      House No. 6-A, Street No. 12, Sector F-8/3, Islamabad, Pakistan
                    </p>
                    <p>
                      <span className="font-semibold text-white/90">Karachi: </span>
                      Mezzanine 1, Plot# 12 - C, Zamzama Commercial Lane 4, DHA Phase 5, Karachi
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#4a6789] flex-shrink-0" />
                  <a href="mailto:ishfaqnaqvi@hotmail.com" className="text-blue-200 hover:text-[#4a6789] transition-colors duration-300 text-sm">
                    ishfaqnaqvi@hotmail.com
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#4a6789] flex-shrink-0" />
                  <a href="tel:+92518430814" className="text-blue-200 hover:text-[#4a6789] transition-colors duration-300 text-sm">
                    051-8430814
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 justify-center md:justify-start">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-200 hover:text-white hover:bg-[#4a6789] transition-all duration-300 transform hover:-translate-y-1"
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
                Quick Links
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#4a6789] mt-2"></div>
              </h4>
              <ul className="space-y-3 flex flex-col items-center md:items-start">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-blue-200 hover:text-[#4a6789] transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Services */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
                Legal Services
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#4a6789] mt-2"></div>
              </h4>
              <ul className="space-y-3 flex flex-col items-center md:items-start">
                {legalServices.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-blue-200 hover:text-[#4a6789] transition-colors duration-300 text-sm"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Resources */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
                Legal Resources
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#4a6789] mt-2"></div>
              </h4>
              <ul className="space-y-3 flex flex-col items-center md:items-start">
                {legalResources.map((resource) => (
                  <li key={resource.name}>
                    <Link
                      href={resource.href}
                      className="text-blue-200 hover:text-[#4a6789] transition-colors duration-300 text-sm"
                    >
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
                {FIRM_TAGLINE}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-blue-200 text-sm">
                Powered by{' '}
                <a
                  href="https://www.mavroqit.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#4a6789] font-semibold transition-colors duration-300"
                >
                  Mavroq IT
                </a>
              </p>
            </div>
          </div>

          {/* Professional Badge */}
          <div className="text-center mt-8 pt-6 border-t border-white/5">
            <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
              <Shield className="w-4 h-4 text-[#4a6789]" />
              <span className="text-blue-200 text-sm font-medium">
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
