import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getUserTier, TIER_LIMITS } from '@/lib/user-tier'
import { getUsageToday, trackUsage } from '@/lib/usage'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { prompt, figureId, systemPrompt, isNewQuote } = await req.json()
  if (!prompt || !figureId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { tier, userId } = await getUserTier()
  const limits = TIER_LIMITS[tier]

  // Anonymous limits are enforced client-side (localStorage).
  // Server enforces limits for signed-in free users.
  if (userId && tier === 'free') {
    const { quoteCount, lensCount } = await getUsageToday(userId)

    if (isNewQuote && quoteCount >= limits.quotesPerDay!) {
      return NextResponse.json(
        { error: 'Daily quote limit reached. Upgrade to Pro for unlimited access.', limitType: 'quotes', tier },
        { status: 429 }
      )
    }
    if (lensCount >= limits.lensesPerDay!) {
      return NextResponse.json(
        { error: 'Daily lens limit reached. Upgrade to Pro for unlimited access.', limitType: 'lenses', tier },
        { status: 429 }
      )
    }
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt ?? 'You are a wise advisor. Respond in character.',
  })

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  if (userId && tier === 'free') {
    await trackUsage(userId, !!isNewQuote)
  }

  return NextResponse.json({ response: text, tier })
}
