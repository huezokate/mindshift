'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// GA4 — marketing landing only. The product lives on app.minds-shift.com and
// gets its own (very different) instrumentation, so we host-gate here: GA never
// loads on the app subdomain. Localhost / previews DO load it, which is handy
// for verifying the tag fires before shipping.
const GA_ID = 'G-W6QD19PTZ8'

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(!window.location.hostname.startsWith('app.'))
  }, [])

  if (!enabled) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
