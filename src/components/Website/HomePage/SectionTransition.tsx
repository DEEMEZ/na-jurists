"use client";

const SectionTransition = () => {
  return (
    <div className="relative h-20 bg-gradient-to-b from-[#1a2b3d] to-white">
      {/* Subtle decorative pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.6\'%3E%3Cpath d=\'M20 20h20v20H20V20zM0 0h20v20H0V0z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle gold accent line */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
    </div>
  );
};

export default SectionTransition;