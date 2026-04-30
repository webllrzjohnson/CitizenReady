/**
 * Study reference: milestones commonly cited in citizenship prep (Discover Canada style).
 * Includes selected contemporary events through the current study year; verify against official IRCC materials.
 */

export type TimelineEntry = {
  /** Heading shown on the timeline (year, span, or era label). */
  period: string
  /** One or more concise bullet points for that period. */
  events: string[]
}

export const CANADA_IMPORTANT_DATES: TimelineEntry[] = [
  {
    period: '2026',
    events: [
      'Statistics Canada conducts the Census of Population (held every five years), shaping representation and federal transfers.',
    ],
  },
  {
    period: '2025',
    events: [
      'Mark Carney was sworn in as Prime Minister on March 14, succeeding Justin Trudeau after nine years in office.',
    ],
  },
  {
    period: '2023',
    events: [
      'The coronation of King Charles III took place on May 6; he remains Canada\'s monarch under the constitutional monarchy.',
    ],
  },
  {
    period: '2022',
    events: [
      'Queen Elizabeth II, Queen of Canada for over 70 years, died on September 8 at age 96.',
      'King Charles III automatically became King of Canada; a formal accession proclamation ceremony was held in Ottawa on September 10.',
    ],
  },
  {
    period: '2021',
    events: [
      'The United Nations Declaration on the Rights of Indigenous Peoples Act received Royal Assent on June 21, creating a framework to align federal law with the UN Declaration.',
      'Mary Simon, an Inuk leader and diplomat, was installed as Canada\'s first Indigenous Governor General on July 26.',
    ],
  },
  {
    period: '2020',
    events: [
      'The COVID-19 pandemic led to nationwide public-health measures, border restrictions, and emergency economic supports.',
      'Widespread protests and rail disruptions drew national attention to Indigenous land rights and resource development (including Wet\'suwet\'en territory).',
      'The Canada–United States–Mexico Agreement (CUSMA/USMCA) entered into force on July 1, replacing NAFTA.',
    ],
  },
  {
    period: '2018',
    events: [
      'The Cannabis Act took effect on October 17, legalizing and regulating recreational cannabis countrywide.',
    ],
  },
  {
    period: '2017',
    events: [
      'Canada marked the 150th anniversary of Confederation with celebrations and reflection on national identity.',
    ],
  },
  {
    period: '2015',
    events: [
      'The Truth and Reconciliation Commission released its final report on residential schools, including 94 Calls to Action.',
    ],
  },
  {
    period: '2014',
    events: [
      'Canadian Armed Forces ended their combat mission in Afghanistan (NATO training role had followed years of deployment).',
    ],
  },
  {
    period: '2012',
    events: ['Queen Elizabeth II celebrated her Diamond Jubilee (60 years as Queen of Canada).'],
  },
  {
    period: '2008',
    events: [
      'Prime Minister Stephen Harper delivered a formal apology in the House of Commons for harm caused by the residential school system.',
    ],
  },
  {
    period: '2006',
    events: [
      'The House of Commons recognized that the Quebecois form a nation within a united Canada.',
    ],
  },
  {
    period: '2005',
    events: [
      'The Civil Marriage Act received Royal Assent on July 20, extending civil marriage for same-sex couples nationwide.',
    ],
  },
  {
    period: '2002',
    events: ['Queen Elizabeth II celebrated her Golden Jubilee (50 years as Queen of Canada).'],
  },
  {
    period: '1999',
    events: [
      'Nunavut became Canada\'s largest territory on April 1, carved out of the eastern Northwest Territories with a predominantly Inuit population.',
    ],
  },
  {
    period: '1995',
    events: [
      'The second Quebec sovereignty referendum was held; the "No" side prevailed by a narrow margin.',
    ],
  },
  {
    period: '1994',
    events: [
      'The North American Free Trade Agreement (NAFTA) entered into force on January 1, deepening trade ties with the United States and Mexico.',
    ],
  },
  {
    period: '1992',
    events: [
      'The Charlottetown Accord constitutional reform package was rejected in a national referendum.',
    ],
  },
  {
    period: '1990',
    events: [
      'The Meech Lake Accord expired without ratification after failing to win approval from all provinces.',
      'The Oka Crisis drew national attention to Indigenous land claims and Crown relations in Quebec.',
    ],
  },
  {
    period: '1988',
    events: [
      'Canada enacted free trade with the United States.',
      'The Government of Canada formally apologized and compensated Japanese Canadians for wartime relocation.',
    ],
  },
  {
    period: '1985',
    events: [
      'Rick Hansen completed his Man in Motion world tour by wheelchair to raise funds for spinal cord research.',
    ],
  },
  {
    period: '1982',
    events: [
      'The Constitution of Canada was amended to entrench the Canadian Charter of Rights and Freedoms.',
      'Queen Elizabeth II proclaimed the amended Constitution in Ottawa.',
    ],
  },
  {
    period: '1980',
    events: [
      'The first Quebec sovereignty referendum was held and defeated.',
      'Terry Fox began his Marathon of Hope to raise funds for cancer research.',
      '"O Canada" was proclaimed as the national anthem.',
    ],
  },
  {
    period: '1970s',
    events: ['The term First Nations began to be widely used.'],
  },
  {
    period: '1969',
    events: [
      'Parliament passed the Official Languages Act, establishing French and English as Canada\'s official languages.',
    ],
  },
  {
    period: '1967',
    events: ['Canada established its own honours system with the Order of Canada.'],
  },
  {
    period: '1965',
    events: [
      'The Canada Pension Plan and Quebec Pension Plan were established.',
      'The new Canadian flag was raised for the first time.',
    ],
  },
  {
    period: '1960',
    events: ['First Nations, Inuit, and Métis peoples were granted the right to vote in federal elections.'],
  },
  {
    period: '1960s',
    events: ['Quebec experienced an era of rapid change known as the Quiet Revolution.'],
  },
  {
    period: '1952',
    events: ['Queen Elizabeth II became Queen of Canada.'],
  },
  {
    period: '1951',
    events: [
      'For the first time, a majority of Canadians were able to afford adequate food, shelter, and clothing.',
    ],
  },
  {
    period: '1949',
    events: [
      'Newfoundland and Labrador joined Canada as the tenth province on March 31 (following a referendum).',
    ],
  },
  {
    period: '1948',
    events: [
      'Quebec adopted its own flag featuring the fleur-de-lis.',
      'Japanese Canadians gained the right to vote in federal and provincial elections.',
    ],
  },
  {
    period: '1947',
    events: ['Oil was discovered in Alberta, marking the rise of Canada\'s modern energy sector.'],
  },
  {
    period: '1945',
    events: ['The Second World War ended.'],
  },
  {
    period: '1944',
    events: [
      'Canadian forces landed at Juno Beach on June 6 as part of the Allied invasion of Normandy on D-Day.',
    ],
  },
  {
    period: '1940',
    events: [
      'Women in Quebec were granted the right to vote in provincial elections.',
      'The federal government introduced unemployment insurance (later Employment Insurance).',
    ],
  },
  {
    period: '1939',
    events: [
      'Canada entered the Second World War by declaring war on Nazi Germany on September 10 (one week after the UK).',
    ],
  },
  {
    period: '1934',
    events: ['The Bank of Canada was established to promote a stable financial system.'],
  },
  {
    period: '1931',
    events: [
      'The Statute of Westminster greatly expanded Dominion autonomy; Canada gained fuller control over its own laws while constitutional amendment powers remained tied to the UK until patriation (1982).',
    ],
  },
  {
    period: '1929',
    events: [
      'The stock market crashed, contributing to the Great Depression (sometimes called the "Dirty Thirties").',
      'The Persons Case (Edwards v. Canada) recognized women as "persons" under constitutional law, advancing eligibility for the Senate and broader equality claims.',
    ],
  },
  {
    period: '1927',
    events: [
      'The Peace Tower was completed in memory of the First World War.',
      'Old Age Security was introduced.',
    ],
  },
  {
    period: '1921',
    events: [
      'Agnes Macphail became the first woman elected to the House of Commons.',
      'Red and white were officially designated as Canada\'s national colours.',
    ],
  },
  {
    period: '1920',
    events: ['The Group of Seven formed, known for distinctive paintings of Canadian landscapes.'],
  },
  {
    period: '1918',
    events: ['Most Canadian women aged 21 and over gained the right to vote in federal elections.'],
  },
  {
    period: '1917',
    events: [
      'The Canadian Corps captured Vimy Ridge, reinforcing Canada\'s reputation for courage under fire.',
      'Some women gained federal voting rights through military-related eligibility.',
    ],
  },
  {
    period: '1916',
    events: ['Manitoba became the first province to grant women the right to vote in provincial elections.'],
  },
  {
    period: '1914',
    events: [
      'Canada entered the First World War alongside Britain and allies; the war deeply shaped national identity and sacrifice.',
    ],
  },
  {
    period: '1905',
    events: [
      'Alberta and Saskatchewan entered Confederation as provinces on September 1.',
    ],
  },
  {
    period: '1891',
    events: ['James Naismith, born in Canada, invented the game of basketball.'],
  },
  {
    period: '1890s',
    events: [
      'The Klondike Gold Rush (about 1896–1899) drew prospectors to the Yukon after gold was found on Bonanza Creek.',
    ],
  },
  {
    period: '1885',
    events: [
      'The Canadian Pacific Railway was completed, marked by the driving of the "last spike" by Donald Smith (Lord Strathcona).',
    ],
  },
  {
    period: '1880',
    events: ['"O Canada" was first performed in Québec City.'],
  },
  {
    period: '1873',
    events: [
      'Prince Edward Island joined Confederation.',
      'The North-West Mounted Police (precursor to the RCMP) was founded to keep order in the West.',
    ],
  },
  {
    period: '1871',
    events: ['British Columbia joined Confederation on July 20 after Ottawa promised a railway to the Pacific.'],
  },
  {
    period: '1870',
    events: [
      'Manitoba became Canada\'s fifth province.',
      'The North-West Territories were transferred from the Hudson\'s Bay Company, enlarging Canadian jurisdiction over the West.',
    ],
  },
  {
    period: '1869',
    events: [
      'Canada acquired the Northwest from the Hudson\'s Bay Company, contributing to the Red River Resistance led by Louis Riel.',
    ],
  },
  {
    period: '1867',
    events: [
      'The Dominion of Canada was formed with Ontario, Quebec, Nova Scotia, and New Brunswick.',
      'The British North America Act established foundational principles, including "Peace, Order and good Government."',
      'Confederation affirmed Canada as a constitutional monarchy under the Crown.',
      'Division of powers between Parliament and the provinces was set out (today largely in the Constitution Act, 1867).',
    ],
  },
  {
    period: '1864',
    events: ['Sir Samuel Leonard Tilley proposed the term "Dominion of Canada," inspired by Psalm 72:8.'],
  },
  {
    period: '1860s',
    events: ['The Parliament Buildings in Ottawa were completed.'],
  },
  {
    period: '1857',
    events: ['Queen Victoria chose Ottawa as the capital of Canada.'],
  },
  {
    period: '1854',
    events: [
      'Lieutenant Alexander Roberts Dunn became the first Canadian-born recipient of the Victoria Cross.',
    ],
  },
  {
    period: '1849',
    events: [
      'Sir Louis-Hippolyte La Fontaine became the first leader of a responsible government in Canada.',
    ],
  },
  {
    period: '1847–1848',
    events: ['Nova Scotia became the first British North American colony to attain responsible government.'],
  },
  {
    period: '1840',
    events: ['Upper and Lower Canada were united as the Province of Canada.'],
  },
  {
    period: '1833',
    events: ['Slavery was abolished throughout the British Empire.'],
  },
  {
    period: '1832',
    events: ['The Montreal Stock Exchange opened.'],
  },
  {
    period: '1815',
    events: ['Napoleon Bonaparte was defeated; the Napoleonic Wars drew to a close.'],
  },
  {
    period: '1814',
    events: ['The War of 1812 ended with the failure of the American invasion of British North America.'],
  },
  {
    period: '1812',
    events: [
      'The United States invaded British North America; Major-General Sir Isaac Brock defended Upper Canada.',
      'Laura Secord warned British forces of an American attack.',
    ],
  },
  {
    period: '1805',
    events: ['Britain\'s naval victory at the Battle of Trafalgar helped secure British sea power.'],
  },
  {
    period: '1800s–1980s',
    events: [
      'Many Indigenous children were required to attend residential schools — a painful legacy officially acknowledged by subsequent apologies and reconciliation efforts.',
    ],
  },
  {
    period: '1800s',
    events: ['Organized ice hockey developed in Canada.'],
  },
  {
    period: '1793',
    events: [
      'Upper Canada moved toward limiting slavery under Lieutenant Governor John Graves Simcoe.',
    ],
  },
  {
    period: '1792',
    events: ['Some Black Loyalists from Nova Scotia helped establish Freetown in Sierra Leone.'],
  },
  {
    period: '1791',
    events: [
      'The Constitutional Act divided Quebec into Upper Canada (later Ontario) and Lower Canada (later Quebec).',
      'The name Canada became official for these colonies.',
    ],
  },
  {
    period: '1780s',
    events: [
      'Black Loyalists and others fled slavery and conflict in the United States and settled in Nova Scotia and elsewhere.',
    ],
  },
  {
    period: '1776',
    events: [
      'The thirteen colonies declared independence as the United States.',
      'Joseph Brant (Thayendanegea) led many Mohawk and other Loyalists into British North America.',
    ],
  },
  {
    period: '1774',
    events: [
      'The Quebec Act preserved French civil law and Catholic religious rights for the people of Quebec.',
    ],
  },
  {
    period: '1764',
    events: [
      'The Treaty of Niagara extended the Covenant Chain alliance between the Crown and many Indigenous nations after the Conquest.',
    ],
  },
  {
    period: '1763',
    events: [
      'The Royal Proclamation by King George III set out Crown commitments respecting Indigenous territorial rights.',
    ],
  },
  {
    period: '1759',
    events: ['British forces defeated the French at the Battle of the Plains of Abraham outside Québec City.'],
  },
  {
    period: '1758',
    events: ['Halifax, Nova Scotia, elected the first legislative assembly in territory that became Canada.'],
  },
  {
    period: '1755–1763',
    events: [
      'Most Acadians were deported during the conflict between Britain and France — the Grand Dérangement (Great Upheaval).',
    ],
  },
  {
    period: '1701',
    events: ['France and Haudenosaunee (Iroquois) allies made peace in the Great Peace of Montreal.'],
  },
  {
    period: '1700s',
    events: ['The maple leaf grew into a recognizable symbol of Canadian identity.'],
  },
  {
    period: '1670',
    events: [
      'King Charles II granted the Hudson\'s Bay Company a charter over lands draining into Hudson Bay.',
    ],
  },
  {
    period: '1610',
    events: ['English settlement began on the Atlantic coast in what is now Canada.'],
  },
  {
    period: '1608',
    events: ['Samuel de Champlain founded a permanent French settlement at Québec City.'],
  },
  {
    period: '1604',
    events: [
      'French settlers (later known as Acadians) began settling in the future Maritime provinces.',
      'A French colony was established at Port-Royal (following an earlier attempt on St. Croix Island).',
    ],
  },
  {
    period: '1550s',
    events: ['The name Canada began appearing on European maps of North America.'],
  },
  {
    period: '1534–1542',
    events: [
      'Jacques Cartier made three voyages to the St. Lawrence region, claiming territory for the King of France.',
    ],
  },
  {
    period: '1497',
    events: [
      'John Cabot (Giovanni Caboto) explored Canada\'s Atlantic coast for England, strengthening English claims.',
    ],
  },
  {
    period: '1215',
    events: [
      'The Magna Carta was sealed in England — part of the centuries-old tradition of rights and freedoms inherited in Canada.',
    ],
  },
]
