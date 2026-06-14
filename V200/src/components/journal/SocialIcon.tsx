'use client'
import { useTheme } from '@/lib/theme'
import type { SharePlatform } from '@/lib/journal-types'

// Brand social glyphs for the per-avatar share badges (Figma 572:5715 /
// 579:6074). Material Symbols has no brand logos, and the raw Figma SVG exports
// render as solid squares via <img> (stroke-width/mask artifact), so these are
// clean inline brand paths in `currentColor` (the theme accent) on a 16px badge.
function Glyph({ name }: { name: string }) {
  const base = { width: '100%', height: '100%', display: 'block' as const }
  switch (name) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={base} aria-hidden>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.3" cy="6.7" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={base} aria-hidden>
          <path d="M16.5 3c.4 2.3 1.8 3.9 4 4.2v2.9c-1.5 0-2.9-.4-4-1.1v6c0 3.4-2.7 5.9-6 5.9S4.5 18.4 4.5 15s2.7-5.9 6-5.9c.4 0 .8 0 1.1.1v3c-.3-.1-.7-.2-1.1-.2-1.6 0-2.9 1.3-2.9 3s1.3 3 2.9 3 2.9-1.3 2.9-3V3h3.1z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={base} aria-hidden>
          <path d="M14 7h2.5V3.3C16 3.1 14.9 3 13.6 3 10.9 3 9 4.7 9 7.7V10.5H6V14h3v8h3.6v-8H15l.5-3.5h-3V8c0-.7.3-1 1.5-1z" />
        </svg>
      )
    default: // sms / generic — chat bubble
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={base} aria-hidden>
          <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z" />
        </svg>
      )
  }
}

const GLYPH: Record<SharePlatform, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  facebook: 'facebook',
  link: 'sms',
  native: 'sms',
  download: 'sms',
}

export default function SocialIcon({ platform, size = 16 }: { platform: SharePlatform; size?: number }) {
  const { theme } = useTheme()
  // Badge bg per Figma: cyberpunk #080810 + notepad #faf7f2 = var(--bg);
  // kawaii uses the main-blue #e5fcfa (var(--input-header-bg)).
  const bg = theme === 'kawaii' ? 'var(--input-header-bg)' : 'var(--bg)'
  const glyph = Math.round(size * 0.78)
  return (
    <span
      title={`Shared to ${platform}`}
      style={{
        width: size, height: size, borderRadius: 4, background: bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--cyan)', flexShrink: 0,
      }}
    >
      <span style={{ width: glyph, height: glyph, display: 'block' }}>
        <Glyph name={GLYPH[platform] ?? 'sms'} />
      </span>
    </span>
  )
}
