"use client";

import Member1 from '@/assets/images/Member1.jpeg';
import Image from 'next/image';
import { motion } from 'framer-motion';

const TeamLeadership = () => {
  return (
    <section className="relative py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[#2c415e] mb-4">Leadership</h2>
          <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
        </motion.div>
        
        <div className="bg-[#f0f3f6] rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-80 lg:h-full">
              <Image
                src={Member1}
                alt="Syed Ishfaq Hussain Naqvi - Managing Partner"
                fill
                className="object-cover"
                quality={90}
              />
            </div>
            
            <div className="p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-[#2c415e] mb-2">SYED ISHFAQ HUSSAIN NAQVI</h3>
                <p className="text-[#4a6789] font-medium mb-6">Managing Partner | Advocate Supreme Court</p>
                
                <div className="space-y-4 text-[#666b6f]">
                  <p>
                    Mr. Naqvi is the founding father of N&A Jurists and a renowned corporate lawyer. 
                    An energetic, commercially minded and self-motivated individual from a proven business 
                    law background with significant expertise in delivering commercial solutions.
                  </p>
                  <p>
                    He has been the legal advisor and in-house attorney of several domestic and international 
                    corporate entities including Securities & Exchange Commission of Pakistan (SECP) and Federal 
                    Board of Revenue.
                  </p>
                  <p>
                    Mr. Naqvi's areas of specialty include Corporate Law, Taxation, Energy and Power Sector, 
                    and he also possesses ample experience in dealing with company/corporate matters including 
                    finance and banking.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamLeadership;