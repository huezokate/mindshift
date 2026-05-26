'use client'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme'
import { renderQuoteCard } from './QuoteCardCanvas'
import type { SharePlatform } from '@/lib/journal-types'

type Props = {
  responseId: string
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
  // isEntryPublic intentionally unused: copy-link is gated on a future
  // public per-entry route, not on this flag (see copyLink handler).
  isEntryPublic: _isEntryPublic,
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
    const file = new File([pngBlob], 'mindshift.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          text: 'A perspective from MindShift',
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
    a.download = `mindshift-${safeFig || 'quote'}-${Date.now()}.png`
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
          background: 'var(--card-bg)',
          borderTop: 'var(--card-bt)',
          borderLeft: 'var(--card-bl)',
          borderRight: 'var(--card-br)',
          borderBottom: 'var(--card-bb)',
          borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
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

        {/* Platform buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <ShareButton label="Share…" sub="your device's share sheet" onClick={shareNative} disabled={!pngBlob} />
          <ShareButton label="Instagram" sub="saves image, opens app" onClick={shareInstagram} disabled={!pngBlob} />
          <ShareButton label="TikTok" sub="saves image, opens app" onClick={shareTikTok} disabled={!pngBlob} />
          <ShareButton label="Facebook" sub="saves image, opens sharer" onClick={shareFacebook} />
          <ShareButton label="Copy link" sub="public links coming soon" onClick={copyLink} />
          <ShareButton label="Download" sub="save the PNG" onClick={downloadPng} disabled={!pngBlob} />
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

function ShareButton({
  label,
  sub,
  onClick,
  disabled,
}: { label: string; sub?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
        textAlign: 'left',
        color: disabled ? 'var(--text-muted)' : 'var(--btn-secondary-color, var(--cyan))',
        background: 'var(--btn-secondary-bg, transparent)',
        borderTop: 'var(--btn-secondary-bt, 1px solid var(--cyan))',
        borderLeft: 'var(--btn-secondary-bl, 1px solid var(--cyan))',
        borderRight: 'var(--btn-secondary-br, 2px solid var(--cyan))',
        borderBottom: 'var(--btn-secondary-bb, 2px solid var(--cyan))',
        borderRadius: 'var(--btn-secondary-radius, 2px)',
        padding: '10px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        fontFamily: 'var(--font-btn)', fontWeight: 600,
        fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase',
      }}>{label}</span>
      {sub && (
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 400,
          fontSize: 10, letterSpacing: '0.3px', textTransform: 'none',
          color: 'var(--text-meta)', lineHeight: 1.2,
        }}>{sub}</span>
      )}
    </button>
  )
}
