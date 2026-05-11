'use client'
import { useSearchParams } from 'next/navigation'

const REASONS: Record<string, { headline: string; sub: string }> = {
  lens_limit:  { headline: 'You\'ve used all 3 lenses on this vent.', sub: 'Create a free account to unlock more perspectives.' },
  vent_limit:  { headline: 'You\'ve used your free vent for today.', sub: 'Create a free account for 3 vents per day.' },
  save:        { headline: 'Save this perspective to your journal.', sub: 'Create a free account to keep your insights.' },
  journal:     { headline: 'Your journal is waiting.', sub: 'Sign in to see your saved perspectives.' },
}

const DEFAULT = { headline: 'Unlock your full potential.', sub: 'Free account. No credit card.' }

const BENEFITS = [
  '3 vents per day · 5 lenses each',
  'Save to your personal journal',
  'Revisit and apply new lenses anytime',
]

export default function AuthBanner() {
  const params = useSearchParams()
  const reason = params.get('reason') ?? ''
  const { headline, sub } = REASONS[reason] ?? DEFAULT

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: '20px 24px',
        marginBottom: 16,
      }}
    >
      <p style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 1,
        color: 'var(--cyan)',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        {headline}
      </p>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text-sub)',
        marginBottom: 14,
        letterSpacing: '0.4px',
      }}>
        {sub}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {BENEFITS.map(b => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--cyan)', fontSize: 12, flexShrink: 0 }}>▸</span>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-body)',
              letterSpacing: '0.4px',
            }}>
              {b}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
