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
      value: "051-8430814",
      link: "tel:+92518430814"
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-[#2c415e]" />,
      title: "Islamabad Office",
      description: "Visit our Islamabad office",
      value: "House No. 6-A, Street No. 12, Sector F-8/3, Islamabad",
      link: "https://goo.gl/maps/..."
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-[#2c415e]" />,
      title: "Karachi Office",
      description: "Visit our Karachi office",
      value: "Mezzanine 1, Plot# 12 - C, Zamzama Commercial Lane 4, DHA Phase 5, Karachi",
      link: "https://www.google.com/maps/search/?api=1&query=Zamzama+Commercial+Lane+4+DHA+Phase+5+Karachi"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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