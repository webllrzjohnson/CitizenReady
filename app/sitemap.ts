import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://citizenready.ca',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://citizenready.ca/login',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://citizenready.ca/signup',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: 'https://citizenready.ca/study/complete-questions',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://citizenready.ca/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ]
}
