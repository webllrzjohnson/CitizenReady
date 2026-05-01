/**
 * Canonical site origin for sitemap, robots, and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL in production (Vercel + Supabase auth callbacks).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) return raw.replace(/\/+$/, '')
  return 'https://citizenready.ca'
}

/** Absolute URL for a path starting with `/`. */
export function siteUrl(path: string = '/'): string {
  const base = getSiteUrl()
  if (!path || path === '/') return base
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
