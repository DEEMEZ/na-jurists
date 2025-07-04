import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Quote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import '../../app/globals.css';
import ServicesHeroImage from '../../assets/images/serviceshero.png';
import Footer from '../../components/Website/Global/Footer/Footer.tsx';
import Navbar from '../../components/Website/Global/Navbar/Navbar.tsx';
import { services } from '../../constants';
import Testimonials from '@/components/Website/HomePage/Testimonials'; // Add this import

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
    <div className="flex flex-col w-full">
      <Navbar />

{/* Hero Section */}
<section className="relative min-h-[80vh] flex items-center justify-center">

  <div className="absolute inset-0 z-0">
    <Image
      src={ServicesHeroImage}
      alt="Legal Services Hero Image"
      fill
      className="object-cover"
      priority
      quality={90}
    />
  </div>
  
  <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />  

  <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#2c415e]/90 to-transparent z-5"></div>
  <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#2c415e]/90 to-transparent z-5"></div>
  
  {/* Content */}
  <div className="max-w-5xl mx-auto relative z-10 px-6 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Comprehensive Legal Solutions
            <span className="block mt-4 text-2xl md:text-3xl font-light italic text-white/90">
              Tailored to Your Unique Needs
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Specializing in property, corporate, and family law with a proven track record across Pakistan.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/contact"
              className="bg-white text-background px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition inline-block border-2 border-white shadow-lg"
            >
              Get Free Consultation
            </Link>
            <Link
              href="#services"
              className="bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition inline-block border-2 border-white shadow-lg"
            >
              Explore Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-background">
              Our Legal Services
            </h2>
            <div className="h-1 w-24 bg-background mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto">
              We provide expert legal guidance across multiple practice areas, ensuring comprehensive solutions for all your legal needs.
            </p>
          </motion.div>

          {/* Service Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                className="bg-background rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <Link href={`/services/${service.id}`} className="flex flex-col h-full">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-white/10 mr-4">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                    </div>
                    <p className="text-gray-300 mb-6">{service.shortDescription}</p>
                  </div>
                  <div className="px-6 pb-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm font-medium text-blue-300 group-hover:text-blue-400 transition-colors">
                      <span>Learn more about this service</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-background">
              Why Clients Choose Us
            </h2>
            <div className="h-1 w-24 bg-background mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto">
              Our commitment to excellence sets us apart in the legal industry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Briefcase className="w-12 h-12 mb-4 text-background" />,
                title: "Specialized Expertise",
                description: "Our lawyers focus on specific practice areas, ensuring deep knowledge and experience in each field."
              },
              {
                icon: <ArrowRight className="w-12 h-12 mb-4 text-background" />,
                title: "End-to-End Solutions",
                description: "From initial consultation to final resolution, we manage every aspect of your legal matter."
              },
              {
                icon: <Quote className="w-12 h-12 mb-4 text-background" />,
                title: "Client-First Approach",
                description: "We prioritize your needs and goals, providing personalized attention and strategic advice."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
       <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-background bg-[url('https://i.imgur.com/pDwGPBz.jpeg')] bg-cover bg-center bg-no-repeat relative">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Discuss Your Legal Needs?
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Contact us today for a confidential consultation with one of our legal experts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              href="/contact"
              className="inline-block bg-white text-background px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Schedule Consultation
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}