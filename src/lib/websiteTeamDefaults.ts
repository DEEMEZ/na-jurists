/**
 * Shared defaults for the marketing site team (Leadership spotlight + Our Team grid).
 * Keep image_key values in sync with `src/components/Website/OurTeam/teamImageMap.ts`.
 */

export type WebsiteTeamSection = "founder" | "member";

/** Keys mapped to bundled Next/Image assets (see teamImageMap). Use null for no photo. */
export const WEBSITE_TEAM_IMAGE_KEYS: string[] = [
  "dsc04954",
  "dsc04960",
  "dsc04908",
  "rni_films_img_c2361ea5",
  "dsc05038",
  "dsc04932",
  "dsc04918",
  "dsc04966",
  "dsc05000",
  "dsc05022",
  "dsc05025",
  "dsc05027",
  "dsc05108",
  "jabbar",
];

export type WebsiteTeamPublicFounder = {
  id: string | null;
  name: string;
  title: string;
  /** Paragraphs joined with blank lines for display split */
  bio: string;
  imageKey: string | null;
  /** Public Supabase Storage URL when `photo_storage_path` is set in DB */
  photoUrl: string | null;
};

export type WebsiteTeamPublicMember = {
  id: string;
  sortOrder: number;
  name: string;
  title: string;
  bio: string;
  imageKey: string | null;
  photoUrl: string | null;
  delayMs: number;
};

export type WebsiteTeamPublicPayload = {
  founder: WebsiteTeamPublicFounder;
  members: WebsiteTeamPublicMember[];
  source: "default" | "database";
};

export type WebsiteTeamSeedRow = {
  section: WebsiteTeamSection;
  sort_order: number;
  name: string;
  title: string;
  bio: string;
  image_key: string | null;
  photo_storage_path?: string | null;
  delay_ms: number;
};

const FOUNDER_BIO = [
  "Syed Ishfaq Hussain Shah is the founding and managing partner of N & A Jurists and an Advocate of the Supreme Court of Pakistan, with an established practice spanning taxation, corporate, civil, banking, and commercial litigation.",
  "With experience in over 5,000 matters before the Supreme Court, High Courts, and specialized tribunals, he is particularly regarded for his work in complex tax litigation, including income tax, sales tax, customs, and constitutional tax disputes. His practice also extends to banking and finance matters, commercial suits, and high-stakes contractual disputes.",
  "Mr. Shah has represented a diverse clientele, including major corporate entities and public sector institutions. His experience includes acting for and advising organizations such as Eastern Testing Services, Serene Air, Attock Refinery, Mari Petroleum, Bank Makarmah Limited, Kohat Textile Mills, Saif Energy, Watim Medical College, and Askari Insurance, as well as regulatory and government bodies including the FBR, SECP, FIA, and NHA.",
  "In addition to litigation, he regularly advises on corporate structuring, mergers and acquisitions, regulatory compliance, banking and finance transactions, and cross-border commercial arrangements, including free zone operations in Dubai. His practice is defined by a dual focus on rigorous advocacy and commercially pragmatic legal strategy.",
].join("\n\n");

