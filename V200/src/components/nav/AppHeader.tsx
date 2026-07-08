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
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [fetchedCounts, setFetchedCounts] = useState<{ entries: number; lenses: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const username = user?.username
    ? `@${user.username}`
    : user?.primaryEmailAddress?.emailAddress ?? null

  // Counts: a page may pass live values (the journal page does); otherwise a
  // signed-in header self-fetches its totals so the dropdown isn't stuck at 0
  // on onboarding / response / lens etc. Props always win when provided.
  useEffect(() => {
    if (entryCount != null && lensCount != null) return
    if (!isSignedIn) { setFetchedCounts(null); return }
    let alive = true
    fetch('/api/journal-v2/counts')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && d) setFetchedCounts(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [isSignedIn, entryCount, lensCount])

  const shownEntries = entryCount ?? fetchedCounts?.entries ?? 0
  const shownLenses = lensCount ?? fetchedCounts?.lenses ?? 0

  // Anon has no account-bound surfaces (journal, profile, mind map all persist
  // per user_id), so every account-menu destination funnels anon users to
  // sign-in/create-account — we need them onboarded (Kate, 23 June). Signed-in
  // users go straight to the destination.
  const goOrSignIn = (dest: string, reason: string) =>
    isSignedIn
      ? router.push(dest)
      : router.push(`/sign-in?reason=${reason}&redirect_url=` + encodeURIComponent(dest))

  const goJournal = () => goOrSignIn('/app/journal-v2', 'journal')

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

  // Brand accent for the wordmark + lens badge. Cyberpunk/notepad keep the green
  // accent slot; kawaii's --green is teal (reads as a washed teal/cyan brand mark),
  // so kawaii uses the design-system purple instead — note --violet is a pink accent
  // slot in kawaii (#ff50c5), so the real purple is --fig-name-unsel (#7e2091).
  const brandAccent = theme === 'kawaii' ? 'var(--fig-name-unsel)' : 'var(--green)'

  const badge = (iconName: string, onClick?: () => void, label?: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'var(--bg)', border: `2px solid ${brandAccent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: theme === 'cyberpunk' ? 'var(--pink)' : brandAccent,
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
        {badge('camera', () => router.push(isSignedIn ? '/app/journal-v2' : '/app/onboarding'), 'Minds Shift home')}
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 28,
          letterSpacing: '4.2px', lineHeight: '26px', color: brandAccent,
          textTransform: 'uppercase', margin: 0, whiteSpace: 'nowrap',
        }}>
          Minds Shift
        </p>
        {/* Menu trigger — text + icon, primary button treatment so it matches
            the design-system CTA per theme (kawaii amber fill / cyberpunk black
            + green border / notepad white fill + black border). Driven by the
            --btn-* (primary) token family, never hardcoded. */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label="Account menu"
          aria-expanded={open}
          style={{
            height: 48, flexShrink: 0,
            background: 'var(--btn-bg)',
            color: 'var(--btn-color)',
            borderTop: 'var(--btn-bt)',
            borderLeft: 'var(--btn-bl)',
            borderRight: 'var(--btn-br)',
            borderBottom: 'var(--btn-bb)',
            borderRadius: 'var(--btn-radius, 24px)',
            boxShadow: 'var(--btn-shadow, none)',
            filter: 'var(--btn-filter, none)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', padding: '0 18px',
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
            letterSpacing: '3px', textTransform: 'uppercase', lineHeight: 1,
          }}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
          Menu
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            // No frame — the rows carry their own per-theme fill (Kate, 23 June).
            // Transparent layout shell only.
            position: 'absolute', top: 60, right: 8, width: 229,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          {/* Profile — primary variant, 72px tall (Figma 624:7909) */}
          <Row variant="primary" theme={theme} tall onClick={() => goOrSignIn('/app/profile', 'profile')}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={LABEL}>Profile</span>
              {username && <span style={META}>{username}</span>}
            </div>
          </Row>

          {/* Journal — journal variant (pink/red in every theme) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Row variant="journal" theme={theme} tall onClick={goJournal}>
              <span style={LABEL}>Journal</span>
            </Row>
            {isSignedIn ? (
              <Row variant="journal" theme={theme} onClick={goJournal}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <Icon name="article" size={20} />
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                    <span style={LABEL}>{shownEntries} entries</span>
                    <span style={META}>{shownLenses} lenses</span>
                  </span>
                </span>
              </Row>
            ) : (
              <Row variant="journal" theme={theme} onClick={goJournal}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <Icon name="login" size={20} /><span style={LABEL}>Sign in to save</span>
                </span>
              </Row>
            )}
            <Row variant="journal" theme={theme} onClick={() => router.push('/app/onboarding')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="add" size={20} /><span style={LABEL}>New</span>
              </span>
            </Row>
          </div>

          {/* Mind Map — mindmap variant (cyber cyan / kawaii mint / notepad green).
              Anon → sign-in (account-bound, like Journal). */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Row variant="mindmap" theme={theme} tall onClick={() => goOrSignIn('/app/mindmap', 'mindmap')}>
              <span style={LABEL}>Mind Map</span>
            </Row>
            <Row variant="mindmap" theme={theme} onClick={() => goOrSignIn('/app/mindmap', 'mindmap')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="tab_group" size={20} />
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span style={LABEL}>{mindmapHorizon ?? '—'}</span>
                  <span style={META}>{mindmapProgress ?? ''}</span>
                </span>
              </span>
            </Row>
            <Row variant="mindmap" theme={theme} onClick={() => goOrSignIn('/app/mindmap/new', 'mindmap')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Icon name="add" size={20} /><span style={LABEL}>New</span>
              </span>
            </Row>
          </div>

          {/* Log out (signed-in) / Sign in (anon) — primary variant (Figma 624:7938) */}
          {isSignedIn ? (
            <Row variant="primary" theme={theme} onClick={() => signOut({ redirectUrl: '/' })}>
              <span style={LABEL}>Log out</span>
            </Row>
          ) : (
            <Row variant="primary" theme={theme} onClick={() => router.push('/sign-in')}>
              <span style={LABEL}>Sign in</span>
            </Row>
          )}
        </div>
      )}
    </div>
  )
}
