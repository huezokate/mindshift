import { auth, currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from './supabase'

export type UserTier = 'anonymous' | 'free' | 'pro'

export const TIER_LIMITS = {
  anonymous: { quotesPerDay: 1, lensesPerQuote: 3, lensesPerDay: 3 },
  free:      { quotesPerDay: 3, lensesPerQuote: 5, lensesPerDay: 15 },
  pro:       { quotesPerDay: null, lensesPerQuote: null, lensesPerDay: null },
} as const

// Is this email on the comp allowlist? Reads the `comp_users` Supabase table
// (see migration 006). The table is RLS-locked, so this MUST run server-side
// via the service-role client — never from the browser. Manage the list in the
// Supabase Table Editor: insert a row to grant Pro, delete it to revoke. No
// redeploy needed. Returns false (not Pro) if the lookup errors, so a DB blip
// never hands out free access.
async function isCompedEmail(email: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from('comp_users')
    .select('email')
    .eq('email', email.toLowerCase()) // column is citext, but normalize anyway
    .maybeSingle()
  if (error) {
    console.error('comp_users lookup failed:', error.message)
    return false
  }
  return data !== null
}

export async function getUserTier(): Promise<{ tier: UserTier; userId: string | null }> {
  const { userId, has } = await auth()
  if (!userId) return { tier: 'anonymous', userId: null }
  if (has({ plan: 'unlock_all_lenses_monthly' })) return { tier: 'pro', userId }
  // Comp allowlist — only resolve the email when we still might upgrade them.
  const user = await currentUser()
  const email =
    user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress
  if (email && (await isCompedEmail(email))) return { tier: 'pro', userId }
  return { tier: 'free', userId }
}
