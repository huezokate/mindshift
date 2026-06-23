import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Lightweight totals for the account-dropdown badge. Every app screen renders
// <AppHeader/>, but only the journal page can pass live counts — everywhere else
// the dropdown would show "0 entries". The header self-fetches from here instead.
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ entries: 0, lenses: 0 })

  const db = getSupabaseAdmin()
  const [sessions, lenses] = await Promise.all([
    db.from('vent_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    db.from('lens_responses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return NextResponse.json({
    entries: sessions.count ?? 0,
    lenses: lenses.count ?? 0,
  })
}
