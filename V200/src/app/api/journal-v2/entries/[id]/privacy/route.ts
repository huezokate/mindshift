import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const { is_public } = await req.json()
  if (typeof is_public !== 'boolean') {
    return NextResponse.json({ error: 'is_public must be boolean.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('vent_sessions')
    .update({ is_public })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to update privacy.' }, { status: 500 })
  }

  return NextResponse.json({ id, is_public })
}
