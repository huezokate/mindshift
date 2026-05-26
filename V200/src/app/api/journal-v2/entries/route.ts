import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

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

  let query = db
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

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch journal.' }, { status: 500 })
  }

  let rows = data ?? []

  if (filter === 'favorites') {
    rows = rows
      .map(s => ({
        ...s,
        lens_responses: (s.lens_responses ?? []).filter((lr: any) => lr.is_favorite),
      }))
      .filter(s => (s.lens_responses ?? []).length > 0)
  }

  // Sort shares ascending so first share renders left-most
  const normalized = rows.map(s => ({
    ...s,
    lens_responses: (s.lens_responses ?? []).map((lr: any) => ({
      ...lr,
      shares: (lr.lens_shares ?? []).sort(
        (a: any, b: any) => a.shared_at.localeCompare(b.shared_at)
      ),
      lens_shares: undefined,
    })),
  }))

  const hasMore = normalized.length > limit
  const sessions = hasMore ? normalized.slice(0, limit) : normalized

  return NextResponse.json({ sessions, hasMore })
}
