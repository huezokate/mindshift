import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { SharePlatform } from '@/lib/journal-types'

const VALID: SharePlatform[] = ['instagram', 'tiktok', 'facebook', 'link', 'native', 'download']

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const { platform } = await req.json()
  if (!VALID.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Confirm the response belongs to this user before logging the share.
  const { data: lr } = await db
    .from('lens_responses')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!lr) {
    return NextResponse.json({ error: 'Response not found.' }, { status: 404 })
  }

  const { data, error } = await db
    .from('lens_shares')
    .insert({ response_id: id, user_id: userId, platform })
    .select('id, platform, shared_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to log share.' }, { status: 500 })
  }

  return NextResponse.json({ share: data })
}
