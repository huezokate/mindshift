import { auth, currentUser } from '@clerk/nextjs/server'

export type UserTier = 'anonymous' | 'free' | 'pro'

export const TIER_LIMITS = {
  anonymous: { quotesPerDay: 1, lensesPerQuote: 3, lensesPerDay: 3 },
  free:      { quotesPerDay: 3, lensesPerQuote: 5, lensesPerDay: 15 },
  pro:       { quotesPerDay: null, lensesPerQuote: null, lensesPerDay: null },
} as const

// Comped accounts — treated as `pro` regardless of Clerk billing plan.
// Recruited / test users get everything free (the roadmap comp mechanism).
// Compared case-insensitively. Add emails here to grant full access.
const COMP_EMAILS = new Set<string>([
  'test@minds-shift.com',
])

export async function getUserTier(): Promise<{ tier: UserTier; userId: string | null }> {
  const { userId, has } = await auth()
  if (!userId) return { tier: 'anonymous', userId: null }
  if (has({ plan: 'unlock_all_lenses_monthly' })) return { tier: 'pro', userId }
  // Comp allowlist — only resolve the email when we still might upgrade them.
  if (COMP_EMAILS.size > 0) {
    const user = await currentUser()
    const email =
      user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user?.emailAddresses[0]?.emailAddress
    if (email && COMP_EMAILS.has(email.toLowerCase())) return { tier: 'pro', userId }
  }
  return { tier: 'free', userId }
}
