"use client";

import { motion } from 'framer-motion';

const TeamIntro = () => {
  return (
    <section className="relative py-16 bg-[#f0f3f6]">
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%232c415e\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#2c415e] mb-4">Our Legal Team</h2>
            <div className="h-1 w-24 bg-[#2c415e] mx-auto"></div>
          </div>
          
          <div className="max-w-3xl mx-auto text-[#666b6f] text-center">
            <p className="mb-4">
              At N&A Jurists, our strength lies in our team of dedicated legal professionals who bring diverse expertise,
              unwavering commitment, and a client-first approach to every case.
            </p>
            <p className="mb-4">
              Each member of our team is carefully selected for their specialized knowledge, track record of success,
              and dedication to upholding the highest ethical standards in legal practice.
            </p>
            <p>
              Together, we combine decades of experience with innovative legal strategies to deliver exceptional results
              for our clients across Pakistan.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamIntro;