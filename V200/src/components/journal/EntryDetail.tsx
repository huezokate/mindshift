'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import AppHeader from '@/components/nav/AppHeader'
import LensCard from './LensCard'
import ShareSheet from './ShareSheet'
import LensPickerSheet from './LensPickerSheet'
import UpcomingChip from './UpcomingChip'
import type { JournalEntry, LensResponseV2, SharePlatform } from '@/lib/journal-types'
import { deriveTitleFallback } from '@/lib/title'
import { applyLensToEntry } from '@/lib/add-lens'

type Props = {
  entry: JournalEntry
}

export default function EntryDetail({ entry }: Props) {
  const router = useRouter()
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'

  const [activeLens, setActiveLens] = useState(0)
  // Detail-page ShareSheet is opened from the "Socials" button beneath the
  // active lens card (Figma 602:6457). It shares the active lens's quote card.
  const [shareLens, setShareLens] = useState<LensResponseV2 | null>(null)
  const lensScrollRef = useRef<HTMLDivElement>(null)

  // Lenses live in state so an added lens (T-018-04) shows immediately.
  const [lenses, setLenses] = useState<LensResponseV2[]>(entry.lens_responses)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [addingLens, setAddingLens] = useState(false)
  const [addLensError, setAddLensError] = useState<string | null>(null)
  // Set after adding a lens so the post-render effect centers the carousel on it.
  const scrollToNewLens = useRef(false)

  // "Chat with the Lens" (T-020-02) — navigate to the dedicated chat screen for
  // this lens's figure; the vent + this reply open the thread as chat bubbles.
  function openChat(lens: LensResponseV2) {
    router.push(`/app/journal-v2/${entry.id}/chat/${lens.figure_id}`)
  }

  async function handlePickLens(figureId: string) {
    if (addingLens) return
    setAddingLens(true)
    setAddLensError(null)
    try {
      const { lens } = await applyLensToEntry({
        sessionId: entry.id, ventText: entry.vent_text, figureId, theme,
      })
      // Upsert: drop any prior lens for this figure, append the new one at the end.
      setLenses(prev => [...prev.filter(l => l.figure_id !== lens.figure_id), lens])
      scrollToNewLens.current = true
      setPickerOpen(false)
    } catch (err) {
      setAddLensError(err instanceof Error ? err.message : 'Could not add the lens.')
    } finally {
      setAddingLens(false)
    }
  }

  // After a lens is added, center the carousel on it (the new lens is last).
  // Runs once the new card has rendered, so the scroll target exists.
  useEffect(() => {
    if (!scrollToNewLens.current) return
    scrollToNewLens.current = false
    const last = lenses.length - 1
    setActiveLens(last)
    const el = lensScrollRef.current
    if (el && lenses.length > 1) {
      el.scrollTo({ left: last * (el.clientWidth - 48 + 8), behavior: 'smooth' })
    }
  }, [lenses])

  // Prefer the Gemini "<synonym> on <topic>" title (T-018-07); fall back to the
  // vent's first words. Rendered UPPERCASE to match Figma (469:4275) — the
  // detail view's billboard treatment.
  const title = entry.title?.trim() || deriveTitleFallback(entry.vent_text)

  function onShared(platform: SharePlatform) {
    // Preview/QA: the share log POST will 401 without auth; we don't mutate
    // local share state here since the detail page reflects server data.
    void platform
  }

  // ── Header: shared app nav bar (Figma 602:6952 → AppHeader). ────────────────
  const header = <AppHeader />

  // ── Full vent card — reuses the input-card surface (Figma 469:4275). ────────
  const ventCard = (
    <div
      style={{
        background: 'var(--input-bg)',
        borderTop: 'var(--input-bt)',
        borderLeft: 'var(--input-bl)',
        borderRight: 'var(--input-br)',
        borderBottom: 'var(--input-bb)',
        borderRadius: 'var(--input-radius)',
        boxShadow: 'var(--input-shadow)',
        overflow: 'hidden',
        // notepad's drop-shadow needs an outer wrapper, not an overflow:hidden
        // element — apply via wrapper below instead. Here keep it visual-only.
        width: '100%',
      }}
    >
      <div style={{
        background: 'var(--input-header-bg)',
        boxShadow: 'var(--input-header-shadow)',
        padding: '8px 16px 2px',
        borderBottom: '1px solid var(--input-divider)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
          letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)',
          textTransform: 'uppercase', textAlign: 'center', margin: 0,
        }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '8px 16px 14px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
          letterSpacing: isKawaii ? '0.52px' : (isCyberpunk ? '0.52px' : '0.18px'),
          color: isCyberpunk ? 'var(--text-sub)' : 'var(--text-body)',
          margin: 0,
        }}>
          {entry.vent_text}
        </p>
      </div>
    </div>
  )

  // notepad gets the offset drop-shadow on an OUTER wrapper (overflow rule).
  // Vent unit (Figma 606:7786): column, items-end. The vent card carries
  // mb-[-4px] so the right-aligned "+Lens" button overlaps its bottom by 4px.
  const ventCardWrapped = (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', marginBottom: -4, position: 'relative', zIndex: 1,
        filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)',
      }}>
        {ventCard}
      </div>
      {/* "+ Lens" — add a lens to this entry (Figma 602:6511); opens the lens
          picker (stubbed until T-018-04). Right-aligned, -4px over the card. */}
      <button
        type="button"
        onClick={() => { setAddLensError(null); setPickerOpen(true) }}
        aria-label="Add a lens to this entry"
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          background: 'var(--bg)',
          borderTop: '4px solid var(--green)', borderLeft: '4px solid var(--green)',
          borderRight: '1px solid var(--green)', borderBottom: '1px solid var(--green)',
          borderRadius: 2, color: 'var(--green)', cursor: 'pointer',
          padding: '8px 9px 5px 12px', minHeight: 44,
          filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)',
        }}
      >
        <Icon name="add" size={24} />
        <span style={{
          fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
          letterSpacing: '3px', textTransform: 'uppercase', lineHeight: '16px',
        }}>Lens</span>
      </button>
    </div>
  )

  // ── MINDSHIFT ◇ MINDSHIFT billboard (Figma 469:4224 decorative row). ────────
  // Full version: two wordmarks flanking the brain-icon medallion. Token-driven.
  const wordmark = (
    <span style={{
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: 18, letterSpacing: '3px', lineHeight: 1,
      color: 'var(--cyan)', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      Minds Shift
    </span>
  )

  const billboard = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, width: '100%', padding: '4px 0',
      overflow: 'hidden',
    }}>
      <span style={{ flex: 1, height: 2, background: 'var(--cyan)', opacity: 0.35, minWidth: 4 }} />
      {wordmark}
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg)',
          border: isCyberpunk ? '1.5px solid var(--violet)' : '1.5px solid var(--cyan)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCyberpunk ? 'var(--violet)' : 'var(--cyan)',
          flexShrink: 0,
        }}
      >
        <Icon name="psychology" size={22} />
      </span>
      {wordmark}
      <span style={{ flex: 1, height: 2, background: 'var(--cyan)', opacity: 0.35, minWidth: 4 }} />
    </div>
  )

  // ── Button row beneath each lens card (Figma 602:6448). ─────────────────────
  // Single right-aligned row: Chat with lens · Decorate · Socials, gap-[4px],
  // items-start, justify-end. Chat + Decorate are disabled (opacity-60) and each
  // carries an "upcoming" chip pulled over its top-right corner via the Figma
  // mr-[-72px] trick. Socials is the only live action → opens ShareSheet.
  function buttonRow(lens: LensResponseV2) {
    // Three EQUAL buttons filling the row (Figma 602:6448) — no -72px overlap
    // trick (that collided), so the row never breaks. Active buttons use the
    // canonical themed button tokens (--btn-*), so both COLOR and SHAPE adapt per
    // theme — a neon bevel in cyberpunk, a soft pill in kawaii, a clean outline in
    // notepad. (Previously hardcoded var(--green), which is teal in kawaii — the
    // exact cyberpunk-shape-in-kawaii bleed this row was corrected for.) Disabled
    // (Decorate) = a muted secondary surface with the "upcoming" chip pinned.
    const btnBase = (active: boolean) => ({
      position: 'relative' as const,
      flex: 1, minWidth: 0,
      background: active ? 'var(--btn-bg)' : 'var(--btn-secondary-bg)',
      borderTop: active ? 'var(--btn-bt)' : '1px solid var(--input-divider)',
      borderLeft: active ? 'var(--btn-bl)' : '1px solid var(--input-divider)',
      borderRight: active ? 'var(--btn-br)' : '1px solid var(--input-divider)',
      borderBottom: active ? 'var(--btn-bb)' : '1px solid var(--input-divider)',
      borderRadius: 'var(--btn-radius)',
      color: active ? 'var(--btn-color)' : 'var(--text-muted)',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center', gap: 4,
      padding: '10px 6px 6px', minHeight: 56,
      cursor: active ? 'pointer' : 'not-allowed',
    })

    const btnLabel = {
      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 12,
      letterSpacing: '1.2px', lineHeight: '14px',
      textTransform: 'uppercase' as const, textAlign: 'center' as const,
    }

    const comingSoon = (icon: React.ReactNode, label: string) => (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={`${label} — coming soon`}
        style={btnBase(false)}
      >
        <span style={{ position: 'absolute', top: -8, right: -4, zIndex: 1 }}>
          <UpcomingChip />
        </span>
        {icon}
        <span style={btnLabel}>{label}</span>
      </button>
    )

    return (
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 4, width: '100%' }}>
        {/* Chat with lens — live (T-020-02): opens a bounded thread with this figure. */}
        <button
          type="button"
          onClick={() => openChat(lens)}
          aria-label={`Chat with ${lens.figure_id}`}
          style={btnBase(true)}
        >
          <Icon name="comic_bubble" size={24} />
          <span style={btnLabel}>Chat with lens</span>
        </button>
        {comingSoon(<Icon name="palette" size={24} />, 'Decorate')}
        {/* Socials — the only live action → opens ShareSheet. */}
        <button
          type="button"
          onClick={() => setShareLens(lens)}
          aria-label="Share this lens to social media"
          style={btnBase(true)}
        >
          <Icon name="ios_share" size={24} />
          <span style={btnLabel}>Socials</span>
        </button>
      </div>
    )
  }

  // ── Lens carousel item: LensCard + its button row. ──────────────────────────
  function lensItem(lens: LensResponseV2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* lens card mb-[-4px] so the button row overlaps its bottom by 4px
            (Figma 602:6446). */}
        <div style={{ marginBottom: -4, position: 'relative', zIndex: 1 }}>
          <LensCard
            response={lens}
            ventText={entry.vent_text}
            isEntryPublic={entry.is_public}
          />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>{buttonRow(lens)}</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {header}

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: '0 24px', width: '100%',
      }}>
        {ventCardWrapped}

        {lenses.length > 0 && billboard}

        {/* Carousel — peek next card + page-dots (Figma 602:6521). Single-lens
            entries render full-width with no carousel plumbing. */}
        {lenses.length === 0 ? null : lenses.length === 1 ? (
          lensItem(lenses[0])
        ) : (
          <>
            <div
              ref={lensScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget
                // One "page" = card width (clientWidth - 48px insets) + 8px gap.
                const page = el.clientWidth - 48 + 8
                const idx = Math.round(el.scrollLeft / page)
                if (idx !== activeLens) {
                  setActiveLens(Math.min(Math.max(idx, 0), lenses.length - 1))
                }
              }}
              style={{
                display: 'flex', gap: 8, overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 4,
                scrollbarWidth: 'none',
                // Break out of the parent's 16px gutter to full width, then own
                // the Figma geometry: 24px side padding (scroll-padding snaps
                // cards to the 24px inset), 8px gap, card = 100%-48px so the
                // next card peeks ~16px (Figma 602:6521).
                marginLeft: -24, marginRight: -24,
                paddingLeft: 24, paddingRight: 24,
                scrollPaddingLeft: 24, scrollPaddingRight: 24,
              }}
            >
              {lenses.map(lr => (
                <div key={lr.id} style={{
                  flex: '0 0 calc(100% - 48px)', scrollSnapAlign: 'start',
                }}>
                  {lensItem(lr)}
                </div>
              ))}
            </div>

            {/* Page-dots — one per lens, clickable, aria-labelled. */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 6, paddingTop: 2,
            }}>
              {lenses.map((lr, i) => {
                const active = i === activeLens
                return (
                  <button
                    key={lr.id}
                    type="button"
                    aria-label={`Go to lens ${i + 1} of ${lenses.length}`}
                    aria-current={active}
                    onClick={() => {
                      const el = lensScrollRef.current
                      // page = card width (clientWidth - 48px) + 8px gap.
                      if (el) el.scrollTo({ left: i * (el.clientWidth - 48 + 8), behavior: 'smooth' })
                      setActiveLens(i)
                    }}
                    style={{
                      // 6px visual dot inside a 44px-tall hit area for a11y.
                      width: active ? 18 : 6, height: 6, borderRadius: 3,
                      background: active ? 'var(--violet)' : 'var(--text-muted)',
                      border: 'none', padding: 0, cursor: 'pointer',
                      transition: 'width 0.2s ease, background 0.2s ease',
                    }}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* spacer so the last card clears the bottom of the viewport */}
      <div style={{ height: 40 }} />

      {shareLens && (
        <ShareSheet
          responseId={shareLens.id}
          figureId={shareLens.figure_id}
          responseText={shareLens.response_text}
          ventText={entry.vent_text}
          isEntryPublic={entry.is_public}
          onClose={() => setShareLens(null)}
          onShared={onShared}
        />
      )}

      {/* Add-a-lens picker — shared carousel; Back returns to this entry. */}
      <LensPickerSheet
        open={pickerOpen}
        startIndex={0}
        loading={addingLens}
        error={addLensError}
        selectLabel="Add lens"
        onBack={() => { setPickerOpen(false); setAddLensError(null) }}
        onSelect={handlePickLens}
      />
    </div>
  )
}
