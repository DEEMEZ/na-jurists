export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ahmed Raza",
    role: "CEO, Textile Exporters Ltd.",
    content: "N&A Jurists expertly guided us through establishing our joint venture with a Chinese firm. Their knowledge of SECP regulations saved us 3 months of paperwork delays. Truly professional!",
    rating: 5,
    image: ""
  },
  {
    id: 2,
    name: "Farhana Sheikh",
    role: "CFO, Pharma Solutions Inc.",
    content: "We avoided ₨8.2M in penalties thanks to their FBR tax advisory. Their team understands Pakistan's complex tax landscape better than anyone.",
    rating: 5,
    image: ""
  },
  {
    id: 3,
    name: "Omar Farooq",
    role: "SVP, Meezan Bank",
    content: "Their forensic audit of our non-performing loans recovered ₨120M in 6 months. Exceptional compliance strategies for SBP regulations.",
    rating: 5,
    image: ""
  },
  {
    id: 4,
    name: "Ali Manufacturing",
    role: "Faisalabad",
    content: "Seamless acquisition of our competitor's assets worth ₨950M. Their due diligence uncovered liabilities we'd never have found ourselves.",
    rating: 5,
    image: ""
  },
  {
    id: 5,
    name: "Dr. Samina Khan",
    role: "Herbal Pharma (Peshawar)",
    content: "Protected our 12 herbal formulations through IPO Pakistan patents. Their IP team fights counterfeiters aggressively in Peshawar courts.",
    rating: 5,
    image: ""
  },
  {
    id: 6,
    name: "TechVenture Pakistan",
    role: "Rawalpindi",
    content: "Drafted bulletproof SaaS contracts and handled our data localization compliance with PTA. Saved us ₨15M in potential GDPR violations.",
    rating: 5,
    image: ""
  },
  {
    id: 7,
    name: "Miners Association",
    role: "Quetta",
    content: "Won our landmark case in Supreme Court protecting miners' rights under Article 9. Their constitutional experts are unmatched in Pakistan.",
    rating: 5,
    image: ""
  },
  {
    id: 8,
    name: "ChenOne Group HR",
    role: "Multan",
    content: "Reduced our labor disputes by 80% after they overhauled our employment contracts per Punjab Industrial Act amendments.",
    rating: 5,
    image: ""
  },
  {
    id: 9,
    name: "Goods Exporters Council",
    role: "Sialkot",
    content: "Resolved our ₨220M commercial dispute through arbitration in 45 days versus 3+ years in courts. Brilliant negotiators.",
    rating: 5,
    image: ""
  },
  {
    id: 10,
    name: "Sindh Insurance Co.",
    role: "Hyderabad",
    content: "Successfully defended 17 fraudulent claims worth ₨65M. Their forensic evidence presentation in court set new precedents for insurance fraud cases.",
    rating: 5,
    image: ""
  },
  {
    id: 11,
    name: "John Smith",
    role: "CEO, Tech Corporation",
    content: "N&A Jurists provided exceptional legal counsel during our merger process. Their expertise in corporate law saved us time and money while ensuring full compliance.",
    rating: 5,
    image: ""
  },
  {
    id: 12,
    name: "Sarah Johnson",
    role: "Director, Financial Services",
    content: "The team's knowledge of tax law is unparalleled. They helped us navigate complex regulations and saved our company from potential penalties.",
    rating: 5,
    image: ""
  }
];