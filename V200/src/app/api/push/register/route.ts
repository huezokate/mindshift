// Push token registry for the native app's weekly nudge (T-030-05).
//
// POST   { token, platform? } — upsert this device's Expo push token for the
//                               signed-in user. Token is the primary key, so a
//                               device switching accounts transfers ownership.
// DELETE { token }            — revoke (only the caller's own row).
//
// Bearer-token Clerk auth (the native client sends Authorization headers, not
// cookies). Self-checked JSON 401s like the mindmap routes — the middleware
// matcher covers /api but does not gate it.

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const PLATFORMS = new Set(['ios', 'android'])

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const platform = PLATFORMS.has(body.platform) ? (body.platform as string) : 'ios'
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('push_tokens')
    .upsert({ token, user_id: userId, platform, updated_at: new Date().toISOString() })

  if (error) {
    console.error('[push/register] upsert failed:', error.message)
    return NextResponse.json({ error: 'Failed to register.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('push_tokens')
    .delete()
    .eq('token', token)
    .eq('user_id', userId)

  if (error) {
    console.error('[push/register] delete failed:', error.message)
    return NextResponse.json({ error: 'Failed to unregister.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
