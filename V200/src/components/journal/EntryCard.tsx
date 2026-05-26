'use client'
import { useState } from 'react'
import { FIGURES } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import LensCard from './LensCard'
import type { JournalEntry } from '@/lib/journal-types'

type Props = {
  entry: JournalEntry
  onDelete?: (id: string) => void
  initialExpanded?: boolean
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
      <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z" />
    </svg>
  )
}

// The green share-out icon that anchors the left of the cyberpunk lens row.
// Matches the Figma "ios_share" symbol — bottom rectangle with an up-arrow.
function ShareOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M12 2.5L7.5 7H11v9h2V7h3.5L12 2.5z" />
      <path d="M3 13.5V20c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5V13.5h-2V20H5v-6.5H3z" />
    </svg>
  )
}

// Pink/violet mind-icon that sits between the two MINDSHIFT wordmarks in
// the expanded-entry decorative row.
function MindIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
    </svg>
  )
}

function ShareCount({ n }: { n: number }) {
  return (
    <span title={`Shared ${n} time${n === 1 ? '' : 's'}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9,
        letterSpacing: '0.8px', color: 'var(--amber)',
        padding: '2px 5px', borderRadius: 2,
        border: '1px solid var(--amber)',
        marginLeft: 6,
      }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
        <path d="M14 5v4h-3l5 5 5-5h-3V5h-4zM4 7v12h12V14h-2v3H6V9h3V7H4z"/>
      </svg>
      {n}
    </span>
  )
}

export default function EntryCard({ entry, onDelete, initialExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const [isPublic, setIsPublic] = useState(entry.is_public)
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'

  const titleWords = entry.vent_text.split(/\s+/).filter(Boolean)
  const titleDisplay = (
    titleWords.length <= 5
      ? titleWords.join(' ')
      : titleWords.slice(0, 5).join(' ') + '…'
  ).toUpperCase()

  const figs = entry.lens_responses
    .map(lr => FIGURES.find(f => f.id === lr.figure_id))
    .filter((f): f is NonNullable<typeof f> => f != null)

  const totalShares = entry.lens_responses.reduce((n, lr) => n + (lr.shares?.length ?? 0), 0)

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/journal-v2/entries/${entry.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete?.(entry.id)
      } else {
        setDeleting(false)
        setConfirmingDelete(false)
        setError('Delete failed. Try again?')
      }
    } catch {
      setDeleting(false)
      setConfirmingDelete(false)
      setError('Delete failed. Try again?')
    }
  }

  async function togglePrivacy() {
    if (busy) return
    setBusy(true)
    setError(null)
    const next = !isPublic
    setIsPublic(next)
    try {
      const res = await fetch(`/api/journal-v2/entries/${entry.id}/privacy`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_public: next }),
      })
      if (!res.ok) {
        setIsPublic(!next)
        setError("Couldn't update privacy. Try again?")
      }
    } catch {
      setIsPublic(!next)
      setError("Couldn't update privacy. Try again?")
    } finally {
      setBusy(false)
    }
  }

  // Private is the default — keep it quiet so it doesn't compete with the title.
  // Public is the active choice — make it visible.
  const privacyBadge = isPublic ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9,
      letterSpacing: '1.5px', color: 'var(--green)',
      textTransform: 'uppercase', padding: '2px 6px',
      border: '1px solid var(--green)', borderRadius: 2,
    }}>
      <GlobeIcon />
      Public
    </span>
  ) : (
    <span title="Private" style={{
      display: 'inline-flex', alignItems: 'center',
      color: 'var(--text-meta)', opacity: 0.55,
    }}>
      <LockIcon />
    </span>
  )

  const privacyToggle = (
    <button
      type="button"
      onClick={togglePrivacy}
      disabled={busy}
      aria-label={isPublic ? 'Make this entry private' : 'Make this entry public'}
      style={{
        background: 'transparent',
        border: '1px solid var(--cyan)',
        color: 'var(--cyan)',
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 2,
        cursor: busy ? 'wait' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {isPublic ? <GlobeIcon /> : <LockIcon />}
      {isPublic ? 'Public · tap to make private' : 'Private · tap to make public'}
    </button>
  )

  // ─── Collapsed ─────────────────────────────────────────────────────────────
  if (!expanded) {
    const headerRow = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
          letterSpacing: '1.32px', lineHeight: '14px',
          color: isCyberpunk ? 'var(--cyan)' : (isKawaii ? 'var(--text-body)' : 'var(--cyan)'),
          textTransform: 'uppercase', margin: 0, flex: 1, textAlign: 'center',
        }}>
          {titleDisplay}
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {privacyBadge}
          {totalShares > 0 && <ShareCount n={totalShares} />}
        </span>
      </div>
    )

    if (isCyberpunk) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            background: 'var(--card-bg)',
            borderTop: '4px solid var(--cyan)', borderLeft: '4px solid var(--cyan)',
            borderRight: '1px solid var(--cyan)', borderBottom: '1px solid var(--cyan)',
            borderRadius: 'var(--card-radius)',
            height: 164, marginBottom: -4, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ borderBottom: '1px solid var(--cyan)', padding: '8px 12px 4px', flexShrink: 0 }}>
              {headerRow}
            </div>
            <div style={{ padding: '4px 16px', flex: 1, overflow: 'hidden' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-body)', margin: 0 }}>
                {entry.vent_text}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setExpanded(true)} style={{
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--violet)', borderLeft: '1px solid var(--violet)',
            borderRight: '4px solid var(--violet)', borderBottom: '4px solid var(--violet)',
            borderRadius: 'var(--card-radius)',
            padding: figs.length === 0 ? '12px 16px' : '8px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: figs.length === 0 ? 'center' : 'space-between',
            width: '100%', cursor: 'pointer',
          }}>
            {figs.length === 0 ? (
              <span style={{
                fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 12,
                letterSpacing: '1.5px', color: 'var(--green)', textTransform: 'uppercase',
              }}>
                Open · No lens yet
              </span>
            ) : (
              <>
                {/* Green share-out icon on the left — Figma 469:4023. Decorative
                    here (taps the whole row to expand); per-lens share lives
                    inside the expanded view. */}
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, color: 'var(--green)',
                }}>
                  <ShareOutIcon />
                </span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {figs.map((fig, i) => (
                    <div key={i} style={{
                      width: 48, height: 48, borderRadius: '50%',
                      border: '1px solid var(--green)',
                      background: 'var(--fig-avatar-grad)',
                      overflow: 'hidden', flexShrink: 0,
                      marginRight: i < figs.length - 1 ? -4 : 0,
                      position: 'relative', zIndex: i + 1,
                    }}>
                      {fig.imgCyberpunk && <img src={fig.imgCyberpunk} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </button>
        </div>
      )
    }

    if (isKawaii) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: -4 }}>
            <div style={{
              background: 'var(--input-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)',
              borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)',
              borderBottom: '1px solid var(--input-divider)',
              borderRadius: '32px 32px 0 0', padding: '8px 16px 4px',
            }}>
              {headerRow}
            </div>
            <div style={{
              background: 'var(--card-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)',
              borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)',
              borderRadius: '0 0 32px 32px', height: 140, overflow: 'hidden',
              padding: '4px 8px 4px 16px',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-body)', margin: 0 }}>
                {entry.vent_text}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setExpanded(true)} style={{
            background: 'var(--lens-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--violet)',
            borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)',
            borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)',
            borderRadius: '32px', padding: '8px 16px',
            display: 'flex', alignItems: 'center', justifyContent: figs.length === 0 ? 'center' : 'flex-end',
            width: '100%', cursor: 'pointer',
          }}>
            {figs.length === 0 ? (
              <span style={{
                fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 12,
                letterSpacing: '1.5px', color: 'var(--pink)', textTransform: 'uppercase',
              }}>
                Open · No lens yet
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {figs.map((fig, i) => (
                  <div key={i} style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '1px solid var(--pink)',
                    boxShadow: '0px 2px 8px 0px rgba(130,100,240,0.13)',
                    background: 'var(--fig-avatar-grad)',
                    overflow: 'hidden', flexShrink: 0,
                    marginRight: i < figs.length - 1 ? -4 : 0,
                    position: 'relative', zIndex: i + 1,
                  }}>
                    {fig.imgKawaii && <img src={fig.imgKawaii} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                ))}
              </div>
            )}
          </button>
        </div>
      )
    }

    // Notepad
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ filter: 'var(--card-filter)', marginBottom: -4 }}>
          <div style={{
            background: 'var(--card-bg)',
            borderTop: '1.5px solid var(--cyan)', borderLeft: '4px solid var(--cyan)',
            borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)',
            borderRadius: '8px 8px 0 0', padding: '8px 16px 4px',
          }}>
            {headerRow}
          </div>
          <div style={{
            background: 'var(--card-bg)',
            borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)',
            borderBottom: '1.5px solid var(--cyan)', borderRadius: '0 0 8px 8px',
            height: 140, overflow: 'hidden', padding: '4px 16px',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.18px', color: 'var(--text-body)', margin: 0 }}>
              {entry.vent_text}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setExpanded(true)} style={{
          filter: 'var(--card-filter)', background: 'var(--card-bg)',
          borderTop: '1.5px solid var(--green)', borderLeft: '4px solid var(--green)',
          borderRight: '1.5px solid var(--green)', borderBottom: '1.5px solid var(--green)',
          borderRadius: '8px', padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: figs.length === 0 ? 'center' : 'flex-end',
          width: '100%', cursor: 'pointer',
        }}>
          {figs.length === 0 ? (
            <span style={{
              fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 12,
              letterSpacing: '1.5px', color: 'var(--green)', textTransform: 'uppercase',
            }}>
              Open · No lens yet
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {figs.map((fig, i) => (
                <div key={i} style={{
                  width: 48, height: 48, borderRadius: '50%',
                  border: '2px solid var(--pink)',
                  background: 'var(--fig-avatar-grad)',
                  overflow: 'hidden', flexShrink: 0,
                  marginRight: i < figs.length - 1 ? -4 : 0,
                  position: 'relative', zIndex: i + 1,
                }}>
                  {fig.imgCyberpunk && <img src={fig.imgCyberpunk} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </button>
      </div>
    )
  }

  // ─── Expanded ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)', borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)', borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
      }}>
        <button type="button" onClick={() => setExpanded(false)} style={{
          background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--cyan)',
          padding: '8px 12px', width: '100%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
            letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)',
            textTransform: 'uppercase',
          }}>
            {titleDisplay}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-meta)',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Close
          </span>
        </button>
        <div style={{ padding: '12px 16px 16px' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
            letterSpacing: '0.52px', color: 'var(--text-sub)', margin: 0,
          }}>
            {entry.vent_text}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(127,127,127,0.2)',
            gap: 8, flexWrap: 'wrap',
          }}>
            {privacyToggle}
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-meta)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>
              {new Date(entry.created_at).toLocaleDateString()}
            </span>
          </div>
          {error && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                marginTop: 10,
                padding: '6px 10px',
                background: 'rgba(255,45,120,0.08)',
                borderLeft: '2px solid var(--pink)',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--pink)',
                letterSpacing: '0.4px',
              }}
            >
              {error}
            </div>
          )}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            {!confirmingDelete ? (
              <button type="button" onClick={() => setConfirmingDelete(true)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-meta)',
                  fontFamily: 'var(--font-body)', fontSize: 10,
                  letterSpacing: '0.8px', textTransform: 'uppercase',
                  cursor: 'pointer', padding: 4,
                }}>
                Delete entry
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 10,
                  color: 'var(--pink)', letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}>
                  Delete?
                </span>
                <button type="button" onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  style={{
                    background: 'transparent', border: '1px solid var(--text-meta)',
                    color: 'var(--text-sub)',
                    fontFamily: 'var(--font-btn)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '1px', textTransform: 'uppercase',
                    padding: '4px 8px', borderRadius: 2, cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting}
                  style={{
                    background: 'transparent', border: '1px solid var(--pink)',
                    color: 'var(--pink)',
                    fontFamily: 'var(--font-btn)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '1px', textTransform: 'uppercase',
                    padding: '4px 8px', borderRadius: 2,
                    cursor: deleting ? 'wait' : 'pointer',
                  }}>
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {entry.lens_responses.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-sub)',
          letterSpacing: '0.5px', textAlign: 'center', padding: '8px 0',
        }}>
          No lens applied to this entry yet.
        </p>
      ) : (
        <>
          {/* MINDSHIFT [mind icon] MINDSHIFT decorative row — Figma 483:2793.
              Pure decoration that anchors the transition from the vent card
              to the lens responses below. */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 4px',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
              letterSpacing: '1.44px', lineHeight: '20px',
              color: 'var(--cyan)', textTransform: 'uppercase', margin: 0,
            }}>MindShift</p>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--green)', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: 'var(--pink)',
            }}>
              <MindIcon />
            </div>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
              letterSpacing: '1.44px', lineHeight: '20px',
              color: 'var(--violet)', textTransform: 'uppercase', margin: 0,
            }}>MindShift</p>
          </div>
          {/* Horizontal scroll if more than one lens — matches Figma 469:4395
              (three lens cards in a row, swipe to see the next). Single-lens
              entries render full-width without scroll plumbing. */}
          {entry.lens_responses.length === 1 ? (
            <LensCard
              response={entry.lens_responses[0]}
              ventText={entry.vent_text}
              isEntryPublic={isPublic}
            />
          ) : (
            <div style={{
              display: 'flex', gap: 12, overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 4,
              // hide scrollbar so the scroll feels native on mobile
              scrollbarWidth: 'none',
            }}>
              {entry.lens_responses.map(lr => (
                <div key={lr.id} style={{
                  flex: '0 0 100%', scrollSnapAlign: 'start',
                }}>
                  <LensCard
                    response={lr}
                    ventText={entry.vent_text}
                    isEntryPublic={isPublic}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
