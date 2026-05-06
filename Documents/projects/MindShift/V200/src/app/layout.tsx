import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindShift — Shift Your Perspective',
  description: 'A perspective-mapping tool that visualizes your 5-year vision as an interactive mind map.',
}

// ClerkProvider re-enabled once .env.local is configured
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
