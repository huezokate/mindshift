import { auth } from '@clerk/nextjs/server'

export type UserTier = 'anonymous' | 'free' | 'pro'

export const TIER_LIMITS = {
  anonymous: { quotesPerDay: 1, lensesPerQuote: 3, lensesPerDay: 3 },
  free:      { quotesPerDay: 3, lensesPerQuote: 5, lensesPerDay: 15 },
  pro:       { quotesPerDay: null, lensesPerQuote: null, lensesPerDay: null },
} as const

export async function getUserTier(): Promise<{ tier: UserTier; userId: string | null }> {
  const { userId, has } = await auth()
  if (!userId) return { tier: 'anonymous', userId: null }
  if (has({ plan: 'unlock_all_lenses_monthly' })) return { tier: 'pro', userId }
  return { tier: 'free', userId }
}
