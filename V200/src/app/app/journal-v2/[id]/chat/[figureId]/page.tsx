import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { FIGURES } from '@/lib/figures'
import ChatScreen from '@/components/journal/ChatScreen'

// Chat with the Lens — dedicated screen (T-020-02).
// Loads the vent session + the figure's seed reframe, then hands them to the
// client thread. The vent and the reframe open the conversation as chat bubbles.

type RawLens = { figure_id: string; response_text: string }
type RawSession = { id: string; vent_text: string; lens_responses: RawLens[] | null }

export default async function ChatWithLensPage(
  { params }: { params: Promise<{ id: string; figureId: string }> }
) {
  const { id, figureId } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=/app/journal-v2/${id}/chat/${figureId}`)

  // Unknown figure → 404 (can't seed a persona).
  if (!FIGURES.some(f => f.id === figureId)) notFound()

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('vent_sessions')
    .select('id, vent_text, lens_responses ( figure_id, response_text )')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!data) notFound()

  const s = data as unknown as RawSession
  // The seed reframe is the existing lens_responses row for this figure — the
  // conversation can't open without it.
  const seed = (s.lens_responses ?? []).find(l => l.figure_id === figureId)
  if (!seed) notFound()

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 900 }}>
      <ChatScreen
        figureId={figureId}
        sessionId={s.id}
        ventText={s.vent_text}
        seedReply={seed.response_text}
      />
    </div>
  )
}
