import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/lib/theme'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const SITE_URL = 'https://minds-shift.com'
const TITLE = 'Minds Shift — AI journaling that shifts your perspective'
const DESCRIPTION =
  'Vent what’s on your mind, pick a lens from history’s greatest minds, and get an AI reframe that shifts how you think. Journaling + mind mapping for mental clarity, self-reflection, and better thinking.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · Minds Shift',
  },
  description: DESCRIPTION,
  applicationName: 'Minds Shift',
  authors: [{ name: 'Kate Huezo' }],
  creator: 'Kate Huezo',
  publisher: 'Minds Shift',
  category: 'health',
  keywords: [
    'AI journaling app',
    'perspective shift app',
    'cognitive reframing',
    'reframe your thinking',
    'journaling for mental wellness',
    'self-reflection app',
    'mind mapping for self-reflection',
    'thinking patterns',
    'mental clarity',
    'CBT-style journaling',
    'overthinking help',
    'vent and reflect',
    'thinking tool',
    'life planning app',
    'emotional well-being',
    'advice from historical figures',
    'mindset shift',
    'better thinking',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: 'Minds Shift',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Favicon comes from app/icon.svg (App Router auto-detects it).
}

// Structured data — helps search engines AND AI agents understand what Minds Shift
// is. WebApplication (the product) + Organization (the brand).
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Minds Shift',
      url: SITE_URL,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, iOS, Android',
      description: DESCRIPTION,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'AI perspective shift through historical-figure lenses',
        'Journaling and venting',
        'Cognitive reframing of thoughts',
        'Visual mind mapping for life planning',
        'Tracking how your thinking shifts over time',
      ],
      audience: {
        '@type': 'Audience',
        audienceType: 'People seeking mental clarity, self-reflection, and better thinking',
      },
    },
    {
      '@type': 'Organization',
      name: 'Minds Shift',
      url: SITE_URL,
      email: 'hello@minds-shift.com',
      description:
        'Minds Shift turns venting into perspective — AI-powered reframes through history’s greatest minds, plus visual mind mapping for self-reflection and life planning.',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Google Material Symbols (Sharp) — the project's single icon source.
            Never hand-roll icon SVGs; render <Icon name="…" /> instead. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('ms_theme');
            if (t) document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}} />
        {/* Structured data for search + AI agents */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className="min-h-full">
        <ClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
