import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserTier, TIER_LIMITS } from '@/lib/user-tier'
import AppHeader from '@/components/nav/AppHeader'
import SignOutButton from '@/components/SignOutButton'

// Basic account surface reached from the header dropdown. Server component so the
// tier (incl. the comp allowlist, which only resolves server-side) is accurate.
// Anon users are funneled here via sign-in, but we also redirect defensively.
export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?reason=profile&redirect_url=/app/profile')

  const [{ tier }, user] = await Promise.all([getUserTier(), currentUser()])
  const isPro = tier === 'pro'

  const email =
    user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null
  const username = user?.username ? `@${user.username}` : null
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  const label: React.CSSProperties = {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
    letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 10,
  }
  const value: React.CSSProperties = {
    fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.5, color: 'var(--text-body)',
  }
  const meta: React.CSSProperties = {
    fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.5, color: 'var(--text-sub)',
  }
  const card: React.CSSProperties = {
    background: 'var(--card-bg)',
    borderTop: 'var(--card-bt)', borderLeft: 'var(--card-bl)',
    borderRight: 'var(--card-br)', borderBottom: 'var(--card-bb)',
    borderRadius: 'var(--card-radius)', padding: 20,
    boxShadow: 'var(--card-shadow)', filter: 'var(--card-filter, none)',
    display: 'flex', flexDirection: 'column', gap: 6,
  }

  return (
    <div className="flex flex-col items-center w-full">
      <AppHeader />
      <main
        className="w-full flex flex-col"
        style={{ maxWidth: 440, padding: '24px 24px 40px', gap: 20 }}
      >
        <h1
          className="uppercase"
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28,
            letterSpacing: 1.44, lineHeight: '32px', color: 'var(--cyan)', margin: 0,
          }}
        >
          Profile
        </h1>

        {/* Account */}
        <section style={card}>
          <span style={label}>Account</span>
          {username && <span style={value}>{username}</span>}
          {email && <span style={value}>{email}</span>}
          {!username && !email && <span style={meta}>Signed in</span>}
          {memberSince && <span style={meta}>Member since {memberSince}</span>}
        </section>

        {/* Plan */}
        <section style={card}>
          <span style={label}>Plan</span>
          <span
            className="uppercase"
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
              letterSpacing: 1, color: isPro ? 'var(--green)' : 'var(--violet)',
            }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
          <span style={meta}>
            {isPro
              ? 'Unlimited lenses and quotes.'
              : `${TIER_LIMITS.free.quotesPerDay} quotes a day · ${TIER_LIMITS.free.lensesPerQuote} lenses per quote.`}
          </span>
        </section>

        <SignOutButton />
      </main>
    </div>
  )
}
