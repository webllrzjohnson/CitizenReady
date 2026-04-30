export type StudyKeyPerson = {
  /** Matches `KEY_PERSON_PORTRAIT_URLS` in `lib/study/key-person-portraits.ts`. */
  slug: string
  /** Alphabetical sort hint (family name first where possible). */
  sortKey: string
  name: string
  tagline: string
  bullets: string[]
}

/**
 * Figures commonly bundled with citizenship study companions (rewritten summaries).
 * Portraits on the study page use Wikimedia Commons media where available.
 */
export const STUDY_KEY_PEOPLE: StudyKeyPerson[] = [
  {
    slug: 'donovan-bailey',
    sortKey: 'Bailey, Donovan',
    name: 'Donovan Bailey',
    tagline: 'Sprinter and double Olympic gold medallist (1996).',
    bullets: [
      'Set a world record in the 100 m at the Atlanta Summer Olympics.',
      'Often celebrated alongside Canada’s proud Olympic track tradition.',
    ],
  },
  {
    slug: 'marjorie-turner-bailey',
    sortKey: 'Bailey, Marjorie Turner',
    name: 'Marjorie Turner-Bailey',
    tagline: 'Nova Scotia Olympian with Black Loyalist heritage.',
    bullets: [
      'Her family story connects to Black Loyalists and freedom seekers who settled in Canada in the 1780s.',
      'Represents sport and African Canadian history on citizenship timelines.',
    ],
  },
  {
    slug: 'frederick-banting',
    sortKey: 'Banting, Frederick',
    name: 'Sir Frederick Banting & Charles Best',
    tagline: 'Co-discoverers of insulin for treating diabetes.',
    bullets: [
      'Their insulin research at the University of Toronto saved millions of lives worldwide.',
      'Banting remains one of Canada’s best-known medical pioneers.',
    ],
  },
  {
    slug: 'billy-bishop',
    sortKey: 'Bishop, William',
    name: 'Air Marshal William “Billy” Bishop',
    tagline: 'First World War flying ace from Owen Sound, Ontario.',
    bullets: [
      'Earned the Victoria Cross while serving with the Royal Flying Corps.',
      'Later became an honorary Air Marshal of the Royal Canadian Air Force.',
    ],
  },
  {
    slug: 'john-buchan',
    sortKey: 'Buchan, John',
    name: 'John Buchan (Lord Tweedsmuir)',
    tagline: 'Governor General remembered for welcoming diversity.',
    bullets: [
      'Urged newcomer communities to keep their traditions while contributing to a shared Canadian loyalty.',
      'Authored popular adventure fiction before serving as Governor General (1935–1940).',
    ],
  },
  {
    slug: 'sir-isaac-brock-tecumseh',
    sortKey: 'Brock, Isaac',
    name: 'Sir Isaac Brock & Chief Tecumseh',
    tagline: 'Allied defence during the War of 1812.',
    bullets: [
      'British regulars, Canadian militia, and First Nations allies repelled American invasion attempts.',
      'Laura Secord’s warning helped set up success at Beaver Dams.',
    ],
  },
  {
    slug: 'john-cabot',
    sortKey: 'Cabot, John',
    name: 'John Cabot (Giovanni Caboto)',
    tagline: 'Explorer whose 1497 voyage strengthened England’s Atlantic claims.',
    bullets: [
      'Mapped portions of Canada’s Atlantic coast for the English Crown.',
      'English settlement on what is now Canadian soil began later (early 1600s).',
    ],
  },
  {
    slug: 'jacques-cartier',
    sortKey: 'Cartier, Jacques',
    name: 'Jacques Cartier',
    tagline: 'French navigator of the St. Lawrence.',
    bullets: [
      'Made repeated voyages for France and claimed territory for the French king.',
      'Helped open the river route toward Stadacona (Québec) and Hochelaga (Montreal island).',
    ],
  },
  {
    slug: 'george-etienne-cartier',
    sortKey: 'Cartier, George-Étienne',
    name: 'Sir George-Étienne Cartier',
    tagline: 'Father of Confederation defending Quebec’s place in the Dominion.',
    bullets: [
      'Worked with Macdonald to negotiate provincial rights inside Confederation.',
      'Symbol of French Canadian participation in nation-building.',
    ],
  },
  {
    slug: 'guy-carleton',
    sortKey: 'Carleton, Guy',
    name: 'Sir Guy Carleton (Lord Dorchester)',
    tagline: 'Defender of Quebec during the American Revolutionary War.',
    bullets: [
      'Helped organize the Loyalist migration into Nova Scotia and Quebec.',
      'Associated with early protections for French Canadian institutions.',
    ],
  },
  {
    slug: 'arthur-currie',
    sortKey: 'Currie, Arthur',
    name: 'Sir Arthur Currie',
    tagline: 'Senior commander of the Canadian Corps in the First World War.',
    bullets: [
      'Rose from militia roots to lead Canadians through major battles including Vimy Ridge and the Hundred Days.',
      'Often described as Canada’s most capable soldier of that conflict.',
    ],
  },
  {
    slug: 'viola-desmond',
    sortKey: 'Desmond, Viola',
    name: 'Viola Desmond',
    tagline: 'Businesswoman who stood against racial segregation.',
    bullets: [
      'Her case became an enduring civil-rights lesson in Nova Scotia and nationwide.',
      'Honoured on Canadian currency for courage and dignity.',
    ],
  },
  {
    slug: 'gabriel-dumont',
    sortKey: 'Dumont, Gabriel',
    name: 'Gabriel Dumont',
    tagline: 'Métis military leader during the Northwest Resistance.',
    bullets: [
      'Known for tactical skill and deep ties to Métis plains communities.',
      'Remembered alongside Louis Riel in debates over western rights.',
    ],
  },
  {
    slug: 'alexander-robert-dunn',
    sortKey: 'Dunn, Alexander Roberts',
    name: 'Lieutenant Alexander Roberts Dunn',
    tagline: 'First Canadian-born recipient of the Victoria Cross.',
    bullets: [
      'Displayed bravery during the Charge of the Light Brigade (Crimean War, 1854).',
      'Studied on timelines linking Canada to imperial wars before Confederation.',
    ],
  },
  {
    slug: 'phil-edwards',
    sortKey: 'Edwards, Phil',
    name: 'Phil Edwards',
    tagline: 'Middle-distance runner and physician.',
    bullets: [
      'Won Olympic bronze medals for Canada in 1928, 1932, and 1936.',
      'Graduated from McGill Medicine and later specialized in tropical diseases.',
    ],
  },
  {
    slug: 'count-frontenac',
    sortKey: 'Frontenac, Louis',
    name: 'Count Frontenac',
    tagline: 'Bold governor of New France.',
    bullets: [
      'Famously refused demands to surrender Québec during the 1690 British attack.',
      'Represents French colonial determination in citizenship vignettes.',
    ],
  },
  {
    slug: 'terry-fox',
    sortKey: 'Fox, Terry',
    name: 'Terry Fox',
    tagline: 'Marathon of Hope runner for cancer research.',
    bullets: [
      'Attempted a cross-Canada run on one prosthetic leg beginning in 1980.',
      'The Terry Fox Run continues as one of Canada’s largest charitable movements.',
    ],
  },
  {
    slug: 'famous-five',
    sortKey: 'Famous Five',
    name: 'The Famous Five',
    tagline: 'Advocates who won the “Persons Case” (1929).',
    bullets: [
      'Campaign included Nellie McClung, Henrietta Edwards, Irene Parlby, Louise McKinney, and Emily Murphy.',
      'Opened the door for women to be appointed to the Senate.',
    ],
  },
  {
    slug: 'robert-hampton-gray',
    sortKey: 'Gray, Robert Hampton',
    name: 'Lieutenant Robert Hampton Gray',
    tagline: 'Navy pilot awarded a posthumous Victoria Cross (1945).',
    bullets: [
      'Born in Trail, British Columbia; sank an enemy warship days before Japan’s surrender.',
      'Remembered for courage in the Pacific theatre.',
    ],
  },
  {
    slug: 'wayne-gretzky',
    sortKey: 'Gretzky, Wayne',
    name: 'Wayne Gretzky',
    tagline: 'Hockey champion closely tied to Edmonton’s NHL dynasty.',
    bullets: [
      'Dominant scorer often called “The Great One.”',
      'Symbolizes Canada’s winter sport identity abroad.',
    ],
  },
  {
    slug: 'william-hall',
    sortKey: 'Hall, William',
    name: 'Able Seaman William Hall',
    tagline: 'First Black sailor awarded the Victoria Cross.',
    bullets: [
      'From Horton, Nova Scotia; honoured for bravery during the Siege of Lucknow (1857).',
      'His parents had escaped slavery in the United States.',
    ],
  },
  {
    slug: 'paul-henderson',
    sortKey: 'Henderson, Paul',
    name: 'Paul Henderson',
    tagline: 'Scorer of the 1972 Summit Series winner.',
    bullets: [
      'His goal against the Soviet team became a cultural touchstone during the Cold War era.',
      'Still cited as a moment when hockey unified the country.',
    ],
  },
  {
    slug: 'david-johnston',
    sortKey: 'Johnston, David',
    name: 'David Johnston',
    tagline: 'Law professor who served as Governor General.',
    bullets: [
      'Encouraged voluntarism, education, and innovation during his vice-regal tenure.',
      'Illustrates the Crown’s representative role in modern Canada.',
    ],
  },
  {
    slug: 'filip-konowal',
    sortKey: 'Konowal, Filip',
    name: 'Corporal Filip Konowal',
    tagline: 'Victoria Cross recipient at Hill 70 (1917).',
    bullets: [
      'Born in Ukraine; showed extraordinary leadership clearing enemy dugouts.',
      'Often highlighted as an immigrant hero of the Canadian Corps.',
    ],
  },
  {
    slug: 'hippolyte-la-fontaine',
    sortKey: 'La Fontaine, Louis-Hippolyte',
    name: 'Sir Louis-Hippolyte La Fontaine',
    tagline: 'Champion of French institutions and responsible government.',
    bullets: [
      'Became a leading voice for responsible government alongside Robert Baldwin.',
      'Study companions cite him as Canada’s first head of a responsible ministry.',
    ],
  },
  {
    slug: 'wilfrid-laurier',
    sortKey: 'Laurier, Wilfrid',
    name: 'Sir Wilfrid Laurier',
    tagline: 'Prime Minister promoting growth and compromise.',
    bullets: [
      'Canada’s first francophone Prime Minister.',
      'Encouraged immigration and calm handling of English–French tensions.',
    ],
  },
  {
    slug: 'catriona-le-may-doan',
    sortKey: 'Le May Doan, Catriona',
    name: 'Catriona Le May Doan',
    tagline: 'Olympic speed skating champion.',
    bullets: [
      'Twice Olympic gold medallist and influential mentor in Canadian sport.',
      'Carried the Maple Leaf in Salt Lake City after golden performances.',
    ],
  },
  {
    slug: 'william-logan',
    sortKey: 'Logan, William',
    name: 'Sir William Logan',
    tagline: 'Founding director of the Geological Survey of Canada.',
    bullets: [
      'Mapped mineral wealth that guided railways and settlement.',
      'Represents Canada’s scientific exploration narrative.',
    ],
  },
  {
    slug: 'sir-john-a-macdonald',
    sortKey: 'Macdonald, John A.',
    name: 'Sir John A. Macdonald',
    tagline: 'First Prime Minister of the Dominion.',
    bullets: [
      'Central negotiator of Confederation and early nation-building policies.',
      'Modern curricula also examine harmful colonial policies linked to his governments.',
    ],
  },
  {
    slug: 'agnes-macphail',
    sortKey: 'Macphail, Agnes',
    name: 'Agnes Macphail',
    tagline: 'First woman elected to the House of Commons (1921).',
    bullets: [
      'Teacher and farmer who pushed prison reform and seniors’ issues.',
      'Later helped women enter provincial politics in Ontario.',
    ],
  },
  {
    slug: 'pierre-le-moyne-iberville',
    sortKey: 'Le Moyne d\'Iberville, Pierre',
    name: 'Pierre Le Moyne d\'Iberville',
    tagline: 'Soldier-explorer who defended New France.',
    bullets: [
      'Led raids and naval campaigns against English rivals from Hudson Bay to Louisiana.',
      'Embodies French frontier daring on study cheat sheets.',
    ],
  },
  {
    slug: 'chantal-petitclerc',
    sortKey: 'Petitclerc, Chantal',
    name: 'Chantal Petitclerc',
    tagline: 'Paralympic wheelchair racer and senator.',
    bullets: [
      'Won multiple gold medals and later promoted accessibility in public life.',
      'Shows Canada’s Paralympic achievements on citizenship timelines.',
    ],
  },
  {
    slug: 'louis-riel',
    sortKey: 'Riel, Louis',
    name: 'Louis Riel',
    tagline: 'Métis politician and resistance leader.',
    bullets: [
      'Advocated for French Catholic and Métis rights during Red River and Northwest crises.',
      'Remembered as both a founder of Manitoba and a polarizing historical figure.',
    ],
  },
  {
    slug: 'mary-ann-shadd-cary',
    sortKey: 'Shadd Cary, Mary Ann',
    name: 'Mary Ann Shadd Cary',
    tagline: 'Publisher, teacher, and abolitionist.',
    bullets: [
      'Edited The Provincial Freeman to promote settlement in Canada and oppose slavery.',
      'Among the first Black women to publish a newspaper in North America.',
    ],
  },
  {
    slug: 'laura-secord',
    sortKey: 'Secord, Laura',
    name: 'Laura Secord',
    tagline: 'War of 1812 heroine famous for her warning trek.',
    bullets: [
      'Walked roughly 30 km to alert British forces of an American attack.',
      'Credited with helping achieve victory at Beaver Dams.',
    ],
  },
  {
    slug: 'john-graves-simcoe',
    sortKey: 'Simcoe, John Graves',
    name: 'Lieutenant-Colonel John Graves Simcoe',
    tagline: 'First Lieutenant Governor of Upper Canada.',
    bullets: [
      'Founded York (Toronto) as the colonial capital.',
      'Introduced legislation toward gradual abolition of slavery in Upper Canada.',
    ],
  },
  {
    slug: 'sam-steele',
    sortKey: 'Steele, Sam',
    name: 'Sir Sam Steele',
    tagline: 'North-West Mounted Police hero of the frontier.',
    bullets: [
      'Helped keep order during the Klondike Rush and early western settlement.',
      'Symbolizes the earliest days of what became the RCMP.',
    ],
  },
  {
    slug: 'mark-tewksbury',
    sortKey: 'Tewksbury, Mark',
    name: 'Mark Tewksbury',
    tagline: 'Olympic swimmer and human-rights speaker.',
    bullets: [
      'Won gold at Barcelona (1992) and later advocated for LGBTQ+ inclusion in sport.',
      'Shows modern volunteerism and leadership expectations for citizens.',
    ],
  },
  {
    slug: 'paul-triquet',
    sortKey: 'Triquet, Paul',
    name: 'Brigadier Paul Triquet',
    tagline: 'Victoria Cross winner in Italy (1943).',
    bullets: [
      'Led infantry and tanks at Casa Berardi under fierce German defence.',
      'Represents French Canadian bravery in the Second World War.',
    ],
  },
  {
    slug: 'duke-of-wellington',
    sortKey: 'Wellington',
    name: 'The Duke of Wellington',
    tagline: 'British commander tied indirectly to Ottawa’s founding.',
    bullets: [
      'Dispatched elite troops to defend Canada during the War of 1812.',
      'Strategic choices influenced defence works including the Rideau Canal corridor.',
    ],
  },
]

/** Alphabetical presentation keeps scanning predictable between sessions. */
export const STUDY_KEY_PEOPLE_SORTED: StudyKeyPerson[] = [...STUDY_KEY_PEOPLE].sort((a, b) =>
  a.sortKey.localeCompare(b.sortKey, 'en', { sensitivity: 'base' })
)
