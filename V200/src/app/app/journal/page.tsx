import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import SessionCard from '@/components/SessionCard'
import Link from 'next/link'

export default async function JournalPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/app/journal')

  const db = getSupabaseAdmin()
  const { data: sessions } = await db
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
    .limit(50)

  const entries = sessions ?? []

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 440, padding: '40px 24px 40px' }}>

        {/* Header */}
        <div
          style={{
            background: 'var(--card-bg)',
            borderTop: 'var(--card-bt)',
            borderLeft: 'var(--card-bl)',
            borderRight: 'var(--card-br)',
            borderBottom: 'var(--card-bb)',
            borderRadius: 'var(--card-radius)',
            padding: '20px 24px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <p
            className="uppercase text-center"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: 2, color: 'var(--cyan)', lineHeight: 1 }}
          >
            Journal
          </p>
          <p
            className="text-center"
            style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}
          >
            Your saved perspectives
          </p>
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="flex flex-col items-center gap-4 text-center" style={{ paddingTop: 32 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-sub)', lineHeight: '20px' }}>
              No entries yet. Vent something and save your first perspective.
            </p>
            <Link
              href="/app/onboarding"
              className="uppercase"
              style={{
                fontFamily: 'var(--font-btn)',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 'var(--btn-letter-spacing, 3px)',
                color: 'var(--btn-color)',
                background: 'var(--btn-bg)',
                borderTop: 'var(--btn-bt)',
                borderLeft: 'var(--btn-bl)',
                borderRight: 'var(--btn-br)',
                borderBottom: 'var(--btn-bb)',
                borderRadius: 'var(--btn-radius)',
                padding: '14px 28px',
                boxShadow: 'var(--btn-shadow)',
                display: 'inline-block',
              }}
            >
              Start now →
            </Link>
          </div>
        )}

        {/* Session list */}
        {entries.map(session => (
          <SessionCard
            key={session.id}
            ventText={session.vent_text}
            createdAt={session.created_at}
            lensResponses={session.lens_responses ?? []}
          />
        ))}

        {/* Add more */}
        {entries.length > 0 && (
          <Link
            href="/app/onboarding"
            className="w-full uppercase text-center"
            style={{
              fontFamily: 'var(--font-btn)',
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 'var(--btn-letter-spacing, 3px)',
              color: 'var(--btn-secondary-color, var(--text-body))',
              background: 'var(--btn-secondary-bg)',
              borderTop: 'var(--btn-bt)',
              borderLeft: 'var(--btn-bl)',
              borderRight: 'var(--btn-br)',
              borderBottom: 'var(--btn-bb)',
              borderRadius: 'var(--btn-radius)',
              padding: '14px',
              boxShadow: 'var(--btn-secondary-shadow)',
              display: 'block',
            }}
          >
            New session
          </Link>
        )}

      </div>
    </div>
  )
}
