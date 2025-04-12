import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { services } from '../../constants';
import '../../app/globals.css';
import Navbar from '../../components/Website/Global/Navbar/Navbar.tsx';
import Footer from '../../components/Website/Global/Footer/Footer.tsx';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const listItem = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function ServiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const service = services.find(s => s.id === Number(id));

  if (!service) return <div>Service not found</div>;

  return (
    <div className='flex flex-col w-full'>
      <Navbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold text-background mb-4">
              {service.name}
            </h1>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" animate="visible">
            {service.headers.map((header, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="mb-16 last:mb-0 bg-blue-50 rounded-xl p-8"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={`${index % 2 === 0 ? 'order-1' : 'order-2'}`}>
                    <h2 className="text-2xl font-semibold mb-6 text-background">
                      {header.title}
                    </h2>
                    <motion.ul className="space-y-4">
                      {header.points.map((point, i) => (
                        <motion.li
                          key={i}
                          variants={listItem}
                          className="flex items-start text-gray-700"
                        >
                          <CheckCircle className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-blue-600" />
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                  <div className={`${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="rounded-xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={header.image}
                        alt={header.title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const paths = services.map((service) => ({
    params: { id: service.id.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps() {
  return { props: {} };
}
