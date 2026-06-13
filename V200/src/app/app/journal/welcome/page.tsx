'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'

// DRAFT — "Welcome to your journal" / first-entry-saved screen. The saved entry
// uses the standard lens-response card (avatar · name · quote · body · actions),
// per Figma 470:2455.
export default function JournalWelcomePage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '52px 24px 32px', gap: 22 }}>
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 420, gap: 8, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', margin: 0 }}>
          Welcome to your journal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '32px', letterSpacing: '-0.5px', color: 'var(--text-h1)', margin: 0 }}>
          Your first reflection is saved.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-sub)', margin: '6px 0 0' }}>
          This is your private space — every vent and the lens that answered it lives here, only for you.
        </p>
      </div>

      {/* Standard saved-entry card */}
      <div
        className="w-full"
        style={{
          maxWidth: 420, background: 'var(--card-bg)', border: '1.5px solid var(--pink)',
          borderRadius: 'var(--card-radius)', padding: '16px 18px', filter: 'var(--card-filter, none)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-meta)' }}>Today · saved</span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-sub)', border: '1px solid var(--text-sub)', borderRadius: 999, padding: '2px 8px' }}>Private</span>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 14, lineHeight: '21px', color: 'var(--text-body)', margin: 0 }}>
          “I keep telling myself I’m not ready to start the thing I actually want to do.”
        </p>

        <div style={{ borderTop: '1px dashed var(--input-divider)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg)', border: '1.5px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--cyan)' }}>MA</span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--cyan)' }}>Through Maya Angelou</span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, lineHeight: '21px', color: 'var(--pink)', margin: 0 }}>
            “There is no greater agony than bearing an untold story inside you.”
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '21px', color: 'var(--text-body)', margin: 0 }}>
            You are more ready than the fear lets you feel. Start before you believe you can — the believing catches up.
          </p>
          <div className="flex items-center" style={{ gap: 10, marginTop: 2 }}>
            {['✶', '✦', '↗'].map((g, i) => (
              <span key={i} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--pink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)', fontSize: 13 }}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      <Link href="/app/journal" style={{ textDecoration: 'none', width: '100%', maxWidth: 420 }}>
        <button
          style={{
            background: 'var(--btn-bg)', color: 'var(--btn-color)', borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
            borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)', borderRadius: 'var(--btn-radius)', padding: '14px 12px',
            fontFamily: 'var(--font-btn)', fontWeight: 700, fontSize: 14, letterSpacing: 'var(--btn-letter-spacing, -0.5px)',
            cursor: 'pointer', filter: 'var(--btn-filter, none)', width: '100%',
          }}
        >
          See my journal →
        </button>
      </Link>
    </div>
  )
}
