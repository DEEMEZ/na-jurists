"use client";

// Logo now served from public directory
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLegalResourcesOpen, setIsLegalResourcesOpen] = useState(false);

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
              src="/text-logo.png"
              alt="N&A Jurists - Advocates, Corporate & Legal Consultants"
              width={160}
              height={55}
              className={`transition-all duration-300 ${scrolled ? 'w-[140px]' : 'w-[160px]'} h-auto`}
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
          
          {/* Legal Resources Dropdown */}
          <div className="relative group">
            <button
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300 flex items-center"
              onMouseEnter={() => setIsLegalResourcesOpen(true)}
              onMouseLeave={() => setIsLegalResourcesOpen(false)}
            >
              Legal Resources
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalResourcesOpen ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div 
              className={`absolute left-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                isLegalResourcesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              onMouseEnter={() => setIsLegalResourcesOpen(true)}
              onMouseLeave={() => setIsLegalResourcesOpen(false)}
            >
              <div className="py-1">
                <Link 
                  href="/cases" 
                  className="block px-4 py-2 text-sm text-[#2c415e] hover:bg-gray-50 hover:text-[#4a6789] transition-colors duration-300"
                >
                  Cases
                </Link>
                <Link 
                  href="/reported-judgments" 
                  className="block px-4 py-2 text-sm text-[#2c415e] hover:bg-gray-50 hover:text-[#4a6789] transition-colors duration-300"
                >
                  Reported Judgments
                </Link>
              </div>
            </div>
          </div>
          
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
              href="/team" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Team
            </Link>
            
            {/* Mobile Legal Resources Section */}
            <div className="border-l-2 border-[#2c415e] pl-4">
              <div className="text-[#2c415e] font-medium mb-2">Legal Resources</div>
              <Link 
                href="/cases" 
                className="block text-sm text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300 mb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cases
              </Link>
              <Link 
                href="/reported-judgments" 
                className="block text-sm text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reported Judgments
              </Link>
            </div>
            
            <Link 
              href="/services" 
              className="text-[#2c415e] hover:text-[#4a6789] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Services
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