import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getResend, FROM } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, html } = await req.json()

  const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html })
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ id: data?.id })
}
