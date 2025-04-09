"use client";

import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const ContactCards = () => {
  const contactInfo = [
    {
      icon: <FaEnvelope className="text-3xl text-[#2c415e]" />,
      title: "Email Us",
      description: "Get in touch via email",
      value: "ishfaqnaqvi@hotmail.com",
      link: "mailto:ishfaqnaqvi@hotmail.com"
    },
    {
      icon: <FaPhoneAlt className="text-3xl text-[#2c415e]" />,
      title: "Call Us",
      description: "Speak with our team",
      value: "+92 333 2354476",
      link: "tel:+923332354476"
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-[#2c415e]" />,
      title: "Visit Us",
      description: "Our office location",
      value: "House No. 6-A, Street No. 12, Sector F-8/3, Islamabad",
      link: "https://goo.gl/maps/..."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {contactInfo.map((item, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold text-[#2c415e] mb-2">{item.title}</h3>
            <p className="text-[#666b6f] text-sm mb-3">{item.description}</p>
            <a 
              href={item.link} 
              className="text-[#4a6789] hover:text-[#2c415e] font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.value}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactCards;