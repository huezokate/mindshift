'use client'
import { useState } from 'react'
import { FIGURES, portraitFor } from '@/lib/figures'
import Icon from '@/components/ui/Icon'
import { useTheme } from '@/lib/theme'
import ShareSheet from './ShareSheet'
import { relativeTime } from '@/lib/relative-time'
import type { LensResponseV2, SharePlatform } from '@/lib/journal-types'

type Props = {
  response: LensResponseV2
  ventText: string
  isEntryPublic: boolean
}

const PLATFORM_LABEL: Record<SharePlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  link: 'Link',
  native: 'Share sheet',
  download: 'Downloaded',
}

// "just now" stays as-is; everything else gets " ago" appended for the share log.
function relativeTimeAgo(iso: string): string {
  const t = relativeTime(iso)
  return t === 'just now' ? t : `${t} ago`
}

export default function LensCard({ response, ventText, isEntryPublic }: Props) {
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'
  const fig = FIGURES.find(f => f.id === response.figure_id)
  const portrait = fig ? portraitFor(fig, theme) : null

  const [isFavorite, setIsFavorite] = useState(response.is_favorite)
  const [shares, setShares] = useState(response.shares ?? [])
  const [shareOpen, setShareOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [favError, setFavError] = useState<string | null>(null)

  async function toggleFavorite() {
    if (busy) return
    setBusy(true)
    setFavError(null)
    const next = !isFavorite
    setIsFavorite(next)
    try {
      const res = await fetch(`/api/journal-v2/responses/${response.id}/favorite`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_favorite: next }),
      })
      if (!res.ok) {
        setIsFavorite(!next)
        setFavError("Couldn't save. Try again?")
      }
    } catch {
      setIsFavorite(!next)
      setFavError("Couldn't save. Try again?")
    } finally {
      setBusy(false)
    }
  }

  function onShared(platform: SharePlatform) {
    // crypto.randomUUID avoids React key collisions when shares fire in
    // the same millisecond (e.g. user double-taps a share button).
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setShares(prev => [...prev, { id, platform, shared_at: new Date().toISOString() }])
  }

  const errorRow = favError && (
    <p
      role="alert"
      aria-live="polite"
      style={{
        marginTop: 8,
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--pink)',
        letterSpacing: '0.4px',
      }}
    >
      {favError}
    </p>
  )

  const shareBadges = shares.length > 0 && (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      paddingTop: 12,
      borderTop: '1px solid rgba(127,127,127,0.18)',
      marginTop: 12,
    }}>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 10,
        letterSpacing: '1.2px',
        color: 'var(--text-meta)',
        textTransform: 'uppercase',
      }}>Shared</span>
      {shares.map(s => (
        <span key={s.id} style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--text-sub)',
          letterSpacing: '0.4px',
        }}>
          <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
            {PLATFORM_LABEL[s.platform]}
          </span>
          <span style={{ color: 'var(--text-meta)' }}> · {relativeTimeAgo(s.shared_at)}</span>
        </span>
      ))}
    </div>
  )

  const headerActions = (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={isFavorite ? 'Unsave this response' : 'Save this response'}
        title={isFavorite ? 'Saved' : 'Save'}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 6,
          cursor: 'pointer',
          color: isFavorite ? 'var(--amber)' : 'var(--text-muted)',
          display: 'flex',
        }}
      >
        <Icon name="star" fill={isFavorite ? 1 : 0} size={20} />
      </button>
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        aria-label="Share this lens"
        title="Share"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 6,
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
        }}
      >
        <Icon name="ios_share" size={18} />
      </button>
    </div>
  )

  // ─── Cyberpunk ──────────────────────────────────────────────────────────────
  if (isCyberpunk) {
    return (
      <>
        <div style={{
          background: 'var(--card-bg)',
          borderTop: '1px solid var(--violet)',
          borderLeft: '1px solid var(--violet)',
          borderRight: '4px solid var(--violet)',
          borderBottom: '4px solid var(--violet)',
          borderRadius: 'var(--card-radius)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '4px 8px 4px 16px',
            borderBottom: '1px solid var(--violet)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 16,
              border: '1px solid var(--pink)',
              background: 'var(--fig-avatar-grad)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <p style={{
              flex: 1,
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
              letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--green)',
              textTransform: 'uppercase', margin: 0,
            }}>
              {fig?.name ?? response.figure_id}
            </p>
            {headerActions}
          </div>
          {/* Body — Figma 397:3671 p-[16px], 10px gap, Courier 14px/20 / 0.52.
              Quote pink centered (482:2501), body cyan (397:3672). */}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fig?.quote && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px',
                color: 'var(--pink)', textAlign: 'center',
                margin: 0,
              }}>
                &ldquo;{fig.quote}&rdquo;
              </p>
            )}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
              letterSpacing: '0.52px', color: 'var(--cyan)', margin: 0,
            }}>
              {response.response_text}
            </p>
            {shareBadges}
            {errorRow}
          </div>
        </div>
        {shareOpen && (
          <ShareSheet
            responseId={response.id}
            figureId={response.figure_id}
            responseText={response.response_text}
            ventText={ventText}
            isEntryPublic={isEntryPublic}
            onClose={() => setShareOpen(false)}
            onShared={onShared}
          />
        )}
      </>
    )
  }

  // ─── Kawaii ─────────────────────────────────────────────────────────────────
  if (isKawaii) {
    return (
      <>
        <div>
          <div style={{
            background: 'var(--lens-header-bg)',
            boxShadow: 'inset 4px 0 0 0 var(--cyan)',
            borderTop: 'var(--input-bt)',
            borderLeft: 'var(--input-bl)',
            borderRight: 'var(--input-br)',
            borderBottom: '1px solid var(--input-divider)',
            borderRadius: 'var(--input-radius) var(--input-radius) 0 0',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '6px 8px 6px 16px',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: 'var(--fig-avatar-border)',
              boxShadow: 'var(--fig-avatar-shadow)',
              background: 'var(--fig-avatar-grad)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <p style={{
              flex: 1,
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.52px', lineHeight: '14px', color: 'var(--text-body)',
              textTransform: 'uppercase', margin: 0,
            }}>
              {fig?.name ?? response.figure_id}
            </p>
            {headerActions}
          </div>
          <div style={{
            background: 'var(--card-bg)',
            boxShadow: 'inset 4px 0 0 0 var(--cyan)',
            borderLeft: 'var(--input-bl)',
            borderRight: 'var(--input-br)',
            borderBottom: 'var(--input-bb)',
            borderRadius: '0 0 var(--input-radius) var(--input-radius)',
            padding: 16,
          }}>
            {fig?.quote && (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '18px',
                letterSpacing: '0.4px', color: 'var(--lens-quote-color)',
                textAlign: 'center', marginBottom: 8,
              }}>
                &ldquo;{fig.quote}&rdquo;
              </p>
            )}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
              letterSpacing: '0.52px', color: 'var(--text-body)', margin: 0,
            }}>
              {response.response_text}
            </p>
            {shareBadges}
            {errorRow}
          </div>
        </div>
        {shareOpen && (
          <ShareSheet
            responseId={response.id}
            figureId={response.figure_id}
            responseText={response.response_text}
            ventText={ventText}
            isEntryPublic={isEntryPublic}
            onClose={() => setShareOpen(false)}
            onShared={onShared}
          />
        )}
      </>
    )
  }

  // ─── Notepad ────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ filter: 'var(--card-filter)' }}>
        <div style={{
          background: 'var(--card-bg)',
          borderTop: '1.5px solid var(--green)',
          borderLeft: '4px solid var(--green)',
          borderRight: '1.5px solid var(--green)',
          borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '4px 8px 4px 22px',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 16,
            border: '1px solid var(--pink)',
            background: 'var(--fig-avatar-grad)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <p style={{
            flex: 1,
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
            letterSpacing: '0.55px', lineHeight: '14px', color: 'var(--green)',
            textTransform: 'uppercase', margin: 0,
          }}>
            {fig?.name ?? response.figure_id}
          </p>
          {headerActions}
        </div>
        <div style={{
          background: 'var(--card-bg)',
          borderLeft: '4px solid var(--green)',
          borderRight: '1.5px solid var(--green)',
          borderBottom: '1.5px solid var(--green)',
          borderRadius: '0 0 var(--card-radius) var(--card-radius)',
          padding: 16,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
            letterSpacing: '0.18px', color: 'var(--text-body)', margin: 0,
          }}>
            {response.response_text}
          </p>
          {shareBadges}
            {errorRow}
        </div>
      </div>
      {shareOpen && (
        <ShareSheet
          responseId={response.id}
          figureId={response.figure_id}
          responseText={response.response_text}
          ventText={ventText}
          isEntryPublic={isEntryPublic}
          onClose={() => setShareOpen(false)}
          onShared={onShared}
        />
      )}
    </>
  )
}
