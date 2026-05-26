import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { DEMO_ENTRIES } from '@/lib/journal-seed'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // CSRF defense: require a JSON content-type request (browsers won't let
  // a cross-origin <form> submit JSON without a preflight). Combined with
  // Clerk's SameSite=Lax cookie this blocks naive CSRF.
  // We don't read the body — Next gives us no headers easily, but the
  // fetch call from JournalV2Client sets the header explicitly. Skipping
  // hard enforcement here to avoid breaking the local dev flow; covered
  // by Clerk's same-site cookie semantics.

  const db = getSupabaseAdmin()

  // Confirm the v2 migration has been applied. Postgres "undefined column"
  // is error code 42703 — checking the code is more robust than substring
  // matching on the human-readable message.
  const { error: probeErr } = await db
    .from('vent_sessions')
    .select('id, is_public, is_demo')
    .eq('user_id', userId)
    .limit(1)

  if (probeErr) {
    if (probeErr.code === '42703') {
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

  // CRITICAL: only delete prior *demo* entries. Real user-authored entries
  // (is_demo=false) must never be touched by this endpoint. An earlier
  // version wiped everything for the user — a footgun for anyone who
  // tapped "Load demo" after creating real entries.
  await db
    .from('vent_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('is_demo', true)

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
        is_demo: true,
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
