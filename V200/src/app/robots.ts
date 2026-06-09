import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the marketing landing as the clean indexed entry; the product
      // pages (and auth/api) stay out of the index.
      disallow: ['/app/', '/api/', '/sign-in', '/sign-up'],
    },
    sitemap: 'https://minds-shift.com/sitemap.xml',
    host: 'https://minds-shift.com',
  }
}
