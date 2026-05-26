'use client'
import { useState } from 'react'
import { FIGURES } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import ShareSheet from './ShareSheet'
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

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  const diff = (Date.now() - t) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`
  return `${Math.floor(diff / (86400 * 365))}y ago`
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}
      style={{ display: 'block' }}>
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.8 5.8 21.2l1.6-7L2 9.5l7.1-.6L12 2z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
      <path d="M18 8a3 3 0 1 0-2.83-4H15A3 3 0 0 0 17 6.17V8a3 3 0 0 0 1 0z" />
      <path d="M18 6a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm0 10a2 2 0 1 1-2 2 2 2 0 0 1 2-2zM8 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2zm7.1 4.2L9 12.7a3 3 0 0 0 0-1.4l6.1-3.5a3 3 0 1 0-1-1.7L8 9.6a3 3 0 1 0 0 4.8l6.1 3.5a3 3 0 1 0 1-1.7z" />
    </svg>
  )
}

export default function LensCard({ response, ventText, isEntryPublic }: Props) {
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'
  const fig = FIGURES.find(f => f.id === response.figure_id)
  const portrait = fig ? (isKawaii ? fig.imgKawaii : fig.imgCyberpunk) : null

  const [isFavorite, setIsFavorite] = useState(response.is_favorite)
  const [shares, setShares] = useState(response.shares ?? [])
  const [shareOpen, setShareOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function toggleFavorite() {
    if (busy) return
    setBusy(true)
    const next = !isFavorite
    setIsFavorite(next)
    try {
      const res = await fetch(`/api/journal-v2/responses/${response.id}/favorite`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_favorite: next }),
      })
      if (!res.ok) setIsFavorite(!next)
    } catch {
      setIsFavorite(!next)
    } finally {
      setBusy(false)
    }
  }

  function onShared(platform: SharePlatform) {
    setShares(prev => [...prev, { id: `local-${Date.now()}`, platform, shared_at: new Date().toISOString() }])
  }

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
          <span style={{ color: 'var(--text-meta)' }}> · {relativeTime(s.shared_at)}</span>
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
        <StarIcon filled={isFavorite} />
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
        <ShareIcon />
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
          <div style={{ padding: 16 }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
              letterSpacing: '0.52px', color: 'var(--cyan)', margin: 0,
            }}>
              {response.response_text}
            </p>
            {shareBadges}
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
