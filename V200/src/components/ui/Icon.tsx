// Single icon primitive for the whole app. Renders a Google Material Symbols
// (Rounded) glyph by name — the ONLY icon source in Minds Shift (no custom SVGs).
// The Rounded stylesheet is loaded in src/app/layout.tsx. Inherits currentColor.
import type { CSSProperties } from 'react'

type Props = {
  name: string
  size?: number
  fill?: 0 | 1
  weight?: number
  grade?: number
  className?: string
  style?: CSSProperties
  title?: string
}

export default function Icon({
  // Kate's icon spec (2026-07-09): filled, weight 700, grade 0, 24px, Rounded.
  name, size = 24, fill = 1, weight = 700, grade = 0, className, style, title,
}: Props) {
  return (
    <span
      className={`material-symbols-rounded${className ? ` ${className}` : ''}`}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      style={{
        fontSize: size,
        // opsz tracks the rendered size so optical sizing stays correct.
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  )
}
