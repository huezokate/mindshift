import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://minds-shift.com'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/app/choose-ui`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]
}
