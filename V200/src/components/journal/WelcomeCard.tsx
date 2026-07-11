'use client'
import { useTheme } from '@/lib/theme'

type Props = {
  // Keep the existing demo-seed affordance — rendered beneath the welcome copy.
  onLoadDemo?: () => void
  seeding?: boolean
  seedMsg?: string | null
}

// First-run / empty-state card (Figma 469:4036). Pink-accent surface with a
// header-green title, cyan subhead + a short feature list. Reconciles with the
// existing demo-seed flow: the welcome copy is per Figma; the "load demo"
// affordance is preserved beneath it so QA can populate the feed.
export default function WelcomeCard({ onLoadDemo, seeding, seedMsg }: Props) {
  const { theme } = useTheme()
  const isCyberpunk = theme === 'cyberpunk'
  const isKawaii = theme === 'kawaii'

  // Pink-accent card (Figma 469:4036 borders). Drives from --pink so all 3
  // themes follow: red(notepad) / magenta(kawaii) / hot-pink(cyberpunk).
  const cardBorder = isCyberpunk
    ? {
        borderTop: '1px solid var(--pink)', borderLeft: '4px solid var(--pink)',
        borderRight: '4px solid var(--pink)', borderBottom: '2px solid var(--pink)',
        borderRadius: 'var(--card-radius)', background: 'var(--card-bg)',
      }
    : isKawaii
      ? {
          borderTop: 'var(--card-bt)', borderLeft: 'var(--card-bl)',
          borderRight: 'var(--card-br)', borderBottom: 'var(--card-bb)',
          borderRadius: 'var(--card-radius)', background: 'var(--card-bg)',
          boxShadow: 'var(--card-shadow)',
        }
      : {
          borderTop: '1.5px solid var(--pink)', borderLeft: '4px solid var(--pink)',
          borderRight: '1.5px solid var(--pink)', borderBottom: '1.5px solid var(--pink)',
          borderRadius: '8px', background: 'var(--card-bg)',
        }

  return (
    <div style={{ width: '100%', filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)' }}>
      <div
        style={{
          ...cardBorder,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        {/* Heading — "C Header 2" 18px bold uppercase, header-green (Figma 469:4037). */}
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18,
          letterSpacing: '1.44px', lineHeight: '20px',
          color: 'var(--text-body)', textTransform: 'uppercase', textAlign: 'center', margin: 0,
        }}>
          Journal unlocked
        </p>
        {/* Subhead — cyan, 12px bold uppercase (Figma 469:4038). */}
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
          letterSpacing: '1.32px', lineHeight: '14px',
          color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center', margin: 0,
        }}>
          Every vent you write saves here automatically \u2014 revisit it, add new lenses, share the good ones.
        </p>
        {/* Feature list — cyan body (Figma 469:4039). */}
        <ul style={{
          alignSelf: 'stretch', margin: '4px 0 0', paddingLeft: 22,
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
          letterSpacing: '0.52px', color: 'var(--cyan)', listStyle: 'disc',
        }}>
          <li>Journal</li>
          <li>Set of free stickers</li>
        </ul>

        {/* Demo-seed affordance — preserved from the original empty state so QA
            (and curious first-run users) can populate the feed to look around. */}
        {onLoadDemo && (
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={seeding}
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
              letterSpacing: 'var(--btn-letter-spacing, 3px)',
              color: 'var(--btn-color)', background: 'var(--btn-bg)',
              borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
              borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
              borderRadius: 'var(--btn-radius)', padding: '12px 24px',
              boxShadow: 'var(--btn-shadow)', cursor: seeding ? 'wait' : 'pointer',
              textTransform: 'uppercase', minHeight: 44,
            }}
          >
            {seeding ? 'Loading demo…' : 'Load 10-entry demo'}
          </button>
        )}
        {seedMsg && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)', margin: 0 }}>
            {seedMsg}
          </p>
        )}
      </div>
    </div>
  )
}
