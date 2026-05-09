import { getSupabaseAdmin } from './supabase'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export async function getUsageToday(userId: string) {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('usage_log')
    .select('quote_count, lens_count')
    .eq('user_id', userId)
    .eq('date', todayStr())
    .single()
  return { quoteCount: data?.quote_count ?? 0, lensCount: data?.lens_count ?? 0 }
}

export async function trackUsage(userId: string, isNewQuote: boolean) {
  const db = getSupabaseAdmin()
  const today = todayStr()

  const { data } = await db
    .from('usage_log')
    .select('quote_count, lens_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (data) {
    await db.from('usage_log')
      .update({
        lens_count: data.lens_count + 1,
        ...(isNewQuote ? { quote_count: data.quote_count + 1 } : {}),
      })
      .eq('user_id', userId)
      .eq('date', today)
  } else {
    await db.from('usage_log')
      .insert({ user_id: userId, date: today, lens_count: 1, quote_count: isNewQuote ? 1 : 0 })
  }
}
