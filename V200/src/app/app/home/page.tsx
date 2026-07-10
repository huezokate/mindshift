import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/nav/AppHeader'

// Returning-user home / hub (ported from the feat/mindmap-flow draft).
// Signed-in users land here from /app instead of re-running the entry flow:
// jump to a new vent, the mindmap, or the journal.
const ACTIONS = [
  { href: '/app/onboarding', eyebrow: 'Start', title: 'New vent', body: 'Something on your mind? Vent it and pick a lens.' },
  { href: '/app/mindmap', eyebrow: 'Your map', title: 'Visit your map', body: 'See your areas of life and how the year is moving.' },
  { href: '/app/journal-v2', eyebrow: 'Archive', title: 'Open journal', body: 'Every reflection you’ve saved, in one place.' },
]

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) redirect('/app/theme-select')

  const user = await currentUser()
  const firstName = user?.firstName ?? null

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '0 24px 32px', gap: 24 }}>
      <AppHeader />
      <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 6, paddingTop: 24 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', margin: 0 }}>
          {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: '34px', letterSpacing: '-0.5px', color: 'var(--text-h1)', margin: 0 }}>
          Where to today?
        </h1>
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
