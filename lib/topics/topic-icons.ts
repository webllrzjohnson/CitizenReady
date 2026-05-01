/**
 * Maps a topic slug or name to an emoji icon + a soft background colour for the icon tile.
 * Matching is done by scanning keywords in the slug (lowercase, hyphens become spaces).
 * Falls back to a generic 📖 icon if nothing matches.
 */

interface TopicIconConfig {
  icon: string
  bg: string   // Tailwind bg class for the icon tile
  text: string // Tailwind text/emoji colour class (optional — emojis are self-coloured)
}

const ICON_RULES: { keywords: string[]; config: TopicIconConfig }[] = [
  {
    keywords: ['rights', 'responsibilities', 'charter', 'freedoms'],
    config: { icon: '📜', bg: 'bg-amber-50', text: 'text-amber-700' },
  },
  {
    keywords: ['government', 'democracy', 'politics', 'parliament', 'federal'],
    config: { icon: '🏛️', bg: 'bg-blue-50', text: 'text-blue-700' },
  },
  {
    keywords: ['history', 'historical', 'heritage', 'confederation'],
    config: { icon: '🗓️', bg: 'bg-orange-50', text: 'text-orange-700' },
  },
  {
    keywords: ['indigenous', 'first nations', 'metis', 'inuit', 'aboriginal'],
    config: { icon: '🌿', bg: 'bg-green-50', text: 'text-green-700' },
  },
  {
    keywords: ['geography', 'regions', 'provinces', 'territories', 'landscape'],
    config: { icon: '🗺️', bg: 'bg-teal-50', text: 'text-teal-700' },
  },
  {
    keywords: ['justice', 'law', 'legal', 'court', 'criminal'],
    config: { icon: '⚖️', bg: 'bg-violet-50', text: 'text-violet-700' },
  },
  {
    keywords: ['symbol', 'emblem', 'flag', 'anthem', 'identity', 'maple'],
    config: { icon: '🍁', bg: 'bg-red-50', text: 'text-red-700' },
  },
  {
    keywords: ['election', 'vote', 'voting', 'electoral'],
    config: { icon: '🗳️', bg: 'bg-slate-50', text: 'text-slate-600' },
  },
  {
    keywords: ['economy', 'trade', 'economic', 'industry', 'resource'],
    config: { icon: '💼', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  },
  {
    keywords: ['modern', 'contemporary', 'today', 'current'],
    config: { icon: '🌟', bg: 'bg-sky-50', text: 'text-sky-700' },
  },
  {
    keywords: ['citizenship', 'applying', 'application', 'naturali'],
    config: { icon: '📋', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  },
  {
    keywords: ['canadian', 'who are', 'diversity', 'multicultur', 'people'],
    config: { icon: '🧑‍🤝‍🧑', bg: 'bg-pink-50', text: 'text-pink-700' },
  },
]

const FALLBACK: TopicIconConfig = { icon: '📖', bg: 'bg-gray-100', text: 'text-gray-500' }

export function getTopicIcon(slug: string): TopicIconConfig {
  const normalized = slug.toLowerCase().replace(/-/g, ' ')
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return rule.config
    }
  }
  return FALLBACK
}
