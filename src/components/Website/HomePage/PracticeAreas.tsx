"use client";

import Link from 'next/link';
import {
  Building2,
  Calculator,
  Briefcase,
  Landmark,
  Scale,
  MessageSquare,
  Users,
  Copyright,
  ShieldAlert,
  Gavel
} from 'lucide-react';

const Icon = ({ name }: { name: string }) => {
  const className = "text-[#1a2b3d]";
  const icons = {
    corporate: <Building2 size={36} strokeWidth={2} className={className} />,
    taxation: <Calculator size={36} strokeWidth={2} className={className} />,
    commercial: <Briefcase size={36} strokeWidth={2} className={className} />,
    banking: <Landmark size={36} strokeWidth={2} className={className} />,
    dispute: <Scale size={36} strokeWidth={2} className={className} />,
    adr: <MessageSquare size={36} strokeWidth={2} className={className} />,
    employment: <Users size={36} strokeWidth={2} className={className} />,
    ip: <Copyright size={36} strokeWidth={2} className={className} />,
    corporateCrimeAml: <ShieldAlert size={36} strokeWidth={2} className={className} />,
    criminalLaw: <Gavel size={36} strokeWidth={2} className={className} />,
  };

  return (
    <div className="flex justify-center mb-4">
      {icons[name as keyof typeof icons] || <Building2 size={36} strokeWidth={2} className={className} />}
    </div>
  );
};

const PracticeAreas = () => {
  const practiceAreas: {
    icon: string;
    title: string;
    description: string;
    serviceId: number;
  }[] = [
    {
      icon: 'commercial',
      title: 'Corporate and Commercial',
      description:
        'Incorporation, governance, M&A support, commercial contracts, procurement, and corporate dispute resolution.',
      serviceId: 1,
    },
    {
      icon: 'taxation',
      title: 'Taxation',
      description:
        'From tax advisory and planning to litigation before tribunals and superior courts, including AML and Benami compliance.',
      serviceId: 2,
    },
    {
      icon: 'banking',
      title: 'Banking and Project Finance',
      description:
        'Financing documentation, inter-creditor arrangements, security due diligence, and charge registration for banks and developers.',
      serviceId: 3,
    },
    {
      icon: 'dispute',
      title: 'Dispute Resolution',
      description:
        'Civil and regulatory litigation, company jurisdiction, tax appeals, and international arbitration representation.',
      serviceId: 4,
    },
    {
      icon: 'adr',
      title: 'Alternative Dispute Resolution',
      description:
        'Domestic and international arbitration under the Arbitration Act, 1940, and ADR under tax, company, and insurance laws.',
      serviceId: 5,
    },
    {
      icon: 'employment',
      title: 'Employment and Labour Laws',
      description:
        'Employment policies, contracts for foreign nationals, disciplinary rules, union matters, and tribunal representation.',
      serviceId: 6,
    },
    {
      icon: 'ip',
      title: 'Intellectual Property',
      description:
        'IP ownership and disclosure compliance, disputes and appeals, trade mark and patent-related advice.',
      serviceId: 7,
    },
    {
      icon: 'corporateCrimeAml',
      title: 'Corporate Crime and Anti-Money Laundering',
      description:
        'Corporate crime advisory and litigation, AML/CFT compliance, internal investigations, and regulatory enforcement.',
      serviceId: 8,
    },
    {
      icon: 'criminalLaw',
      title: 'Criminal Law',
      description:
        'Trials and bail, narcotics and serious offences, white-collar crime, and criminal appeals before higher courts.',
      serviceId: 9,
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#eef2f7] to-[#e2e8f0] py-16 md:py-24">
      <div
        className="absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%231a2b3d\' fill-opacity=\'0.12\'%3E%3Cpath d=\'M25 25h50v50H25V25zM0 0h20v20H0V0zM80 0h20v20H80V0zM0 80h20v20H0V80zM80 80h20v20H80V80z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '120px 120px',
        }}
      />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-12 flex flex-col items-center text-center md:mb-16">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center justify-center rounded-full bg-[#1a2b3d]/10 px-4 py-2 text-center text-sm font-semibold text-[#1a2b3d]">
              Our Expertise
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b3d] mb-6">
            Legal Services We
            <span className="block text-[#4a6789]">Provide</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#4a6789] to-[#5a7a9b] mx-auto mb-6"></div>
          <p className="text-[#334155] text-lg leading-relaxed max-w-3xl mx-auto font-medium">
            Comprehensive legal solutions delivered by experienced advocates committed to your success.
            Our specialized expertise spans across multiple practice areas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {practiceAreas.map((area) => (
            <Link
              key={area.serviceId}
              href={`/services/${area.serviceId}`}
              className="rounded-xl p-6 border-2 border-[#94a3b8] bg-white shadow-[0_6px_20px_-6px_rgba(15,23,42,0.28)] hover:shadow-[0_14px_32px_-10px_rgba(15,23,42,0.35)] hover:border-[#2c415e] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden block no-underline text-[#0f172a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c415e] focus-visible:ring-offset-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b3d]/[0.06] to-[#4a6789]/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10">
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  <Icon name={area.icon} />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-3 text-center group-hover:text-[#1a2b3d] transition-colors duration-300">
                  {area.title}
                </h3>
                <p className="text-[#1e293b] text-sm leading-relaxed text-center font-semibold">
                  {area.description}
                </p>
                <div className="flex justify-center items-center gap-1.5 mt-4 text-[#1a2b3d] text-sm font-bold">
                  <span>View service</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#cbd5e1] mt-16 md:mt-24">
        <div className="container mx-auto px-6">
          <div className="text-center bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_-12px_rgba(26,43,61,0.25)] border-2 border-[#e2e8f0] max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#1a2b3d] mb-4">
              Need Legal Assistance?
            </h3>
            <p className="text-[#334155] text-base md:text-lg mb-6 max-w-2xl mx-auto leading-relaxed font-medium">
              Our experienced legal team is ready to provide you with expert guidance and representation.
              Contact us today for a consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-[#1a2b3d] text-white px-8 py-3 rounded-lg hover:bg-[#2c415e] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View All Services
              </Link>
              <Link
                href="/contact"
                className="border-2 border-[#4a6789] text-[#4a6789] px-8 py-3 rounded-lg hover:bg-[#4a6789] hover:text-white transition-all duration-300 font-semibold"
              >
                Get Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeAreas;
