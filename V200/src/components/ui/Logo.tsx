'use client'
// Brand logo (Figma "Component 1" 483:2747 + logo/* frames). Built exactly the
// way the Figma component is: two layered Material Symbols on a theme-bg disc —
// `camera` (read as an aperture ring) with `psychology_alt` (head + question
// mark) patched over its center on a small bg-colored circle. Glyphs stay
// outline/400 (the Figma assets are FILL0 wght400) — a deliberate exception to
// the filled/700 icon default, it's a brand mark, not a UI icon.
// Sizes mirror the Figma variants: lens24 / lens48 / lens80, ± "Minds Shift"
// wordmark below (per-theme --logo-* tokens: Courier/green · Nunito/yellow ·
// Georgia/blue).
import Icon from '@/components/ui/Icon'

type Props = {
  /** Disc diameter — Figma variants are 24, 48 and 80. */
  size?: 24 | 48 | 80 | number
  /** Show the "Minds Shift" wordmark under the disc (lens48/80 "v name" forms). */
  name?: boolean
  className?: string
}

export default function Logo({ size = 48, name = false, className }: Props) {
  const disc = (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Aperture ring — inset 8.33% per Figma */}
      <Icon
        name="camera"
        size={Math.round(size * 0.8333)}
        fill={0}
        weight={400}
        style={{ color: 'var(--logo-ring)', display: 'block' }}
      />
      {/* Center patch: bg-colored circle (half the disc) carrying the mark */}
      <span
        style={{
          position: 'absolute',
          width: size / 2,
          height: size / 2,
          borderRadius: '50%',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name="psychology_alt"
          size={Math.round(size * 0.4167)}
          fill={0}
          weight={400}
          style={{ color: 'var(--logo-mark)', display: 'block' }}
        />
      </span>
    </span>
  )

  if (!name) return <span className={className} style={{ display: 'inline-flex' }}>{disc}</span>

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: 8 }}
    >
      {disc}
      <span
        className="uppercase"
        style={{
          fontFamily: 'var(--logo-font, var(--font-display))',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: 'var(--logo-tracking, 1px)',
          color: 'var(--logo-text)',
          whiteSpace: 'nowrap',
        }}
      >
        Minds Shift
      </span>
    </span>
  )
}
