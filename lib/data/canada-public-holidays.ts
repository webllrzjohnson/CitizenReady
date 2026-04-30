/** Study reference: national holidays & observances commonly cited for citizenship prep (not legal advice). */

export type HolidayKind = 'federal' | 'commemorative' | 'quebec'

export type CanadaPublicHoliday = {
  name: string
  when: string
  /** Approximate calendar order (movable feasts use typical month). */
  monthOrder: number
  kind: HolidayKind
  /** Short note for learners when helpful */
  note?: string
}

export const CANADA_PUBLIC_HOLIDAYS: CanadaPublicHoliday[] = [
  {
    name: "New Year's Day",
    when: 'January 1',
    monthOrder: 1,
    kind: 'federal',
  },
  {
    name: 'Sir John A. Macdonald Day',
    when: 'January 11',
    monthOrder: 1,
    kind: 'commemorative',
    note: "Commemorates Canada's first Prime Minister.",
  },
  {
    name: 'Good Friday',
    when: 'Friday immediately before Easter Sunday',
    monthOrder: 4,
    kind: 'federal',
  },
  {
    name: 'Easter Monday',
    when: 'Monday immediately following Easter Sunday',
    monthOrder: 4,
    kind: 'federal',
    note: 'Observed by federal public service and some workplaces.',
  },
  {
    name: 'Vimy Ridge Day (Vimy Day)',
    when: 'April 9',
    monthOrder: 4,
    kind: 'commemorative',
    note: 'Honours the Battle of Vimy Ridge (1917).',
  },
  {
    name: "Victoria Day (Sovereign's birthday)",
    when: 'Monday preceding May 25',
    monthOrder: 5,
    kind: 'federal',
  },
  {
    name: 'National Indigenous Peoples Day',
    when: 'June 21',
    monthOrder: 6,
    kind: 'commemorative',
  },
  {
    name: 'Saint-Jean-Baptiste Day / Fête nationale du Québec',
    when: 'June 24',
    monthOrder: 6,
    kind: 'quebec',
    note: "Quebec's national holiday.",
  },
  {
    name: 'Canada Day',
    when: 'July 1',
    monthOrder: 7,
    kind: 'federal',
  },
  {
    name: 'Labour Day',
    when: 'First Monday in September',
    monthOrder: 9,
    kind: 'federal',
  },
  {
    name: 'National Day for Truth and Reconciliation',
    when: 'September 30',
    monthOrder: 9,
    kind: 'commemorative',
    note: 'Statutory for federal employees; varies by province and territory.',
  },
  {
    name: 'Thanksgiving Day',
    when: 'Second Monday in October',
    monthOrder: 10,
    kind: 'federal',
  },
  {
    name: 'Remembrance Day',
    when: 'November 11',
    monthOrder: 11,
    kind: 'federal',
    note: 'Statutory rules vary by province and territory.',
  },
  {
    name: 'Sir Wilfrid Laurier Day',
    when: 'November 20',
    monthOrder: 11,
    kind: 'commemorative',
  },
  {
    name: 'Christmas Day',
    when: 'December 25',
    monthOrder: 12,
    kind: 'federal',
  },
  {
    name: 'Boxing Day',
    when: 'December 26',
    monthOrder: 12,
    kind: 'federal',
    note: 'Observance varies by province and territory.',
  },
]
