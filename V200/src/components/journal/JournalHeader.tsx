'use client'

type Props = {
  /** The journal owner's display name. Journal is sign-in-gated, so a user
      always exists — no anonymous fallback (Kate 2026-07-10). Callers pass
      firstName ?? username ?? 'user'. */
  name: string
}

// Small "@{name}'s Journal" subheading sitting under the app header bar
// (Figma 606:7745). The brand medallion + "Minds Shift" wordmark now live in
// <AppHeader/>; this is just the personalized sub-label.
export default function JournalHeader({ name }: Props) {
  return (
    <h1 style={{
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18,
      letterSpacing: '2px', lineHeight: '20px',
      color: 'var(--violet)', textTransform: 'uppercase', textAlign: 'center',
      margin: '4px 0 12px', width: '100%',
    }}>
      @{name.trim()}&rsquo;s Journal
    </h1>
  )
}
