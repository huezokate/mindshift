import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { CHAT_HARD_CAP, type ChatMessage } from '@/lib/chat-types'

// Chat with the Lens — load a persisted thread (T-020-02).
// Signed-in only: returns the ordered follow-up messages for (session, figure)
// plus `closed` (a done row exists, or the user hit the hard cap) so a revisited
// entry re-opens the conversation in the right state. Anon threads are ephemeral
// (client state) and never reach here.

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const figureId = searchParams.get('figureId')
  if (!sessionId || !figureId) {
    return NextResponse.json({ error: 'Missing sessionId or figureId.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('lens_chat_messages')
    .select('id, role, content, turn_index, done, created_at')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('figure_id', figureId)
    .order('turn_index', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to load conversation.' }, { status: 500 })
  }

  const messages = (data ?? []) as ChatMessage[]
  const userTurns = messages.filter(m => m.role === 'user').length
  const closed = messages.some(m => m.done) || userTurns >= CHAT_HARD_CAP

  return NextResponse.json({ messages, closed })
}
