'use client'
import { useEffect } from 'react'
import { useTheme } from '@/lib/theme'
import { BottomNav, BottomNavSpacer } from '@/components/app/BottomNav'

// DRAFT — browsable journal feed for the pro experience. Sample entries cover
// the three states: private vent w/ no lens, vent + lens (private), and a
// shared lens entry. Standard card per Figma 470:2455. The real Supabase-backed
// server page is preserved in page.real.tsx.bak (restore when wiring data).
type Entry = {
  id: string
  date: string
  vent: string
  lens?: { name: string; initials: string; quote: string; response: string }
  shared?: string | null
}

const ENTRIES: Entry[] = [
  {
    id: 'e3',
    date: 'Today',
    vent: 'I keep saying yes to things I don’t want to do and then resenting everyone for it.',
    lens: {
      name: 'Socrates',
      initials: 'So',
      quote: 'Is it the asking that traps you — or your fear of what a “no” might cost?',
      response:
        'You call it resentment, but notice: no one forced the yes. What would you have to believe about yourself to say no and still feel safe? Sit with that before the next ask comes.',
    },
    shared: null,
  },
  {
    id: 'e2',
    date: '2 days ago',
    vent: 'I’m scared I’ve already missed my window to do the thing I actually care about.',
    lens: {
      name: 'Maya Angelou',
      initials: 'MA',
      quote: 'There is no greater agony than bearing an untold story inside you.',
      response:
        'Listen to me: the window is not a window. It is a door, and it opens from your side. You are not late — you are arriving exactly when you decided to stop waiting for permission.',
    },
    shared: 'Instagram',
  },
  {
    id: 'e1',
    date: '5 days ago',
    vent: 'Just need to get this out of my head before bed. Long day. Brain is loud. That’s all.',
    shared: null,
  },
]

export default function JournalPage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '48px 20px 24px' }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 6, marginBottom: 18 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', margin: 0 }}>
          Your journal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '32px', letterSpacing: '-0.5px', color: 'var(--text-h1)', margin: 0 }}>
          Everything you’ve let out.
        </h1>
      </div>

      <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 16 }}>
        {ENTRIES.map(e => <EntryCard key={e.id} entry={e} />)}
      </div>

      <BottomNavSpacer />
      <BottomNav />
    </div>
  )
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)', border: '1.5px solid var(--pink)', borderRadius: 'var(--card-radius)',
        padding: '16px 18px', filter: 'var(--card-filter, none)', display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-meta)' }}>
          {entry.date}
        </span>
        <PrivacyBadge shared={entry.shared} hasLens={!!entry.lens} />
      </div>

      <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 14, lineHeight: '21px', color: 'var(--text-body)', margin: 0 }}>
        “{entry.vent}”
      </p>

      {entry.lens ? (
        <div style={{ borderTop: '1px dashed var(--input-divider)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'var(--bg)', border: '1.5px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--cyan)' }}>{entry.lens.initials}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--cyan)' }}>
              Through {entry.lens.name}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, lineHeight: '21px', color: 'var(--pink)', margin: 0 }}>
            “{entry.lens.quote}”
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '21px', color: 'var(--text-body)', margin: 0 }}>
            {entry.lens.response}
          </p>
          <div className="flex items-center" style={{ gap: 10, marginTop: 2 }}>
            {['save', 'decorate', 'share'].map(a => (
              <span key={a} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--pink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)', fontSize: 13 }}>
                {a === 'save' ? '✶' : a === 'decorate' ? '✦' : '↗'}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between" style={{ borderTop: '1px dashed var(--input-divider)', paddingTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)' }}>No lens — just for you.</span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--cyan)' }}>Pick a lens →</span>
        </div>
      )}
    </div>
  )
}

function PrivacyBadge({ shared, hasLens }: { shared?: string | null; hasLens: boolean }) {
  const label = shared ? `Shared · ${shared}` : hasLens ? 'Private' : 'Private · no lens'
  const color = shared ? 'var(--green)' : 'var(--text-sub)'
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color, border: `1px solid ${color}`, borderRadius: 999, padding: '2px 8px' }}>
      {label}
    </span>
  )
}
