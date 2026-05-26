import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const db = getSupabaseAdmin()
  // Cascade via ON DELETE CASCADE on lens_responses / lens_shares
  const { error } = await db
    .from('vent_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete entry.' }, { status: 500 })
  }
  return NextResponse.json({ id })
}
