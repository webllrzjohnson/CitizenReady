export type StudySection = { heading: string; bullets: string[] }

/** Topics aligned with *Discover Canada*–style citizenship preparation (not legal advice). */
export const STUDY_GOVERNMENT_SECTIONS: StudySection[] = [
  {
    heading: 'Constitutional monarchy & head of state',
    bullets: [
      'Canada is a constitutional monarchy, a parliamentary democracy, and a federal state.',
      'The King is the head of state and is represented federally by the Governor General.',
      'The Prime Minister is the head of government — usually the leader of the party that can command the confidence of the House of Commons.',
    ],
  },
  {
    heading: 'Parliament (federal legislature)',
    bullets: [
      'Parliament has three parts: the Sovereign (King), the Senate, and the House of Commons.',
      'Members of Parliament (MPs) are elected in ridings across Canada; senators are appointed and review legislation.',
      'For a bill to become federal law, it must generally pass both chambers and receive Royal Assent (given by the Governor General on the King\'s behalf).',
    ],
  },
  {
    heading: 'Three levels of government',
    bullets: [
      'Federal: national matters such as defence, foreign affairs, citizenship, trade, criminal law, and currency.',
      'Provincial / territorial: areas such as education, hospitals, highways, and municipal institutions.',
      'Municipal / local: cities and towns handle services such as public transit, local policing collaboration, parks, and zoning.',
      'Some responsibilities overlap or are shared — Canadians interact with all three levels in daily life.',
    ],
  },
  {
    heading: 'Democracy & elections',
    bullets: [
      'Eligible Canadian citizens vote in federal elections by secret ballot; Elections Canada runs federal electoral processes.',
      'Responsible government means ministers answer to Parliament — governments typically resign if they lose the confidence of the Commons.',
      'Participating in elections when eligible is both a right and an expectation of engaged citizenship.',
    ],
  },
  {
    heading: 'The Charter & courts',
    bullets: [
      'The Canadian Charter of Rights and Freedoms (1982) guarantees fundamental freedoms, democratic rights, mobility, legal rights, equality, and language rights subject to reasonable limits.',
      'Courts interpret laws and the Charter; the Supreme Court of Canada is the highest appellate court.',
    ],
  },
]
