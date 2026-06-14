'use client'
import { useTheme } from '@/lib/theme'

type Props = {
  firstName?: string | null
}

// Brain medallion (Figma 602:6597 → Component1 / psychology_alt). Matches the
// medallion used on the detail page (EntryDetail) for visual consistency.
function BrainMedallion() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M13 3c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24L7 14.5V17a1 1 0 0 0 1 1h2v1a2 2 0 0 0 4 0v-3.07A6 6 0 0 0 13 3zm0 2a4 4 0 0 1 .5 7.97V15h-3v-1.34l-.7-.7A4 4 0 0 1 13 5z" />
      <circle cx="13" cy="9" r="1.4" />
    </svg>
  )
}

// Personalized journal header (Figma 602:6599): brain/avatar medallion pinned
// top-right, then "{firstName}'s Journal" — violet, 28px, display font,
// UPPERCASE, wide tracking. Falls back to "Your Journal" when no name.
export default function JournalHeader({ firstName }: Props) {
  const { theme } = useTheme()
  const isCyberpunk = theme === 'cyberpunk'
  const isKawaii = theme === 'kawaii'

  const name = firstName?.trim()
  const title = name ? `${name}'s Journal` : 'Your Journal'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: 8, width: '100%' }}>
      <div
        aria-hidden
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--bg)',
          border: isCyberpunk
            ? '2px solid var(--green)'
            : (isKawaii ? '2px solid var(--pink)' : '1.5px solid var(--cyan)'),
          boxShadow: 'var(--fig-avatar-shadow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCyberpunk ? 'var(--green)' : (isKawaii ? 'var(--pink)' : 'var(--cyan)'),
          flexShrink: 0,
        }}
      >
        <BrainMedallion />
      </div>
      <h1 style={{
        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 28,
        letterSpacing: '4.2px', lineHeight: '30px',
        color: 'var(--violet)', textTransform: 'uppercase', textAlign: 'center',
        margin: '4px 0 0', width: '100%',
      }}>
        {title}
      </h1>
    </div>
  )
}
