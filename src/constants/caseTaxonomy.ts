/** Shared with the law firm portal (new case / edit) — keep filters and portal in sync. */
export const WEBSITE_CASE_COURTS = [
  "Supreme Court",
  "High Court",
  "Lower Courts & Tribunals",
] as const;

export const WEBSITE_CASE_SUBJECTS = [
  "Election",
  "Constitution",
  "Tax",
  "Access to Information",
  "Corporate Crime",
  "Banking",
  "PMDC",
  "Power",
  "Policy Decision of Government",
  "Company",
  "Liquidation",
  "Criminal",
  "Anti Money Laundering",
  "Family",
  "Defamation",
  "Contempt",
  "Insurance",
  "Service",
  "Rent",
  "Civil",
  "Contract",
] as const;

export type WebsiteCaseCourt = (typeof WEBSITE_CASE_COURTS)[number];
export type WebsiteCaseSubject = (typeof WEBSITE_CASE_SUBJECTS)[number];
