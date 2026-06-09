import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import JournalClient from '@/components/JournalClient'
import Link from 'next/link'

const PAGE_SIZE = 10

// ─── SVG icons ────────────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M20 5h-2.83L15 3H9L6.83 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/>
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )
}

// ─── Footer nav ───────────────────────────────────────────────────────────────

function FooterNav({ active }: { active: 'lens' | 'journal' | 'onboarding' }) {
  const base = {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '0 8px',
    borderTop: '4px solid var(--cyan)',
    borderLeft: '4px solid var(--cyan)',
    borderRight: '1px solid var(--cyan)',
    borderBottom: '1px solid var(--cyan)',
    borderRadius: 'var(--card-radius)',
    color: 'var(--cyan)',
    textDecoration: 'none',
  } as const

  const activeStyle = {
    ...base,
    borderTop: '4px solid var(--pink)',
    borderLeft: '4px solid var(--pink)',
    borderRight: '1px solid var(--pink)',
    borderBottom: '1px solid var(--pink)',
    color: 'var(--pink)',
  } as const

  const labelStyle = {
    fontFamily: 'var(--font-btn)' as const,
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    lineHeight: '14px',
    textAlign: 'center' as const,
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: 'var(--bg)', borderTop: '1px solid rgba(255,255,255,0.06)', zIndex: 50 }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', gap: 4, padding: '0 4px', height: 72 }}>
        <Link href="/app/lens" style={active === 'lens' ? activeStyle : base}>
          <CameraIcon />
          <span style={labelStyle}>Try another Lens</span>
        </Link>
        <Link href="/app/journal" style={active === 'journal' ? activeStyle : base}>
          <BookIcon />
          <span style={labelStyle}>Journal</span>
        </Link>
        <Link href="/app/vent" style={active === 'onboarding' ? activeStyle : base}>
          <PersonIcon />
          <span style={labelStyle}>Continue</span>
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JournalPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/app/journal')

  const db = getSupabaseAdmin()

  // Fetch one extra row to determine if there are more pages
  const { data } = await db
    .from('vent_sessions')
    .select(`
      id,
      vent_text,
      theme,
      created_at,
      lens_responses (
        id,
        figure_id,
        response_text,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE)  // PAGE_SIZE + 1 rows

  const rows = data ?? []
  const initialHasMore = rows.length > PAGE_SIZE
  const initialSessions = initialHasMore ? rows.slice(0, PAGE_SIZE) : rows

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 440, padding: '32px 20px 100px' }}>

        {/* Header */}
        <div style={{ background: 'var(--hcard-bg)', borderTop: 'var(--hcard-bt)', borderLeft: 'var(--hcard-bl)', borderRight: 'var(--hcard-br)', borderBottom: 'var(--hcard-bb)', borderRadius: 'var(--hcard-radius)', padding: 'var(--hcard-padding)' }}>
          <p className="uppercase text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: 2, color: 'var(--cyan)', lineHeight: 1 }}>
            Journal
          </p>
          <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', marginTop: 6, letterSpacing: '0.4px' }}>
            Your saved perspectives
          </p>
        </div>

        {/* Session list + infinite scroll */}
        <JournalClient
          initialSessions={initialSessions}
          initialHasMore={initialHasMore}
        />

      </div>

      <FooterNav active="journal" />
    </div>
  )
}
