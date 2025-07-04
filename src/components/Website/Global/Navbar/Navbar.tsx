"use client";

import logo from '@/assets/images/text-logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-2' : 'bg-white py-3'
    }`}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src={logo}
              alt="N&A Jurists Logo" 
              width={150} 
              height={50} 
              className={`mr-4 transition-all duration-300 ${scrolled ? 'w-[130px]' : 'w-[150px]'}`}
              priority
            />
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden space-x-6 md:flex">
          <Link href="/" className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300">
            Home
          </Link>
          <Link href="/about" className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300">
            About Us
          </Link>
          <Link href="/team" className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300">
            Our Team
          </Link>
          <Link href="/cases" className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300">
            Cases
          </Link>
          <Link href="/services" className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300">
            Our Services
          </Link>
          <Link href="/contact" className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300">
            Contact Us
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#2c415e]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="container mx-auto mt-2 rounded-lg bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col space-y-3">
            <Link 
              href="/" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/cases" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cases
            </Link>
            <Link 
              href="/services" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/contact" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
