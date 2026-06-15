import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateVentTitle } from '@/lib/title'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to save to your journal.' }, { status: 401 })
  }

  const { sessionId, ventText, figureId, responseText, theme } = await req.json()
  if (!ventText || !figureId || !responseText) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  let resolvedSessionId: string

  if (sessionId) {
    const { data: session } = await db
      .from('vent_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }
    resolvedSessionId = session.id
  } else {
    // Gemini summarizes the vent into a "<synonym> on <topic>" header. Falls
    // back to a first-words title internally, so this never blocks the save.
    const title = await generateVentTitle(ventText)
    const { data: newSession, error: sessionErr } = await db
      .from('vent_sessions')
      .insert({ user_id: userId, vent_text: ventText, theme: theme ?? 'cyberpunk', title })
      .select('id')
      .single()

    if (sessionErr || !newSession) {
      return NextResponse.json({ error: 'Failed to save session.' }, { status: 500 })
    }
    resolvedSessionId = newSession.id
  }

  // Upsert — if the same lens is re-applied to this session, update the response text
  const { data: lensRow, error: lensErr } = await db
    .from('lens_responses')
    .upsert(
      { session_id: resolvedSessionId, user_id: userId, figure_id: figureId, response_text: responseText },
      { onConflict: 'session_id,figure_id' }
    )
    .select('id')
    .single()

  if (lensErr || !lensRow) {
    return NextResponse.json({ error: 'Failed to save response.' }, { status: 500 })
  }

  return NextResponse.json({ sessionId: resolvedSessionId, responseId: lensRow.id })
}
