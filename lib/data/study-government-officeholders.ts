/**
 * Names aligned for citizenship-style study (who represents the Crown, who leads government).
 * Update when legislatures change; confirm with provincial / territorial sites and GG.ca / PM.gc.ca.
 */
export const GOVERNMENT_OFFICEHOLDERS_AS_OF = '2026-04-30'

/** Federal roles applicants often memorize for interviews and self-study. */
export type FederalOfficeRow = { role: string; answer: string; note?: string }

export type SubnationalOfficeRow = {
  jurisdiction: string
  crownOrFederalRep: string
  headOfGovernment: string
  government: string
}

export const STUDY_GOVERNMENT_OFFICEHOLDER_LINKS: { label: string; href: string }[] = [
  { label: 'Governor General of Canada', href: 'https://www.gg.ca/en/governor-general' },
  { label: 'Prime Minister of Canada', href: 'https://www.pm.gc.ca/en' },
  {
    label: 'Party leaders & House officers (Parliament)',
    href: 'https://www.ourcommons.ca/members/en/house-officers',
  },
  {
    label: 'Find your Member of Parliament',
    href: 'https://www.ourcommons.ca/Members/en/search',
  },
  {
    label: 'Find your federal electoral district (Elections Canada)',
    href: 'https://www.elections.ca/',
  },
  {
    label: 'Registered federal political parties',
    href: 'https://www.elections.ca/content.aspx?section=pol&document=index&lang=e',
  },
]

export const FEDERAL_OFFICEHOLDER_ROWS: FederalOfficeRow[] = [
  { role: 'Head of State (Canada)', answer: 'The Sovereign — His Majesty King Charles III', note: 'Canada is a constitutional monarchy.' },
  { role: 'King’s representative in Canada (federal)', answer: 'The Governor General — Mary Simon' },
  { role: 'Head of government', answer: 'The Prime Minister — Mark Carney' },
  {
    role: 'Party forming the government',
    answer: 'Liberal Party of Canada',
    note: 'After the 2025 general election—always confirm the current Parliament.',
  },
  {
    role: 'Official Opposition leader & party',
    answer: 'Pierre Poilievre — Conservative Party of Canada',
  },
]

export const PROVINCIAL_OFFICEHOLDER_ROWS: SubnationalOfficeRow[] = [
  {
    jurisdiction: 'Alberta',
    crownOrFederalRep: 'Lieutenant Governor — Salma Lakhani',
    headOfGovernment: 'Premier — Danielle Smith',
    government: 'United Conservative Party',
  },
  {
    jurisdiction: 'British Columbia',
    crownOrFederalRep: 'Lieutenant Governor — Janet Austin',
    headOfGovernment: 'Premier — David Eby',
    government: 'BC New Democratic Party',
  },
  {
    jurisdiction: 'Manitoba',
    crownOrFederalRep: 'Lieutenant Governor — Anita R. Neville',
    headOfGovernment: 'Premier — Wab Kinew',
    government: 'New Democratic Party of Manitoba',
  },
  {
    jurisdiction: 'New Brunswick',
    crownOrFederalRep: 'Lieutenant Governor — Brenda Murphy',
    headOfGovernment: 'Premier — Susan Holt',
    government: 'New Brunswick Liberal Association',
  },
  {
    jurisdiction: 'Newfoundland and Labrador',
    crownOrFederalRep: 'Lieutenant Governor — Joan Marie Aylward',
    headOfGovernment: 'Premier — Tony Wakeham',
    government: 'Progressive Conservative Party of Newfoundland and Labrador',
  },
  {
    jurisdiction: 'Nova Scotia',
    crownOrFederalRep: 'Lieutenant Governor — Arthur J. LeBlanc',
    headOfGovernment: 'Premier — Tim Houston',
    government: 'Progressive Conservative Association of Nova Scotia',
  },
  {
    jurisdiction: 'Ontario',
    crownOrFederalRep: 'Lieutenant Governor — Edith Dumont',
    headOfGovernment: 'Premier — Doug Ford',
    government: 'Progressive Conservative Party of Ontario',
  },
  {
    jurisdiction: 'Prince Edward Island',
    crownOrFederalRep: 'Lieutenant Governor — Antoinette Perry',
    headOfGovernment: 'Premier — Dennis King',
    government: 'Progressive Conservative Party of PEI',
  },
  {
    jurisdiction: 'Quebec',
    crownOrFederalRep: 'Lieutenant Governor — Manon Jeannotte',
    headOfGovernment: 'Premier — François Legault',
    government: 'Coalition Avenir Québec',
  },
  {
    jurisdiction: 'Saskatchewan',
    crownOrFederalRep: 'Lieutenant Governor — Russell Mirasty',
    headOfGovernment: 'Premier — Scott Moe',
    government: 'Saskatchewan Party',
  },
]

/** Territorial governments: commissioners represent Ottawa; legislatures typically elect the premier without party caucuses except Yukon. */
export const TERRITORIAL_OFFICEHOLDER_ROWS: SubnationalOfficeRow[] = [
  {
    jurisdiction: 'Northwest Territories',
    crownOrFederalRep: 'Commissioner — Gerry Kisoun',
    headOfGovernment: 'Premier — R.J. Simpson',
    government: 'Consensus government (MLAs elect premier and cabinet)',
  },
  {
    jurisdiction: 'Nunavut',
    crownOrFederalRep: 'Commissioner — Eva Aariak',
    headOfGovernment: 'Premier — John Main',
    government: 'Consensus government (MLAs elect premier and cabinet)',
  },
  {
    jurisdiction: 'Yukon',
    crownOrFederalRep: 'Commissioner — Adeline Webber',
    headOfGovernment: 'Premier — Currie Dixon',
    government: 'Yukon Party (majority following the Nov 2025 general election)',
  },
]
