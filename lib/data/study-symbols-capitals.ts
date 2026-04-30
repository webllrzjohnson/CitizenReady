export type ProvinceCapital = { name: string; capital: string }

/** Optional `imageKey` maps to `/public/flags/{imageKey}.svg`. */
export type StudySection = { heading: string; bullets: string[]; imageKey?: string }

export type JurisdictionFlagNotes = { name: string; imageKey: string; bullets: string[] }

/** National-level content aligned with *Discover Canada*–style prep (not legal advice). */
export const STUDY_NATIONAL_SYMBOL_SECTIONS: StudySection[] = [
  {
    heading: 'The National Flag of Canada (Maple Leaf)',
    imageKey: 'canada',
    bullets: [
      'Adopted by Parliament and first raised on February 15, 1965 — now celebrated as National Flag of Canada Day.',
      'The design is red–white–red with a stylized white square and red maple leaf at the centre; the leaf is not botanically exact (tests often mention an 11-point stylized leaf).',
      'The two red bars are sometimes described as echoing Canada’s coasts; the white centre suggests peace, fairness, and snow — phrasing varies, but the flag is strongly tied to unity and Canada’s north–south breadth.',
      'Before 1965, Canada used the Canadian Red Ensign (red flag with Union Jack and shield) in many official settings; the change to a distinct maple leaf flag was a major postwar symbol of Canadian identity.',
    ],
  },
  {
    heading: 'Coat of arms, motto & Crown',
    bullets: [
      'The Royal Coat of Arms of Canada includes symbols of Canada’s European roots (English, Scottish, Irish, and French motifs on the shield), supporters, and a maple leaf motif with the motto "A Mari Usque Ad Mare" ("From sea to sea").',
      'The Crown appears on many institutions and medals; federally the King is represented by the Governor General — the Crown symbolizes the state and continuity within a constitutional monarchy.',
    ],
  },
  {
    heading: 'Anthems & royal anthem',
    bullets: [
      '"O Canada" is the national anthem (English and French lyrics are both widely used; bilingual knowledge is useful for tests on symbols).',
      '"God Save the King" (formerly "God Save the Queen") is the royal anthem, played for the monarch and members of the Royal Family on certain occasions.',
    ],
  },
  {
    heading: 'Plants, animals & colours',
    bullets: [
      'The maple leaf has been an emblem associated with Canadian identity for centuries and appears widely on insignia and sports branding.',
      'The beaver is a national symbol strongly linked to the fur trade and resource history; it appears on coins and in popular imagery and is often highlighted alongside the maple leaf in study guides.',
      'Red and white are Canada’s official national colours proclaimed in association with arms and ceremonial use.',
    ],
  },
  {
    heading: 'Institutions Canadians recognize worldwide',
    bullets: [
      'The RCMP (“Mounties”), especially in the red ceremonial uniform (“Red Serge”), is an internationally recognized emblem of policing and ceremonial presence in Canada.',
      'Canadian currency features portraits of the monarch or former prime ministers alongside Canadian landscapes and symbols (birds, inventions, remembrance themes) — the $1 coin with the common loon is nicknamed the "loonie"; the $2 coin is nicknamed the "toonie".',
    ],
  },
]

/** Compact facts that commonly appear as distractors or one-off questions. */
export const STUDY_SYMBOLS_EXAM_NOTES: string[] = [
  'Federal capital: Ottawa — in Ontario, not the province’s largest city (Toronto is Ontario’s provincial capital’s larger neighbour in popular memory; avoid confusing federal vs provincial capitals).',
  'Royal symbols: honours such as Victoria Cross, Order of Canada, and mention of bravery decorations often appear beside questions about civic duty.',
  '"True north strong and free" is a lyric from O Canada — easy to confuse with motto or provincial slogans.',
  'Tests may ask which symbols are statutory vs folkloric — focus on Discover Canada wording for official status of flag, anthem, and arms.',
]

