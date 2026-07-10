'use client'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme'
import { renderQuoteCard } from './QuoteCardCanvas'
import type { SharePlatform } from '@/lib/journal-types'
import Button from '@/components/ui/Button'
import SocialIcon from './SocialIcon'

type Props = {
  /** Persisted response id — only needed to LOG the share. Omitted before save
      (response screen), where the card is generated from the content alone. */
  responseId?: string
  figureId: string
  responseText: string
  ventText: string
  isEntryPublic: boolean
  onClose: () => void
  onShared: (platform: SharePlatform) => void
}

export default function ShareSheet({
  responseId,
  figureId,
  responseText,
  ventText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- copy-link gating moved to a future public per-entry route; keeping the prop for an API-stable handoff
  isEntryPublic,
  onClose,
  onShared,
}: Props) {
  const { theme } = useTheme()
  const [pngUrl, setPngUrl] = useState<string | null>(null)
  const [pngBlob, setPngBlob] = useState<Blob | null>(null)
  const [includeVent, setIncludeVent] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  // `building` is derived from pngUrl, so toggling state on render isn't needed.
  const building = !pngUrl
  // Track every Blob URL we mint so we can revoke them on unmount or
  // when a new render replaces them — prevents the leak that would
  // otherwise occur on rapid input toggles.
  const allUrlsRef = useRef<string[]>([])

  const themeKey = (theme === 'kawaii' || theme === 'notepad') ? theme : 'cyberpunk'
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Revoke every Blob URL we created when the sheet unmounts.
  useEffect(() => {
    const urls = allUrlsRef.current
    return () => {
      for (const u of urls) URL.revokeObjectURL(u)
      urls.length = 0
    }
  }, [])

  // Esc to close + lock body scroll + focus on mount + simple Tab focus trap
  useEffect(() => {
    const dialog = dialogRef.current
    const focusables = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
        : []

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    renderQuoteCard({
      figureId,
      responseText,
      theme: themeKey,
      ventText,
      includeVent,
    })
      .then(blob => {
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        allUrlsRef.current.push(url)
        setPngBlob(blob)
        setPngUrl(url)
      })
      .catch(() => {
        /* keep building=true (derived) so user sees the spinner */
      })
    return () => {
      cancelled = true
    }
  }, [figureId, responseText, themeKey, ventText, includeVent])

  async function logShare(platform: SharePlatform) {
    // No persisted id (sharing before the entry is saved) → nothing to log to,
    // but the share still happened, so notify the parent for UI/analytics.
    if (!responseId) { onShared(platform); return }
    try {
      await fetch(`/api/journal-v2/responses/${responseId}/share`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      onShared(platform)
    } catch {
      // non-blocking
    }
  }

  async function shareNative() {
    if (!pngBlob) return
    const file = new File([pngBlob], 'minds-shift.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          text: 'A perspective from Minds Shift',
        })
        await logShare('native')
        setStatus('Shared.')
      } catch {
        setStatus(null)
      }
    } else {
      setStatus('Native share is not supported on this device. Use Download instead.')
    }
  }

  async function shareInstagram() {
    downloadPng()
    await logShare('instagram')
    setStatus('Image saved. Open Instagram and add it to a Story or post.')
    try { window.location.href = 'instagram://library' } catch {}
  }

  async function shareTikTok() {
    downloadPng()
    await logShare('tiktok')
    setStatus('Image saved. Open TikTok and create a post with it.')
    try { window.location.href = 'snssdk1233://' } catch {}
  }

  async function shareFacebook() {
    // Facebook's sharer scrapes Open Graph tags from the linked URL. The
    // public per-entry route doesn't exist yet (out of scope for v1), so
    // we share the marketing site URL. The PNG is downloaded alongside
    // so the user can attach it manually.
    downloadPng()
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://minds-shift.com')}`
    window.open(fbUrl, '_blank', 'noopener')
    await logShare('facebook')
    setStatus('Image saved and Facebook sharer opened. Attach the image in the new tab.')
  }

  async function copyLink() {
    // There is no public per-entry route yet — copying /app/journal-v2
    // would just send the recipient to a sign-in screen with no context.
    // Keep this button visible but honest about what it does.
    setStatus(
      'A public link to share individual entries isn’t ready yet. Use Download or Native share to send the quote card.'
    )
  }

  function downloadPng() {
    if (!pngUrl) return
    const safeFig = figureId.replace(/[^a-z0-9-]/gi, '')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = `minds-shift-${safeFig || 'quote'}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    logShare('download')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        ref={dialogRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          // Chrome matches the theme's "Add Card"/FeatureCard (Figma 397:3618):
          // its border weights (1/4/2/4), radius, fill, and effects — not the
          // content card (Kate 2026-07-10).
          background: 'var(--fcard-bg)',
          borderTop: 'var(--fcard-bt)',
          borderLeft: 'var(--fcard-bl)',
          borderRight: 'var(--fcard-br)',
          borderBottom: 'var(--fcard-bb)',
          borderRadius: 'var(--fcard-radius) var(--fcard-radius) 0 0',
          boxShadow: 'var(--fcard-inset, none)',
          filter: 'var(--fcard-filter, none)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '1.44px',
            color: 'var(--cyan)',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Make a quote card
          </p>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-sub)',
              fontSize: 24,
              lineHeight: 1,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Preview */}
        <div style={{
          aspectRatio: '1080 / 1350',
          background: 'var(--bg)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {building && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Building card…
            </p>
          )}
          {!building && pngUrl && (
            <img
              src={pngUrl}
              alt="Share card preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          )}
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--text-sub)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={includeVent}
            onChange={e => setIncludeVent(e.target.checked)}
            style={{ accentColor: 'var(--cyan)' }}
          />
          Include what I wrote
        </label>

        {/* Platform actions — icon buttons (Kate 2026-07-10): the brand ones
            carry the Figma social SVGs (SocialIcon), utilities use Material
            glyphs via the design-system icon-only Button. */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <IconAction label="Share" onClick={shareNative} disabled={!pngBlob} icon="ios_share" />
          <IconAction label="Instagram" onClick={shareInstagram} disabled={!pngBlob} social="instagram" />
          <IconAction label="TikTok" onClick={shareTikTok} disabled={!pngBlob} social="tiktok" />
          <IconAction label="Facebook" onClick={shareFacebook} social="facebook" />
          <IconAction label="Copy link" onClick={copyLink} icon="link" />
          <IconAction label="Download" onClick={downloadPng} disabled={!pngBlob} icon="download" />
        </div>

        {status && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: '18px',
            color: 'var(--text-sub)',
            margin: 0,
            padding: 8,
            background: 'rgba(0,245,255,0.06)',
            borderLeft: '2px solid var(--cyan)',
          }}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

// One share action: a 45px icon-only design-system Button (secondary — the
// positive/action family) carrying either a Figma brand SVG (SocialIcon) or a
// Material glyph, with a 10px caption beneath.
function IconAction({
  label, onClick, disabled, icon, social,
}: { label: string; onClick: () => void; disabled?: boolean; icon?: string; social?: SharePlatform }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 56 }}>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={onClick}
        ariaLabel={label}
        icon={social ? undefined : icon}
        iconSize={20}
        style={{ width: 45, minHeight: 45, padding: 0 }}
      >
        {social ? <SocialIcon platform={social} size={22} /> : undefined}
      </Button>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.4px',
        textTransform: 'uppercase', color: 'var(--text-sub)', textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>{label}</span>
    </div>
  )
}
