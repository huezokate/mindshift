import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { prompt, figureId, systemPrompt } = await req.json()
  if (!prompt || !figureId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt ?? 'You are a wise advisor. Respond in character.',
  })

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  return NextResponse.json({ response: text })
}
