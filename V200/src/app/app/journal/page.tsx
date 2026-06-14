import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import JournalClient from '@/components/JournalClient'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

const PAGE_SIZE = 10

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
          <Icon name="camera" size={24} />
          <span style={labelStyle}>Try another Lens</span>
        </Link>
        <Link href="/app/journal" style={active === 'journal' ? activeStyle : base}>
          <Icon name="auto_stories" size={24} />
          <span style={labelStyle}>Journal</span>
        </Link>
        <Link href="/app/onboarding" style={active === 'onboarding' ? activeStyle : base}>
          <Icon name="person" size={24} />
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
