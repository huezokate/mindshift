'use client'
// App-wide top nav (Figma header + dropdown 624:8265 "drop down menu work in
// progress"). Bar: [brand lens icon] · MINDS SHIFT · [account button → dropdown].
// Dropdown rows are the design-system Button (Figma "Buttons" component), one
// variant per section, matched to the canonical per-theme frames:
//   • Profile / Log out → primary  (cyber green / kawaii amber / notepad white+dropshadow)
//   • Journal           → journal  (pink/red everywhere)
//   • Mind Map          → mindmap  (cyber cyan / kawaii mint / notepad green)
// `journal`/`mindmap` are semantic variants that resolve to the right --btn-*
// family per theme (the accent slots are swapped cyber↔kawaii/notepad), so no
// hardcoded hex anywhere — driven entirely by the structural token families.
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import Button, { type ButtonVariant, type ThemeName } from '@/components/ui/Button'

type Props = {
  entryCount?: number
  lensCount?: number
  mindmapHorizon?: string
  mindmapProgress?: string
}

// One dropdown row = the design-system Button, full-width, role="menuitem".
// `variant` carries the per-section colour treatment (see header comment); the
// semantic journal/mindmap variants need `theme` to resolve to the right family.
function Row({
  variant, theme, onClick, children, tall = false,
}: {
  variant: ButtonVariant; theme: ThemeName; onClick?: () => void
  children: React.ReactNode; tall?: boolean
}) {
  return (
    <Button variant={variant} theme={theme} onClick={onClick} tall={tall} fullWidth role="menuitem">
      {children}
    </Button>
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
            // Transparent layout shell — the buttons carry all the fill/chrome,
            // the container itself has no background or shadow (Kate, Figma).
            position: 'absolute', top: 60, right: 8, width: 229,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          {/* Profile — primary variant, 72px tall (Figma 624:7909) */}
          <Row variant="primary" theme={theme} tall onClick={() => router.push('/app/profile')}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={LABEL}>Profile</span>
              {username && <span style={META}>{username}</span>}
            </div>
          </Row>

          {/* Journal — journal variant (pink/red in every theme) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Row variant="journal" theme={theme} tall onClick={() => router.push('/app/journal-v2')}>
              <span style={LABEL}>Journal</span>
            </Row>
            <Row variant="journal" theme={theme} onClick={() => router.push('/app/journal-v2')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="article" size={20} />
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span style={LABEL}>{entryCount ?? 0} entries</span>
                  <span style={META}>{lensCount ?? 0} lenses</span>
                </span>
              </span>
            </Row>
            <Row variant="journal" theme={theme} onClick={() => router.push('/app/onboarding')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="add" size={20} /><span style={LABEL}>New</span>
              </span>
            </Row>
          </div>

          {/* Mind Map — mindmap variant (cyber cyan / kawaii mint / notepad green) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Row variant="mindmap" theme={theme} tall onClick={() => router.push('/app/mindmap')}>
              <span style={LABEL}>Mind Map</span>
            </Row>
            <Row variant="mindmap" theme={theme} onClick={() => router.push('/app/mindmap')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="tab_group" size={20} />
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span style={LABEL}>{mindmapHorizon ?? '—'}</span>
                  <span style={META}>{mindmapProgress ?? ''}</span>
                </span>
              </span>
            </Row>
            <Row variant="mindmap" theme={theme} onClick={() => router.push('/app/mindmap/new')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="add" size={20} /><span style={LABEL}>New</span>
              </span>
            </Row>
          </div>

          {/* Log out — primary variant (matches Profile, Figma 624:7938) */}
          <Row variant="primary" theme={theme} onClick={() => signOut({ redirectUrl: '/' })}>
            <span style={LABEL}>Log out</span>
          </Row>
        </div>
      )}
    </div>
  )
}
