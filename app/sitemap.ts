import { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'
import { getPublishedSlugs } from '@/lib/blog/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: { slug: string }[] = []
  try {
    slugs = await getPublishedSlugs()
  } catch {
    // Build should not fail if the database is unreachable during image/build creation.
    // Runtime sitemap requests will include blog entries once Postgres is reachable.
    slugs = []
  }

  const blogEntries = slugs.map(({ slug }) => ({
    url: siteUrl(`/blog/${slug}`),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: siteUrl('/'), lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: siteUrl('/blog'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: siteUrl('/pricing'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: siteUrl('/faq'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: siteUrl('/contact'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: siteUrl('/study/complete-questions'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: siteUrl('/privacy'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: siteUrl('/terms'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...blogEntries,
  ]
}
