'use client'
// Inline auth affordance for the entry screens (theme-select, onboarding).
// Flow correction #4 (FigJam 95:2186): make sign-up visible for anon users and
// show the user's name once signed in. Token-driven so all three themes follow.
//
// Signed out → two equal-footprint links: "Log in" (secondary) + "Sign up"
// (primary) so log-in keeps equal focus while sign-up reads as the nudge.
// Signed in → a compact greeting with the user's name. No auth links.
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import Icon from '@/components/ui/Icon'

type Props = { maxWidth?: number; className?: string }

const PILL: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  fontFamily: 'var(--font-btn)',
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: 'var(--btn-letter-spacing, 2px)',
  textTransform: 'uppercase',
  borderRadius: 'var(--btn-radius)',
  padding: '12px 8px',
}

export default function EntryAuthRow({ maxWidth, className }: Props) {
  const { isSignedIn, user } = useUser()

  const name =
    user?.firstName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    null

  // Signed in — greeting only.
  if (isSignedIn) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          maxWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          letterSpacing: '0.4px',
        }}
      >
        <Icon name="person" size={18} style={{ color: 'var(--cyan)' }} />
        <span>Hi, {name ?? 'there'}</span>
      </div>
    )
  }

  // Signed out (and the undefined/loading state) — equal Log in / Sign up.
  return (
    <div
      className={className}
      style={{ width: '100%', maxWidth, display: 'flex', gap: 10 }}
    >
      <Link
        href="/sign-in"
        className="uppercase transition-opacity hover:opacity-80"
        style={{
          ...PILL,
          color: 'var(--btn-secondary-color, var(--text-body))',
          background: 'var(--btn-secondary-bg)',
          borderTop: 'var(--btn-bt)',
          borderLeft: 'var(--btn-bl)',
          borderRight: 'var(--btn-br)',
          borderBottom: 'var(--btn-bb)',
          boxShadow: 'var(--btn-secondary-shadow)',
        }}
      >
        Log in
      </Link>
      <Link
        href="/sign-up"
        className="uppercase transition-opacity hover:opacity-80"
        style={{
          ...PILL,
          color: 'var(--btn-color)',
          background: 'var(--btn-bg)',
          borderTop: 'var(--btn-bt)',
          borderLeft: 'var(--btn-bl)',
          borderRight: 'var(--btn-br)',
          borderBottom: 'var(--btn-bb)',
          boxShadow: 'var(--btn-shadow)',
        }}
      >
        Sign up
      </Link>
    </div>
  )
}
