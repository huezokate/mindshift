'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'

// DRAFT — returning-PREMIUM home / hub. Maps to the architecture's
// "Existing user (premium)" page: jump to a new vent, the map, or the journal.
const ACTIONS = [
  { href: '/app/vent',         eyebrow: 'Start',   title: 'New vent',     body: 'Something on your mind? Vent it and pick a lens.' },
  { href: '/app/mindmap/map',  eyebrow: 'Your map', title: 'Visit your map', body: 'See your areas of life and how the year is moving.' },
  { href: '/app/journal',      eyebrow: 'Archive', title: 'Open journal', body: 'Every reflection you’ve saved, in one place.' },
]

export default function PremiumHomePage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '56px 24px 32px', gap: 24 }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 6 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', margin: 0 }}>
            Welcome back
          </p>
          <span
            style={{
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 1,
              textTransform: 'uppercase', color: 'var(--green)', border: '1px solid var(--green)',
              borderRadius: 999, padding: '2px 8px',
            }}
          >
            Premium
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: '34px', letterSpacing: '-0.5px', color: 'var(--text-h1)', margin: 0 }}>
          Where to today?
        </h1>

        {/* Streak chip */}
        <div
          style={{
            marginTop: 10, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--card-bg)', border: '1.5px solid var(--pink)', borderRadius: 999,
            padding: '6px 14px', filter: 'var(--card-filter, none)',
          }}
        >
          <span style={{ color: 'var(--pink)' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}>
            <strong>3-week</strong> reflection streak
          </span>
        </div>
      </div>

      <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 14 }}>
        {ACTIONS.map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none', display: 'block', filter: 'var(--card-filter, none)' }}>
            <div
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--pink)',
                borderRadius: 'var(--card-radius)', padding: '18px 20px',
              }}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--cyan)', margin: 0 }}>
                {a.eyebrow}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-0.3px', color: 'var(--text-h1)', margin: '5px 0 6px' }}>
                {a.title}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '19px', color: 'var(--text-sub)', margin: 0 }}>
                {a.body}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
