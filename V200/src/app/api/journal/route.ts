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

  const db = getSupabaseAdmin()

  // Fetch one extra to know if there are more pages
  const { data, error } = await db
    .from('vent_sessions')
    .select(`
      id,
      vent_text,
      theme,
      created_at,
      lens_responses (
        id,
        figure_id,
        response_text,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)  // limit+1 rows to detect next page

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch journal.' }, { status: 500 })
  }

  const rows = data ?? []
  const hasMore = rows.length > limit
  const sessions = hasMore ? rows.slice(0, limit) : rows

  return NextResponse.json({ sessions, hasMore })
}
