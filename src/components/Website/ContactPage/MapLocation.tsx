// src/components/Website/ContactPage/MapLocation.tsx
"use client";

const MapLocation = () => {
  const locations = [
    {
      city: "Islamabad",
      title: "N&A Jurists Law Firm — Islamabad",
      embedSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3319.611042477201!2d73.04192202818993!3d33.71392125890018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfb5e20b57d3%3A0xdc85f76112b24b3e!2sNAJURISTS%20Law%20Firm!5e0!3m2!1sen!2s!4v1744232002291!5m2!1sen!2s&z=15",
    },
    {
      city: "Karachi",
      title: "N&A Jurists Law Firm — Karachi",
      embedSrc:
        "https://www.google.com/maps?q=Mezzanine+1,+Plot+12-C,+Zamzama+Commercial+Lane+4,+DHA+Phase+5,+Karachi&output=embed",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {locations.map((location) => (
        <div key={location.city} className="w-full h-full rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="px-4 py-3 bg-[#2c415e] text-white font-semibold">{location.city} Office</div>
          <iframe
            src={location.embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-[340px]"
            title={location.title}
          />
        </div>
      ))}
    </div>
  );
};

export default MapLocation;