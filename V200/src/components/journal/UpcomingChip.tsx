'use client'
import Icon from '@/components/ui/Icon'

// Small "upcoming" pill that hangs off the coming-soon lens buttons (Decorate,
// Chat) in the detail-page button row. Figma node 602:6889 — a
// release_alert bell + "UPCOMING" caption in the secondary/pink accent slot.
// Token-driven so it follows all three themes for free.
export default function UpcomingChip() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'var(--bg)',
        border: '2px solid var(--pink)',
        borderRadius: 8,
        padding: '2px 4px',
        color: 'var(--pink)',
        flexShrink: 0,
      }}
    >
      <Icon name="release_alert" size={12} />
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 10,
        lineHeight: '12px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        upcoming
      </span>
    </span>
  )
}
