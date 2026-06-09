'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'

// DRAFT — "Welcome to your journal" / first-entry-saved screen. Shown the first
// time a user lands in the journal after saving their first vent + lens quote.
export default function JournalWelcomePage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '56px 24px 32px', gap: 24 }}>
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 420, gap: 8, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', margin: 0 }}>
          Welcome to your journal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: '34px', letterSpacing: '-0.5px', color: 'var(--text-h1)', margin: 0 }}>
          Your first reflection is saved.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-sub)', margin: '6px 0 0' }}>
          This is your private space — every vent and the lens that answered it lives here, only for you.
        </p>
      </div>

      {/* First saved entry preview */}
      <div
        className="w-full"
        style={{
          maxWidth: 420, background: 'var(--card-bg)', border: '1.5px solid var(--pink)',
          borderRadius: 'var(--card-radius)', padding: '20px 22px', filter: 'var(--card-filter, none)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-meta)', margin: '0 0 8px' }}>
          Today · saved
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '21px', color: 'var(--text-body)', margin: '0 0 14px', fontStyle: 'italic' }}>
          “I keep telling myself I’m not ready to start the thing I actually want to do.”
        </p>
        <div style={{ borderTop: '1px dashed var(--input-divider)', paddingTop: 12 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--cyan)', margin: '0 0 4px' }}>
            Through Maya Angelou
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, lineHeight: '22px', color: 'var(--text-h1)', margin: 0 }}>
            “There is no greater agony than bearing an untold story inside you. You are more ready than the fear lets you feel.”
          </p>
        </div>
      </div>

      <Link href="/app/journal" style={{ textDecoration: 'none', width: '100%', maxWidth: 420 }}>
        <button
          style={{
            background: 'var(--btn-bg)', color: 'var(--btn-color)',
            borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)', borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
            borderRadius: 'var(--btn-radius)', padding: '14px 12px', fontFamily: 'var(--font-btn)', fontWeight: 700,
            fontSize: 14, letterSpacing: 'var(--btn-letter-spacing, -0.5px)', cursor: 'pointer',
            filter: 'var(--btn-filter, none)', width: '100%',
          }}
        >
          See my journal →
        </button>
      </Link>
    </div>
  )
}
