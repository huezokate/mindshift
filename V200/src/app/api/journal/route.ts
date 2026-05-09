import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  const { data: sessions, error } = await db
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
    .limit(50)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch journal.' }, { status: 500 })
  }

  return NextResponse.json({ sessions: sessions ?? [] })
}
