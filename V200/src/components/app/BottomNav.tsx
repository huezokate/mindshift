'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Persistent bottom navigation for the signed-in (pro) experience — stitches
// the main surfaces together. Token-driven so it works in every theme.
const ICONS: Record<string, string> = {
  home: 'M12 3.2 3 10.2V21h6v-6h6v6h6V10.2L12 3.2Z',
  map: 'M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z',
  journal: 'M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1.4.9L13 18.7l-4.6 2.2A1 1 0 0 1 7 20V5a2 2 0 0 1 2-2Zm0 2v13l4-1.9 4 1.9V5H6Z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z',
}

const TABS = [
  { href: '/app/home', label: 'Home', icon: 'home' },
  { href: '/app/mindmap/map', label: 'Map', icon: 'map' },
  { href: '/app/journal', label: 'Journal', icon: 'journal' },
  { href: '/app/profile', label: 'Profile', icon: 'profile' },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        background: 'var(--card-bg)',
        borderTop: '1.5px solid var(--pink)',
        padding: '8px 8px max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {TABS.map(t => {
        const active = path === t.href || (t.href !== '/app/home' && path.startsWith(t.href))
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              color: active ? 'var(--pink)' : 'var(--text-sub)',
              padding: '4px 0',
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d={ICONS[t.icon]} />
            </svg>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: active ? 700 : 400, letterSpacing: 0.2 }}>
              {t.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

// Spacer so fixed nav doesn't cover page content. Place at the bottom of pages.
export function BottomNavSpacer() {
  return <div aria-hidden style={{ height: 76 }} />
}
