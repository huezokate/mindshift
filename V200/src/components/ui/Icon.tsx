// Single icon primitive for the whole app. Renders a Google Material Symbols
// (Sharp) glyph by name — the ONLY icon source in Minds Shift (no custom SVGs).
// The Sharp stylesheet is loaded in src/app/layout.tsx. Inherits currentColor.
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
  name, size = 24, fill = 0, weight = 400, grade = 0, className, style, title,
}: Props) {
  return (
    <span
      className={`material-symbols-sharp${className ? ` ${className}` : ''}`}
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