/** Built-in snapshot used when `website_team_members` has no rows. */
export const DEFAULT_WEBSITE_TEAM: WebsiteTeamPublicPayload = {
  founder: {
    id: null,
    name: "Syed Ishfaq Hussain Shah",
    title: "Founding & Managing Partner | Advocate Supreme Court",
    bio: FOUNDER_BIO,
    imageKey: "dsc05025",
    photoUrl: null,
  },
  members: [
    {
      id: "default-1",
      sortOrder: 10,
      name: "Muhammad Ali Haider",
      title: "Associate Partner",
      bio: "Mr. Muhammad Ali Haider, Advocate High Court, holds an LL.B. (Hons) from the University of London and his areas of expertise include constitutional law, tax litigation, service matters, and regulatory compliance. He has represented a diverse clientele, including individuals, corporate entities, and government bodies, before the High Courts and specialized tribunals. Renowned for his analytical rigor and structured legal reasoning, he offers effective and result-oriented legal solutions.",
      imageKey: "dsc04954",
      photoUrl: null,
      delayMs: 100,
    },
    {
      id: "default-2",
      sortOrder: 20,
      name: "Hijab E Zainab",
      title: "Associate",
      bio: "Ms. Hijab E Zainab is a law graduate from the University of London, specializing in corporate law, civil and family litigation, and regulatory compliance. With expertise in company incorporation, SECP matters, REITs regulation, and NBFCs, she provides both legal advisory and hands-on services related to corporate structuring, regulatory filings, and compliance with SECP frameworks. Known for her pragmatic and solution-oriented approach, she has extensive experience representing clients before courts and regulatory tribunals, delivering effective and tailored legal solutions.",
      imageKey: "rni_films_img_c2361ea5",
      photoUrl: null,
      delayMs: 150,
    },
    {
      id: "default-3",
      sortOrder: 30,
      name: "Zain Hyder Malik",
      title: "Associate",
      bio: "Mr. Zain Hyder Malik is a committed and skilled legal practitioner with an LLB degree and a strong foundation in both criminal and civil law. He has successfully represented clients in a broad spectrum of serious matters, including murder trials, narcotics offences, financial crimes, and other complex criminal proceedings. Zain has also secured favorable outcomes in numerous bail petitions. His unwavering dedication to justice and sharp courtroom advocacy have earned him the trust of clients and respect within the legal community.",
      imageKey: "dsc05038",
      photoUrl: null,
      delayMs: 200,
    },
    {
      id: "default-4",
      sortOrder: 40,
      name: "Ayesha Riaz",
      title: "Associate",
      bio: "Ayesha Riaz, a graduate of the University of London, is engaged in litigation with a focus on civil and family law matters, including property disputes, recovery suits, injunctions, and contractual claims. She is actively involved in drafting, case preparation, and court proceedings, and also assists on corporate and regulatory assignments, contributing to advisory and compliance work with a practical, solutions-oriented approach.",
      imageKey: "dsc04908",
      photoUrl: null,
      delayMs: 250,
    },
    {
      id: "default-5",
      sortOrder: 50,
      name: "Jabbar Khan",
      title: "Associate",
      bio: "With over thirteen years of experience in income and sales tax, including service at the Federal Board of Revenue (2010–2023), Mr. Jabbar, Advocate High Court, is highly skilled in income and sales tax, accounting and has represented clients in complex and high-profile matters before the appellate tax forums.",
      imageKey: "jabbar",
      photoUrl: null,
      delayMs: 100,
    },
    {
      id: "default-6",
      sortOrder: 60,
      name: "Hina Ahmed",
      title: "Associate",
      bio: "Ms. Hina Ahmed, Advocate High Court, has substantial experience in family law, civil litigation, and property law. She has represented a diverse clientele in complex legal matters before various courts and forums. Her practice is marked by a thorough understanding of procedural and substantive law. She provides clear, effective, and results-driven legal solutions.",
      imageKey: "dsc04932",
      photoUrl: null,
      delayMs: 150,
    },
    {
      id: "default-7",
      sortOrder: 70,
      name: "Jowaria Tariq",
      title: "Associate",
      bio: "Ms. Jowaria Tariq is a law graduate from the University of London with expertise in corporate and commercial law, mergers and acquisitions, intellectual property, and arbitration and mediation services. She has experience in handling a broad range of corporate transactions, commercial litigation and regulatory work. She has advised and represented multinational companies and clients, bringing a practical, business-oriented approach to legal problem-solving.",
      imageKey: "dsc04918",
      photoUrl: null,
      delayMs: 200,
    },
    {
      id: "default-8",
      sortOrder: 80,
      name: "Ahmad Arshad",
      title: "Intern",
      bio: "Mr. Ahmad is currently serving as an Intern at N&A Jurists, where he actively contributes to the preparation of well-researched legal documents for proceedings before the District and High Courts. He is a dedicated team member focused on supporting effective legal strategies and delivering quality assistance in client matters.",
      imageKey: "dsc04966",
      photoUrl: null,
      delayMs: 150,
    },
    {
      id: "default-9",
      sortOrder: 90,
      name: "Sadia Naveed",
      title: "Intern",
      bio: "Sadia Naveed is currently serving as an intern with the firm, supporting legal research and drafting, and assisting in matters before District Courts and High Courts.",
      imageKey: null,
      photoUrl: null,
      delayMs: 175,
    },
    {
      id: "default-10",
      sortOrder: 100,
      name: "Farhat Jamil",
      title: "Office Manager",
      bio: "Ms. Farhat Jamil serves as Office Manager at N&A Jurists, providing essential administrative support to ensure the smooth operation of the firm and efficient handling of client matters.",
      imageKey: "dsc05000",
      photoUrl: null,
      delayMs: 200,
    },
    {
      id: "default-11",
      sortOrder: 110,
      name: "Mujeeb Ur Rehman",
      title: "Office Boy/Clerk",
      bio: "",
      imageKey: "dsc05108",
      photoUrl: null,
      delayMs: 100,
    },
  ],
  source: "default",
};

export function getDefaultWebsiteTeamSeedRows(): WebsiteTeamSeedRow[] {
  const rows: WebsiteTeamSeedRow[] = [
    {
      section: "founder",
      sort_order: 0,
      name: DEFAULT_WEBSITE_TEAM.founder.name,
      title: DEFAULT_WEBSITE_TEAM.founder.title,
      bio: DEFAULT_WEBSITE_TEAM.founder.bio,
      image_key: DEFAULT_WEBSITE_TEAM.founder.imageKey,
      delay_ms: 0,
    },
  ];
  for (const m of DEFAULT_WEBSITE_TEAM.members) {
    rows.push({
      section: "member",
      sort_order: m.sortOrder,
      name: m.name,
      title: m.title,
      bio: m.bio,
      image_key: m.imageKey,
      delay_ms: m.delayMs,
    });
  }
  return rows;
}
