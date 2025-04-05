import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/images/text-logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#384b61] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and brief info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="bg-white p-1 rounded mb-4">
              <Image 
                src={logo}
                alt="N&A Jurists Logo" 
                width={120} 
                height={40} 
                className="h-auto w-auto"
              />
            </div>
            <p className="text-sm text-white/80 text-center md:text-left">
              Advocates, Corporate & Legal Consultants providing exceptional legal services with integrity and excellence.
            </p>
          </div>
          
          {/* Contact info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-white">Contact Us</h3>
            <div className="space-y-2 text-sm text-white/80 text-center md:text-left">
              <p>House No. 6-A, Street No. 12, Sector F-8/3, Islamabad</p>
              <p>Email: ishfaqnaqvi@hotmail.com</p>
              <p>Phone: +92 333 2354476</p>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Link href="/privacy-policy" className="text-sm text-white/80 hover:text-white transition-colors duration-300">
                Our Services
              </Link>
              <span className="text-white/40">•</span>
              <Link href="/terms" className="text-sm text-white/80 hover:text-white transition-colors duration-300">
                Contact
              </Link>
              
              <span className="text-white/40">•</span>
              <Link href="/careers" className="text-sm text-white/80 hover:text-white transition-colors duration-300">
                Cases
              </Link>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/20 pt-4 text-center text-xs text-white/60">
          © {currentYear} N&A Jurists. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;