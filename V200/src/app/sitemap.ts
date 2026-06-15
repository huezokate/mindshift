import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://minds-shift.com'
  const now = new Date()
  // Marketing landing is the indexed surface; product pages are robots-blocked.
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ]
}
