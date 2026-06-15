import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import EntryDetail from '@/components/journal/EntryDetail'
import type { JournalEntry, LensShare, SharePlatform } from '@/lib/journal-types'

type RawShare = { id: string; platform: SharePlatform; shared_at: string }
type RawLens = {
  id: string
  figure_id: string
  response_text: string
  is_favorite: boolean
  created_at: string
  lens_shares: RawShare[] | null
}
type RawSession = {
  id: string
  vent_text: string
  title: string | null
  theme: string
  is_public: boolean
  created_at: string
  lens_responses: RawLens[] | null
}

export default async function JournalEntryDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=/app/journal-v2/${id}`)

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('vent_sessions')
    .select(`
      id, vent_text, title, theme, is_public, created_at,
      lens_responses (
        id, figure_id, response_text, is_favorite, created_at,
        lens_shares ( id, platform, shared_at )
      )
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!data) notFound()

  const s = data as unknown as RawSession
  const entry: JournalEntry = {
    id: s.id,
    vent_text: s.vent_text,
    title: s.title ?? null,
    theme: s.theme,
    is_public: !!s.is_public,
    created_at: s.created_at,
    lens_responses: (s.lens_responses ?? []).map(lr => ({
      id: lr.id,
      figure_id: lr.figure_id,
      response_text: lr.response_text,
      is_favorite: !!lr.is_favorite,
      created_at: lr.created_at,
      shares: ((lr.lens_shares ?? []) as LensShare[])
        .slice()
        .sort((a, b) => a.shared_at.localeCompare(b.shared_at)),
    })),
  }

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={{ maxWidth: 440 }}>
        <EntryDetail entry={entry} />
      </div>
    </div>
  )
}
