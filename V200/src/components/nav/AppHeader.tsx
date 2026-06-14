'use client'
// App-wide top nav (Figma 606:7678 header + 602:6949 dropdown).
// Bar: [brand lens icon] · MINDS SHIFT · [account button → dropdown].
// Dropdown is color-coded per Figma: green = Profile/Log out, pink = Journal
// section, cyan = Mind Map section. All token-driven (no hardcoded hex) so the
// three themes follow. Counts are props (stubbed until the backend lands).
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'

type Props = {
  entryCount?: number
  lensCount?: number
  mindmapHorizon?: string
  mindmapProgress?: string
}

// One bordered dropdown row (Figma "Button Primary": t-4 l-4 r b border, 2px
// radius). `accent` is the token name driving border + text per section.
function Row({
  accent, onClick, children, tall = false,
}: { accent: string; onClick?: () => void; children: React.ReactNode; tall?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', minHeight: tall ? 56 : 45,
        background: 'var(--bg)',
        borderTop: `4px solid var(${accent})`, borderLeft: `4px solid var(${accent})`,
        borderRight: `1px solid var(${accent})`, borderBottom: `1px solid var(${accent})`,
        borderRadius: 2, padding: tall ? '12px' : '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        color: `var(${accent})`,
      }}
    >
      {children}
    </button>
  )
}

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
  letterSpacing: '3px', textTransform: 'uppercase', lineHeight: '16px',
}
const META: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '1px',
  textTransform: 'uppercase', lineHeight: '12px',
}

export default function AppHeader({
  entryCount, lensCount, mindmapHorizon, mindmapProgress,
}: Props) {
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const username = user?.username
    ? `@${user.username}`
    : user?.primaryEmailAddress?.emailAddress ?? null

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const badge = (iconName: string, onClick?: () => void, label?: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'var(--bg)', border: '2px solid var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: theme === 'cyberpunk' ? 'var(--pink)' : 'var(--green)',
        cursor: onClick ? 'pointer' : 'default', padding: 0,
      }}
    >
      <Icon name={iconName} size={26} />
    </button>
  )

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', zIndex: 50 }}>
      {/* Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 8, width: '100%',
      }}>
        {badge('camera', () => router.push('/app/journal-v2'), 'MindShift home')}
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 28,
          letterSpacing: '4.2px', lineHeight: '26px', color: 'var(--green)',
          textTransform: 'uppercase', margin: 0, whiteSpace: 'nowrap',
        }}>
          MindShift
        </p>
        {badge('psychology', () => setOpen(o => !o), 'Account menu')}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 60, right: 8, width: 229,
            background: 'var(--bg)', borderRadius: 2,
            display: 'flex', flexDirection: 'column', gap: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Profile (green) */}
          <Row accent="--green" tall onClick={() => router.push('/app/profile')}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={LABEL}>Profile</span>
              {username && <span style={META}>{username}</span>}
            </div>
          </Row>

          {/* Journal (pink) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Row accent="--pink" tall onClick={() => router.push('/app/journal-v2')}>
              <span style={LABEL}>Journal</span>
            </Row>
            <Row accent="--pink" onClick={() => router.push('/app/journal-v2')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="article" size={20} />
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span style={LABEL}>{entryCount ?? 0} entries</span>
                  <span style={META}>{lensCount ?? 0} lenses</span>
                </span>
              </span>
            </Row>
            <Row accent="--pink" onClick={() => router.push('/app/onboarding')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="add" size={20} /><span style={LABEL}>New</span>
              </span>
            </Row>
          </div>

          {/* Mind Map (cyan) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Row accent="--cyan" tall onClick={() => router.push('/app/mindmap')}>
              <span style={LABEL}>Mind Map</span>
            </Row>
            <Row accent="--cyan" onClick={() => router.push('/app/mindmap')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="tab_group" size={20} />
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span style={LABEL}>{mindmapHorizon ?? '—'}</span>
                  <span style={META}>{mindmapProgress ?? ''}</span>
                </span>
              </span>
            </Row>
            <Row accent="--cyan" onClick={() => router.push('/app/mindmap/new')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="add" size={20} /><span style={LABEL}>New</span>
              </span>
            </Row>
          </div>

          {/* Log out (green) */}
          <Row accent="--green" onClick={() => signOut({ redirectUrl: '/' })}>
            <span style={LABEL}>Log out</span>
          </Row>
        </div>
      )}
    </div>
  )
}
