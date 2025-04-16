import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, ArrowRight, Quote } from 'lucide-react';
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
    <div className="flex flex-col w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-100 py-24 px-6 text-center relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.h1
            className="text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Legal Solutions, Tailored for You
          </motion.h1>
          <motion.p
            className="text-lg text-white mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We specialize in property, corporate, and family law. Trusted by hundreds across Pakistan.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/contact"
              className="bg-background text-white px-6 py-3 rounded-xl text-lg font-medium hover:bg-gray-800 transition"
            >
              Get In Touch
            </Link>
          </motion.div>
        </div>

        {/* Image for the Hero Section */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <img
            src="https://i.imgur.com/CfTs8Ca.jpeg"
            alt="Hero Image"
            className="object-cover w-full h-full opacity-85 "
          />
        </div>
      </section>

      {/* Services Section */}
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-background text-center">
            Our Services
          </h1>
          <div className="my-12 text-center">
            <p className="text-lg text-gray-700">
              At our law firm, we specialize in a wide range of legal services tailored to meet the diverse needs of our clients. Our Property Law experts provide comprehensive assistance with buying, selling, and leasing property, as well as resolving disputes and ensuring all transactions comply with the law. In Corporate Law, we guide businesses through complex processes, including mergers, acquisitions, corporate governance, and regulatory compliance, helping companies thrive in a competitive environment. For those facing challenges in personal relationships, our Family Law services offer compassionate support in matters such as divorce, child custody, inheritance, and domestic issues. We are committed to offering expert legal guidance, tailored solutions, and exceptional client service across these key areas of law, ensuring peace of mind and successful outcomes.
            </p>
          </div>


          {/* Service Cards */}
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
                className="bg-background rounded-xl shadow-xl p-6 text-white h-full flex flex-col justify-between transform transition-all hover:scale-105"
              >
                <Link
                  href={`/services/${service.id}`}
                  className="flex flex-col h-full"
                >
                  <div className="flex-grow">
                    <Briefcase className="w-8 h-8 mb-4" />
                    <h2 className="text-2xl font-semibold mb-4">{service.name}</h2>
                    <p className="text-sm text-gray-300">{service.shortDescription}</p> {/* Added short description */}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm font-medium text-blue-400 hover:text-blue-600">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="bg-gray-100 py-24 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-background">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <Briefcase className="w-12 h-12 mb-4 text-background" />
              <h3 className="text-xl font-semibold text-gray-800">Expert Lawyers</h3>
              <p className="text-lg text-gray-600 mt-4">
                Our team consists of experienced lawyers who are experts in their fields.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="w-12 h-12 mb-4 text-background" />
              <h3 className="text-xl font-semibold text-gray-800">Comprehensive Solutions</h3>
              <p className="text-lg text-gray-600 mt-4">
                We offer end-to-end legal services, from consultations to settlements.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Quote className="w-12 h-12 mb-4 text-background" />
              <h3 className="text-xl font-semibold text-gray-800">Client-Centered Approach</h3>
              <p className="text-lg text-gray-600 mt-4">
                Your needs and satisfaction are our priority. We provide tailored advice and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
<section
  className="bg-background bg-[url('https://i.imgur.com/pDwGPBz.jpeg')] bg-cover bg-center bg-no-repeat py-24 px-6 text-center relative"
>
  <div className="bg-black/60 absolute inset-0 z-0" />
  <div className="max-w-4xl mx-auto text-center relative z-10">
    <motion.h2
      className="text-4xl font-bold text-white mb-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      Ready to Get Started?
    </motion.h2>
    <motion.p
      className="text-lg text-white mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      Let’s discuss how we can help with your legal needs. Reach out to us today!
    </motion.p>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Link
        href="/contact"
        className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 hover:text-white transition"
      >
        Contact Us
      </Link>
    </motion.div>
  </div>
</section>


      {/* Testimonials Section */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-900">Client Testimonials</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[{
              quote: "I was falsely accused in a land dispute case. Their team fought it with integrity and I was cleared within weeks.",
              name: "Ahmed R.",
              caseType: "Land Dispute – Lahore"
            }, {
              quote: "Got expert advice for my startup’s registration and contracts. Extremely cooperative and knowledgeable lawyers.",
              name: "Fatima S.",
              caseType: "Business Legal Advisory – Islamabad"
            }, {
              quote: "They handled my father's inheritance case with dignity and transparency. Everything was settled smoothly.",
              name: "Imran Q.",
              caseType: "Family Inheritance – Karachi"
            }, {
              quote: "I was amazed by how efficiently they managed my property documentation. Zero hassle.",
              name: "Zainab M.",
              caseType: "Property Verification – Rawalpindi"
            }, {
              quote: "After years of delay, my employment rights case finally got the attention it deserved. Got justice!",
              name: "Muhammad A.",
              caseType: "Employment Rights – Faisalabad"
            }, {
              quote: "The most honest legal team I’ve ever worked with. Guided me clearly during my divorce proceedings.",
              name: "Rabia T.",
              caseType: "Family Law – Multan"
            }].map((t, i) => (
              <motion.div
                key={i}
                className="bg-white shadow-xl rounded-2xl p-6 relative text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Quote className="w-6 h-6 text-gray-300 absolute top-4 left-4" />
                <p className="text-lg text-gray-700 font-medium mb-4 mt-2 leading-relaxed">"{t.quote}"</p>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500 italic">{t.caseType}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
