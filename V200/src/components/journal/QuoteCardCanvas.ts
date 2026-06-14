// Renders a 1080x1350 share card to a canvas, then returns a PNG Blob.
// Pure DOM canvas API — no html2canvas dep.

import { FIGURES, portraitFor } from '@/lib/figures'

type Theme = 'cyberpunk' | 'kawaii' | 'notepad'

type ThemeColors = {
  bg: string
  card: string
  border: string
  textBody: string
  textSub: string
  accent: string
  wordmark: string
}

const PALETTES: Record<Theme, ThemeColors> = {
  cyberpunk: {
    bg: '#080810',
    card: '#0d0d1a',
    border: '#00F5FF',
    textBody: '#E0F7FF',
    textSub: '#7ECFDF',
    accent: '#39FF14',
    wordmark: '#FF2D78',
  },
  kawaii: {
    bg: '#ffafd6',
    card: '#ffffff',
    border: '#400b14',
    textBody: '#270007',
    textSub: 'rgba(39,0,7,0.6)',
    accent: '#ff50c5',
    wordmark: '#400b14',
  },
  notepad: {
    bg: '#faf7f2',
    card: '#ffffff',
    border: '#c0605a',
    textBody: '#1e1e40',
    textSub: 'rgba(30,30,64,0.55)',
    accent: '#3a6fa8',
    wordmark: '#c0605a',
  },
}

const FONTS: Record<Theme, { display: string; body: string }> = {
  cyberpunk: { display: '"Alumni Sans SC", "Courier New", sans-serif', body: '"Courier New", monospace' },
  kawaii:    { display: '"Fredoka", "Nunito Sans", sans-serif',         body: '"Nunito Sans", sans-serif' },
  notepad:   { display: '"Georgia", serif',                              body: '"Inter", sans-serif' },
}

const WIDTH = 1080
const HEIGHT = 1350
const PADDING = 64

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n')
  const lines: string[] = []
  for (const para of paragraphs) {
    const words = para.split(' ')
    let current = ''
    for (const word of words) {
      const test = current ? current + ' ' + word : word
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
  }
  return lines
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    // Cross-origin isn't needed for same-origin /portraits/, but setting it
    // doesn't hurt — and absence would taint the canvas if we ever pulled
    // from a CDN. The onload/onerror pair guarantees the promise settles.
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
    // Hard timeout: don't let one slow image hang the whole share flow.
    setTimeout(() => resolve(null), 4000)
  })
}

export type QuoteCardOptions = {
  figureId: string
  responseText: string
  theme: Theme
  ventText?: string
  includeVent?: boolean
}

export async function renderQuoteCard(opts: QuoteCardOptions): Promise<Blob> {
  const { figureId, responseText, theme, ventText, includeVent } = opts
  const fig = FIGURES.find(f => f.id === figureId)
  const palette = PALETTES[theme]
  const fonts = FONTS[theme]

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d ctx unavailable')

  // Background
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Card
  const cardX = PADDING
  const cardY = PADDING
  const cardW = WIDTH - PADDING * 2
  const cardH = HEIGHT - PADDING * 2
  ctx.fillStyle = palette.card
  ctx.fillRect(cardX, cardY, cardW, cardH)

  // Asymmetric border (echoes the MindShift card style)
  ctx.strokeStyle = palette.border
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(cardX, cardY)
  ctx.lineTo(cardX, cardY + cardH)
  ctx.stroke()
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(cardX, cardY)
  ctx.lineTo(cardX + cardW, cardY)
  ctx.stroke()
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cardX + cardW, cardY)
  ctx.lineTo(cardX + cardW, cardY + cardH)
  ctx.lineTo(cardX, cardY + cardH)
  ctx.stroke()

  const contentX = cardX + 56
  let cursorY = cardY + 80

  // Portrait
  if (fig) {
    const portraitSrc = portraitFor(fig, theme)
    const img = await loadImage(portraitSrc)
    const avatarSize = 144
    const avatarX = contentX
    const avatarY = cursorY
    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    if (img) {
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize)
    } else {
      ctx.fillStyle = palette.accent
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize)
    }
    ctx.restore()
    ctx.lineWidth = 4
    ctx.strokeStyle = palette.accent
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.stroke()

    // Name + era
    ctx.fillStyle = palette.textBody
    ctx.font = `700 48px ${fonts.display}`
    ctx.textBaseline = 'top'
    ctx.fillText(fig.name.toUpperCase(), avatarX + avatarSize + 32, avatarY + 12)
    ctx.fillStyle = palette.textSub
    ctx.font = `400 26px ${fonts.body}`
    ctx.fillText(fig.era, avatarX + avatarSize + 32, avatarY + 70)

    cursorY += avatarSize + 56
  }

  // Response body — scale font down for very long responses so the
  // full quote fits without an ellipsis. Bands chosen by character
  // count rather than rendered line count to avoid an iterative
  // re-layout loop.
  const bodyMaxW = cardW - 112
  const len = responseText.length
  const bodyFontSize = len < 220 ? 44 : len < 380 ? 38 : len < 550 ? 32 : 28
  const lineH = Math.round(bodyFontSize * 1.36)
  ctx.fillStyle = palette.textBody
  ctx.font = `400 ${bodyFontSize}px ${fonts.body}`

  const lines = wrapText(ctx, '“' + responseText + '”', bodyMaxW)
  const reservedBottom = 200
  const maxBodyLines = Math.max(1, Math.floor((cardH - (cursorY - cardY) - reservedBottom) / lineH))
  const shownLines = lines.slice(0, maxBodyLines)
  if (lines.length > maxBodyLines && shownLines.length) {
    const last = shownLines[shownLines.length - 1]
    shownLines[shownLines.length - 1] = last.replace(/\s\S*$/, '') + ' …”'
  }
  for (const line of shownLines) {
    ctx.fillText(line, contentX, cursorY)
    cursorY += lineH
  }

  // Optional vent context
  if (includeVent && ventText) {
    const ventY = cardY + cardH - 180
    ctx.fillStyle = palette.textSub
    ctx.font = `italic 24px ${fonts.body}`
    const ventLines = wrapText(ctx, ventText, bodyMaxW).slice(0, 2)
    let vy = ventY
    for (const line of ventLines) {
      ctx.fillText(line, contentX, vy)
      vy += 32
    }
  }

  // Wordmark
  ctx.fillStyle = palette.wordmark
  ctx.font = `700 28px ${fonts.display}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('MINDSHIFT', contentX, cardY + cardH - 56)
  ctx.fillStyle = palette.textSub
  ctx.font = `400 22px ${fonts.body}`
  ctx.fillText('minds-shift.com', contentX, cardY + cardH - 28)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob returned null'))
    }, 'image/png')
  })
}
