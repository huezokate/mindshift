import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { DEMO_ENTRIES } from '@/lib/journal-seed'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getSupabaseAdmin()

  // Confirm the v2 migration has been applied. If is_public is missing on
  // vent_sessions, the seed will silently fail row-by-row otherwise.
  const { error: probeErr } = await db
    .from('vent_sessions')
    .select('id, is_public')
    .eq('user_id', userId)
    .limit(1)

  if (probeErr) {
    const msg = probeErr.message ?? ''
    if (msg.toLowerCase().includes('is_public') || msg.toLowerCase().includes('column')) {
      return NextResponse.json(
        {
          error:
            'Database schema for Journal v2 is missing. Run supabase/migrations/002_journal_v2.sql in the Supabase SQL editor, then try again.',
        },
        { status: 412 }
      )
    }
    return NextResponse.json({ error: 'Failed to probe schema.' }, { status: 500 })
  }

  // Wipe prior demo entries for this user so the seed is idempotent.
  const { data: existing } = await db
    .from('vent_sessions')
    .select('id')
    .eq('user_id', userId)

  const existingIds = (existing ?? []).map(r => r.id)
  if (existingIds.length) {
    await db.from('vent_sessions').delete().in('id', existingIds)
  }

  let createdEntries = 0
  let createdResponses = 0
  let createdShares = 0
  let createdFavorites = 0

  for (const entry of DEMO_ENTRIES) {
    const { data: session, error: sessErr } = await db
      .from('vent_sessions')
      .insert({
        user_id: userId,
        vent_text: entry.vent_text,
        theme: entry.theme ?? 'cyberpunk',
        is_public: entry.is_public,
      })
      .select('id')
      .single()

    if (sessErr || !session) continue
    createdEntries++

    for (const lens of entry.lenses) {
      const { data: resp, error: respErr } = await db
        .from('lens_responses')
        .insert({
          session_id: session.id,
          user_id: userId,
          figure_id: lens.figure_id,
          response_text: lens.response_text,
          is_favorite: !!lens.is_favorite,
        })
        .select('id')
        .single()

      if (respErr || !resp) continue
      createdResponses++
      if (lens.is_favorite) createdFavorites++

      for (const platform of lens.shared_to ?? []) {
        const { error: shareErr } = await db
          .from('lens_shares')
          .insert({ response_id: resp.id, user_id: userId, platform })
        if (!shareErr) createdShares++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    createdEntries,
    createdResponses,
    createdShares,
    createdFavorites,
  })
}
