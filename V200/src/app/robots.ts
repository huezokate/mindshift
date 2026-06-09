import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dev/', '/sign-in', '/sign-up'],
    },
    sitemap: 'https://minds-shift.com/sitemap.xml',
    host: 'https://minds-shift.com',
  }
}
