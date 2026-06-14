// Shared circular nav arrow — the one source for prev/next circle buttons
// (lens-picker popup now; theme-select can adopt it next). Token-driven so it
// recolors per theme (cyan border on card-bg across all three). Renders a
// Material Symbols chevron via <Icon> — no literal ‹/› glyphs (T-018-01 rule).
import type { CSSProperties, MouseEvent } from 'react'
import Icon from '@/components/ui/Icon'

type Props = {
  direction: 'prev' | 'next'
  onClick: (e: MouseEvent) => void
  ariaLabel: string
  size?: number
  disabled?: boolean
  style?: CSSProperties
}

export default function CircularArrow({
  direction, onClick, ariaLabel, size = 44, disabled = false, style,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--cyan)',
        background: 'var(--card-bg)',
        color: 'var(--cyan)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <Icon
        name={direction === 'prev' ? 'chevron_left' : 'chevron_right'}
        size={Math.round(size * 0.6)}
        weight={500}
      />
    </button>
  )
}
