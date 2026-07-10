'use client'
// Inline auth affordance for the entry screens (theme-select, onboarding).
// Flow correction #4 (FigJam 95:2186) + button color rule (Kate 2026-07-10):
//   Signed out → "Log in" = secondary (positive-ish blue family) and
//   "Sign up" = secondary2 (red family), equal footprint, design-system Button.
//   Signed in  → the greeting card: a primary Button in the Figma username
//   form (label + @subtext, node 397:3561) that jumps to the welcome-back hub
//   (/app/home — the returning-user home shipped 2026-07-08).
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Button from '@/components/ui/Button'

type Props = { maxWidth?: number; className?: string }

export default function EntryAuthRow({ maxWidth, className }: Props) {
  const router = useRouter()
  const { isSignedIn, user } = useUser()

  // Figma shows an @handle as the subtext; fall back through the friendliest
  // identifiers we have. Emails stay un-prefixed (no "@kate@…").
  const subtext = user?.username
    ? `@${user.username}`
    : user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? undefined

  // Signed in — the greeting card into the app.
  if (isSignedIn) {
    return (
      <div className={className} style={{ width: '100%', maxWidth }}>
        <Button variant="primary" fullWidth subtext={subtext} onClick={() => router.push('/app/home')}>
          Welcome back
        </Button>
      </div>
    )
  }

  // Signed out (and the undefined/loading state) — equal Log in / Sign up.
  return (
    <div className={className} style={{ width: '100%', maxWidth, display: 'flex', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <Button variant="secondary" fullWidth onClick={() => router.push('/sign-in')}>
          Log in
        </Button>
      </div>
      <div style={{ flex: 1 }}>
        <Button variant="secondary2" fullWidth onClick={() => router.push('/sign-up')}>
          Sign up
        </Button>
      </div>
    </div>
  )
}
