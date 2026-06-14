// Circular nav-arrow button — the shared "massive circle" used by the lens
// picker overlay and the theme-select theme picker. Token-driven (cyan ring on
// the card surface) so all three themes follow. Presentational, no hooks.
import Icon from '@/components/ui/Icon'

type Props = {
  direction: 'left' | 'right'
  onClick: () => void
  size?: number
  'aria-label': string
}

export default function CircleArrow({
  direction, onClick, size = 44, 'aria-label': ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--card-bg)',
        border: '2px solid var(--cyan)',
        color: 'var(--cyan)',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <Icon name={direction === 'left' ? 'chevron_left' : 'chevron_right'} size={Math.round(size * 0.64)} />
    </button>
  )
}