export const STUDY_PROVINCIAL_TERRITORIAL_FLAGS: JurisdictionFlagNotes[] = [
  {
    name: 'Alberta',
    imageKey: 'alberta',
    bullets: [
      'Royal blue field with provincial shield: St George’s Cross, prairie, snowy mountains — reflects mountains, farmland, and resources.',
      'Alberta adopted its provincial flag formally in concert with twentieth-century symbolism of the prairie west.',
    ],
  },
  {
    name: 'British Columbia',
    imageKey: 'british-columbia',
    bullets: [
      'Union Flag in the canton echoes historical ties; the setting sun below represents the Pacific horizon ("westward" symbolism).',
      'Wavy blue and silver lines evoke the sea; the crowned Union element marks B.C.’s beginnings as a British colony.',
    ],
  },
  {
    name: 'Manitoba',
    imageKey: 'manitoba',
    bullets: [
      'Red Ensign descendant: Union Jack canton plus provincial shield featuring a standing bison — linked to prairie life and Indigenous and fur-trade history.',
      'Formalized in advance of Centennial-era Canadian identity debates; often contrasted study-wise with purely "maple leaf" federal imagery.',
    ],
  },
  {
    name: 'New Brunswick',
    imageKey: 'new-brunswick',
    bullets: [
      'Golden field with ship and lion — maritime shipbuilding heritage above, lion from heraldry of Brunswick roots below.',
      'One of the older provincial designs; distinctive among Atlantic flags for strongly "maritime-industrial" symbolism.',
    ],
  },
  {
    name: 'Newfoundland and Labrador',
    imageKey: 'newfoundland-and-labrador',
    bullets: [
      'Blue, white, and red bands with pointed sides and stylized golden trident shaft — evokes sea, Arctic snow/ice in colour stories, labour in tools of the fisheries, and optimism.',
      'Distinct from Newfoundland’s historic unofficial tricolours; official provincial flag tied to provincial status post-Confederation timelines.',
    ],
  },
  {
    name: 'Northwest Territories',
    imageKey: 'northwest-territories',
    bullets: [
      'Blue wedge with territorial coat of arms; white side panel — polar bear symbolism (northern fauna, endurance) figures prominently.',
      'Designed with strong input from Indigenous and northern symbolism in the territorial era preceding Nunavut’s creation.',
    ],
  },
  {
    name: 'Nova Scotia',
    imageKey: 'nova-scotia',
    bullets: [
      'Saltire of St Andrew’s Cross on reversing white and blue framing — echoes Scottish settlement and is one of North America’s oldest provincial flags.',
      'Often confused visually with Scottish flags until you recall the proportions and heraldic framing used in Halifax-centric branding.',
    ],
  },
  {
    name: 'Nunavut',
    imageKey: 'nunavut',
    bullets: [
      'Gold and white fields with a red inuksuk and a blue star evoking the North Star — adopted when the territory came into being in 1999, reflecting Inuit-led governance and geography.',
      'Colours are often summarized as richness of the land, light, oceans, and sky — a territorial identity favourite on practice tests.',
    ],
  },
  {
    name: 'Ontario',
    imageKey: 'ontario',
    bullets: [
      'Red Ensign–style canton plus green shield bearing three maple leaves and cross of St George — Loyalist and English-Canadian symbolism married to forestry.',
      'Ontario adopted this design in the wake of debates around the federal maple leaf adoption; pedagogically contrast "provincial red ensign" vs "national maple leaf flag".',
    ],
  },
  {
    name: 'Prince Edward Island',
    imageKey: 'prince-edward-island',
    bullets: [
      'Golden heraldic lion on red stripe above sapling-bearing island emblem — evokes British connection and Charlottetown’s "birthplace of Confederation" story.',
      'Green island and fertile imagery pairs well with trivia about the 1864 conference versus actual Confederation entry date.',
    ],
  },
  {
    name: 'Quebec',
    imageKey: 'quebec',
    bullets: [
      'Blue field with four white fleurs-de-lys and centred white cross (the fleurdelisé) — unmistakably Quebec; predates Quiet Revolution branding but dominates internationally.',
      'Tests often pairing French-language primacy elsewhere with Québec’s distinct francophone symbolism — not the province’s capital name on the fleurdelisé itself.',
    ],
  },
  {
    name: 'Saskatchewan',
    imageKey: 'saskatchewan',
    bullets: [
      'Horizontal gold and green with provincial flower (western red lily) on the hoist — wheatbelt colours paired with prairie floral emblem.',
      'Easily distinguished from prairie neighbours Manitoba (bison) and Alberta (shield) once you memorize the lily.',
    ],
  },
  {
    name: 'Yukon',
    imageKey: 'yukon',
    bullets: [
      'Green (forests), white (snow), blue (waters) tricolour with coat of arms at the centre — ties to mountains, rivers, and Klondike heritage.',
      'Territorial capital Whitehorse is often tested alongside this flag’s "northern nature" palette.',
    ],
  },
]

export const STUDY_PROVINCIAL_TERRITORIAL_CAPITALS: ProvinceCapital[] = [
  { name: 'Alberta', capital: 'Edmonton' },
  { name: 'British Columbia', capital: 'Victoria' },
  { name: 'Manitoba', capital: 'Winnipeg' },
  { name: 'New Brunswick', capital: 'Fredericton' },
  { name: 'Newfoundland and Labrador', capital: "St. John's" },
  { name: 'Northwest Territories', capital: 'Yellowknife' },
  { name: 'Nova Scotia', capital: 'Halifax' },
  { name: 'Nunavut', capital: 'Iqaluit' },
  { name: 'Ontario', capital: 'Toronto' },
  { name: 'Prince Edward Island', capital: 'Charlottetown' },
  { name: 'Quebec', capital: 'Québec City' },
  { name: 'Saskatchewan', capital: 'Regina' },
  { name: 'Yukon', capital: 'Whitehorse' },
]
