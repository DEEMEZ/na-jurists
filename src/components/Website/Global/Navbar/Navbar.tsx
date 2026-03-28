"use client";

// Logo now served from public directory
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Portal Vite app — sign-in at /login. See `.env.production` for deploy defaults. */
function portalSignInHref(): string {
  const configured = process.env.NEXT_PUBLIC_PORTAL_URL?.trim();
  if (configured && configured.length > 0) {
    return `${configured.replace(/\/$/, "")}/login`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin.replace(/\/$/, "")}/portal/login`;
  }
  // SSR: same-origin /portal when env is empty (matches committed `.env.production`).
  if (process.env.NODE_ENV === "production") {
    return "/portal/login";
  }
  return "http://localhost:5173/login";
}

const Navbar = () => {
  const portalLoginHref = portalSignInHref();
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

  const navLinkClass =
    "inline-flex h-10 items-center text-sm font-medium text-[#2c415e] transition-colors duration-300 hover:text-[#4a6789]";
  const portalBtnClass =
    "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#2c415e] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2b3d]";

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 py-2 shadow-md backdrop-blur-sm"
          : "bg-white py-3"
      }`}
    >
      <div className="container mx-auto flex min-h-[56px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/text-logo.png"
              alt="N&A Jurists - Advocates, Corporate & Legal Consultants"
              width={160}
              height={55}
              className={`h-auto transition-all duration-300 ${scrolled ? "w-[140px]" : "w-[160px]"}`}
              priority
            />
          </Link>
        </div>

        {/* Desktop: links + CTA — same row height, even gaps */}
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-5 lg:gap-6 md:flex">
          <Link href="/" className={navLinkClass}>
            Home
          </Link>
          <Link href="/about" className={navLinkClass}>
            About Us
          </Link>
          <Link href="/team" className={navLinkClass}>
            Our Team
          </Link>

          {/* Legal Resources Dropdown */}
          <div className="relative flex items-center">
            <button
              type="button"
              className={`${navLinkClass} gap-0.5`}
              onMouseEnter={() => setIsLegalResourcesOpen(true)}
              onMouseLeave={() => setIsLegalResourcesOpen(false)}
            >
              Legal Resources
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isLegalResourcesOpen ? "rotate-180" : ""}`}
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
                  href="/judgments"
                  className="block px-4 py-2 text-sm text-[#2c415e] hover:bg-gray-50 hover:text-[#4a6789] transition-colors duration-300"
                >
                  Reported Judgments
                </Link>
              </div>
            </div>
          </div>

          <Link href="/services" className={navLinkClass}>
            Our Services
          </Link>
          <Link href="/contact" className={navLinkClass}>
            Contact Us
          </Link>
          <a
            href={portalLoginHref}
            target="_blank"
            rel="noopener noreferrer"
            className={portalBtnClass}
          >
            Client portal
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center text-[#2c415e]"
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
                href="/judgments"
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
            <a
              href={portalLoginHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit rounded-md bg-[#2c415e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a2b3d]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Client portal
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;