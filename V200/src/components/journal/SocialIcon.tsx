'use client'
import { useTheme } from '@/lib/theme'
import type { SharePlatform } from '@/lib/journal-types'

// Brand social glyphs (Figma 579:6074) — the REAL per-theme SVGs exported from
// the "Social media share icons" component set, served from /public/social/
// as {theme}-{brand}.svg. The exports needed sanitizing (Figma emits a bogus
// stroke-width="25" that painted them as solid squares — the historical reason
// this component used hand-drawn paths); strokes are stripped at download time,
// fills carry the shapes, colors are baked per theme exactly as designed.
//
// Tile chrome per Figma: instagram/facebook sit on a 4px-radius tile
// (cyberpunk #080810 / notepad #faf7f2 = var(--bg); kawaii mint = --input-header-bg);
// tiktok/sms ship their tile inside the SVG itself.
const BRAND: Record<SharePlatform, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  facebook: 'facebook',
  link: 'sms',
  native: 'sms',
  download: 'sms',
}
const OWN_TILE = new Set(['tiktok', 'sms'])

export default function SocialIcon({ platform, size = 16 }: { platform: SharePlatform; size?: number }) {
  const { theme } = useTheme()
  const brand = BRAND[platform] ?? 'sms'
  const needsTile = !OWN_TILE.has(brand)
  const bg = theme === 'kawaii' ? 'var(--input-header-bg)' : 'var(--bg)'
  const glyph = needsTile ? Math.round(size * 0.9) : size
  return (
    <span
      title={`Shared to ${platform}`}
      style={{
        width: size, height: size, borderRadius: 4,
        background: needsTile ? bg : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/social/${theme}-${brand}.svg`}
        alt=""
        width={glyph}
        height={glyph}
        style={{ width: glyph, height: glyph, display: 'block' }}
      />
    </span>
  )
}
