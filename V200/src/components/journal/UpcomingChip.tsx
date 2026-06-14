'use client'

// Small "upcoming" pill that hangs off the coming-soon lens buttons (Decorate,
// Chat with lens) in the detail-page button row. Figma node 602:6889 — a
// release_alert bell + "UPCOMING" caption in the secondary/pink accent slot.
// Token-driven so it follows all three themes for free.
function BellIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-1.7 1.7c-.63.63-.19 1.71.7 1.71h14c.89 0 1.34-1.08.71-1.71L18 16z" />
    </svg>
  )
}

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
      <BellIcon />
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
