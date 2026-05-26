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

  const { data, error } = await db
    .from('vent_sessions')
    .select(`
      id,
      vent_text,
      theme,
      is_public,
      created_at,
      lens_responses (
        id,
        figure_id,
        response_text,
        is_favorite,
        created_at,
        lens_shares ( id, platform, shared_at )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch journal.' }, { status: 500 })
  }

  let rows = (data ?? []) as unknown as RawSession[]

  if (filter === 'favorites') {
    rows = rows
      .map(s => ({
        ...s,
        lens_responses: (s.lens_responses ?? []).filter(lr => lr.is_favorite),
      }))
      .filter(s => (s.lens_responses ?? []).length > 0)
  }

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
