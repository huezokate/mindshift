import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateVentTitle } from '@/lib/title'

// Returns a short Gemini "<synonym> on <topic>" title for a vent (T-018-07).
// Save persists titles inline; this route exposes the same generator for
// backfill, tooling, and tests. Auth-gated — generating a title costs a Gemini
// call, same as the journal write path.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ventText } = await req.json()
  if (!ventText || typeof ventText !== 'string') {
    return NextResponse.json({ error: 'Missing ventText.' }, { status: 400 })
  }

  const title = await generateVentTitle(ventText)
  return NextResponse.json({ title })
}
