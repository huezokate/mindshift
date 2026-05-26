import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { LensShare, SharePlatform } from '@/lib/journal-types'

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
  theme: string
  is_public: boolean
  created_at: string
  lens_responses: RawLens[] | null
}

const PAGE_SIZE = 10

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10))
  const filter = searchParams.get('filter') ?? 'all'

  const db = getSupabaseAdmin()

  // Favorites filter needs to be applied in SQL — applying it after
  // pagination silently kills infinite scroll whenever page N has zero
  // favorited responses. Use an INNER join on lens_responses when
  // filtering so only sessions WITH at least one favorited lens are
  // returned, and that join itself excludes non-favorite responses.
  const lensJoin = filter === 'favorites'
    ? `lens_responses!inner (
         id, figure_id, response_text, is_favorite, created_at,
         lens_shares ( id, platform, shared_at )
       )`
    : `lens_responses (
         id, figure_id, response_text, is_favorite, created_at,
         lens_shares ( id, platform, shared_at )
       )`

  // Range is INCLUSIVE on both ends, so requesting one extra row
  // (offset + limit) lets us probe "is there a next page?" without a
  // second query. We slice back down to `limit` before returning.
  let q = db
    .from('vent_sessions')
    .select(`id, vent_text, theme, is_public, created_at, ${lensJoin}`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)

  if (filter === 'favorites') {
    q = q.eq('lens_responses.is_favorite', true)
  }

  const { data, error } = await q

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch journal.' }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as RawSession[]

  // Sort shares ascending so first share renders left-most
  const normalized = rows.map(s => ({
    id: s.id,
    vent_text: s.vent_text,
    theme: s.theme,
    is_public: s.is_public,
    created_at: s.created_at,
    lens_responses: (s.lens_responses ?? []).map(lr => ({
      id: lr.id,
      figure_id: lr.figure_id,
      response_text: lr.response_text,
      is_favorite: lr.is_favorite,
      created_at: lr.created_at,
      shares: ((lr.lens_shares ?? []) as LensShare[])
        .slice()
        .sort((a, b) => a.shared_at.localeCompare(b.shared_at)),
    })),
  }))

  const hasMore = normalized.length > limit
  const sessions = hasMore ? normalized.slice(0, limit) : normalized

  return NextResponse.json({ sessions, hasMore })
}
