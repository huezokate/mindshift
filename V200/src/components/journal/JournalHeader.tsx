'use client'

type Props = {
  firstName?: string | null
}

// Small "{firstName}'s Journal" subheading sitting under the app header bar
// (Figma 606:7745). The brand medallion + "MindShift" wordmark now live in
// <AppHeader/>; this is just the personalized sub-label. Falls back to "Your
// Journal" when no name.
export default function JournalHeader({ firstName }: Props) {
  const name = firstName?.trim()
  const title = name ? `${name}'s Journal` : 'Your Journal'

  return (
    <h1 style={{
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18,
      letterSpacing: '2px', lineHeight: '20px',
      color: 'var(--violet)', textTransform: 'uppercase', textAlign: 'center',
      margin: '4px 0 12px', width: '100%',
    }}>
      {title}
    </h1>
  )
}
