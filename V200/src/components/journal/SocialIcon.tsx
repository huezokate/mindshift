'use client'
import { useTheme } from '@/lib/theme'
import type { SharePlatform } from '@/lib/journal-types'

// Brand social glyphs (Figma 579:6074). Material Symbols has no brand logos, so
// these are themed SVG exports — one per platform × theme (color baked per
// theme). Renders the full 16px badge to match the Figma component exactly.
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
  const glyph = GLYPH[platform] ?? 'sms'
  // Badge bg per Figma: cyberpunk #080810 + notepad #faf7f2 both = var(--bg);
  // kawaii uses the main-blue #e5fcfa (var(--input-header-bg)).
  const bg = theme === 'kawaii' ? 'var(--input-header-bg)' : 'var(--bg)'
  return (
    <span
      title={`Shared to ${platform}`}
      style={{
        width: size, height: size, borderRadius: 4, background: bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      <img
        src={`/icons/social/${glyph}-${theme}.svg`}
        alt=""
        width={size}
        height={size}
        style={{ display: 'block', width: size, height: size }}
      />
    </span>
  )
}
