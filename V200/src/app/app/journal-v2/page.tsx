import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import JournalV2Client from '@/components/journal/JournalV2Client'
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

const PAGE_SIZE = 10

export default async function JournalV2Page() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/app/journal-v2')

  const user = await currentUser()
  const firstName = user?.firstName ?? null

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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE)

  const rawRows = (data ?? []) as unknown as RawSession[]
  const normalized: JournalEntry[] = rawRows.map(s => ({
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
  }))

  const initialHasMore = normalized.length > PAGE_SIZE
  const initialEntries = initialHasMore ? normalized.slice(0, PAGE_SIZE) : normalized

  return (
    <div className="min-h-dvh flex flex-col items-center">
      <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 440, padding: '16px 20px 40px' }}>
        <JournalV2Client
          initialEntries={initialEntries}
          initialHasMore={initialHasMore}
          firstName={firstName}
        />
      </div>
    </div>
  )
}
