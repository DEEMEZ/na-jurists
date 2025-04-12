import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';
import { services } from '../../constants';
import '../../app/globals.css';
import Navbar from '../../components/Website/Global/Navbar/Navbar.tsx';
import Footer from '../../components/Website/Global/Footer/Footer.tsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ServicesPage() {
  return (
    <div className='flex flex-col w-full'>
      <Navbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-background text-center">
            Our Services
          </h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-background rounded-xl shadow-xl p-6 text-white"
              >
                <Briefcase className="w-8 h-8 mb-4" />
                <h2 className="text-2xl font-semibold mb-4">
                  {service.name}
                </h2>
                <Link
                  href={`/services/${service.id}`}
                  className="inline-flex items-center hover:text-blue-100 transition-colors"
                >
                  View Details
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
