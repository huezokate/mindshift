'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import AppHeader from '@/components/nav/AppHeader'
import LensResponseCard from './LensResponseCard'
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

  // ── Full vent card — the "User quote input field" instance (Figma 469:4275):
  // card surface (--card-bg) with the theme's input borders. The header/body
  // divider is the input component's own solid bottom border; Figma only fills
  // the header on kawaii (#e5fcfa) — cyberpunk/notepad show the card surface.
  const ventCard = (
    <div
      style={{
        background: 'var(--card-bg)',
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
        background: isKawaii ? 'var(--input-header-bg)' : 'transparent',
        boxShadow: isKawaii ? 'var(--input-header-shadow)' : 'none',
        padding: isKawaii ? '8px 16px 4px' : '8px 16px 2px',
        borderBottom: 'var(--input-bb)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: isCyberpunk || isKawaii ? 700 : 600,
          fontSize: 12,
          letterSpacing: isCyberpunk ? '1.32px' : (isKawaii ? '0.52px' : '0.55px'),
          lineHeight: '14px',
          // Figma title color: C Blue / Kawaii text main / Notepad Blue.
          color: isKawaii ? 'var(--text-body)' : 'var(--cyan)',
          textTransform: 'uppercase', textAlign: 'center', margin: 0,
        }}>
          {title}
        </p>
      </div>
      {/* Body — Figma px-[16px] py-[4px] (kawaii pr-[8px]). */}
      <div style={{ padding: isKawaii ? '4px 8px 4px 16px' : '4px 16px' }}>
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
      {/* "+ Lens" — add a lens to this entry (Figma 602:6511 "Button Primary");
          opens the lens picker. Right-aligned, -4px over the card. Column
          [icon over label] layout, colored/shaped by the primary --btn-*
          family so all 3 themes follow from tokens. */}
      <button
        type="button"
        className="ds-btn"
        onClick={() => { setAddLensError(null); setPickerOpen(true) }}
        aria-label="Add a lens to this entry"
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 4,
          background: 'var(--btn-bg)',
          borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
          borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
          borderRadius: 'var(--btn-radius)',
          boxShadow: 'var(--btn-shadow, none)',
          color: 'var(--btn-color)', cursor: 'pointer',
          padding: '8px 9px 5px 12px', minHeight: 44,
          filter: 'var(--btn-filter, none)',
        }}
      >
        <Icon name="add" size={24} />
        <span style={{
          fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
          letterSpacing: 'var(--btn-letter-spacing)', textTransform: 'uppercase',
          lineHeight: '16px',
        }}>Lens</span>
      </button>
    </div>
  )

  // ── Button row beneath each lens card (Figma 602:6448 "Icon button stack"). ──
  // Right-aligned hug-content row, gap-[4px]: Chat with lens · Decorate ·
  // Socials. Each button is the primary [icon over label] form (Figma "Button
  // Primary"), colored/shaped by the --btn-* token family so all 3 themes
  // follow. Decorate is disabled — Figma's recipe: the live treatment at
  // opacity 0.6 with the "upcoming" chip overlapping its top-right corner
  // (the mr-[-72px] trick, done here with absolute positioning so the row
  // never breaks). Chat is live in code (T-020-02 shipped) even though Figma
  // still marks it upcoming. Kawaii renders the row ICON-ONLY (Figma 470:2664
  // — round 54px pills, no labels; the labeled pills don't fit the card).
  function buttonRow(lens: LensResponseV2) {
    const iconOnly = isKawaii
    const btnBase = (active: boolean) => ({
      position: 'relative' as const,
      background: 'var(--btn-bg)',
      borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
      borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
      borderRadius: 'var(--btn-radius)',
      boxShadow: 'var(--btn-shadow, none)',
      filter: 'var(--btn-filter, none)',
      color: 'var(--btn-color)',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center', gap: 4,
      padding: iconOnly ? 15 : '8px 9px 5px 12px',
      minHeight: iconOnly ? 54 : 44,
      opacity: active ? 1 : 0.6,
      cursor: active ? 'pointer' : 'not-allowed',
    })

    const btnLabel = {
      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
      letterSpacing: 'var(--btn-letter-spacing)', lineHeight: '16px',
      textTransform: 'uppercase' as const, textAlign: 'center' as const,
      whiteSpace: 'nowrap' as const,
    }
    const label = (text: string) => (iconOnly ? null : <span style={btnLabel}>{text}</span>)

    // The chip is a SIBLING of the dimmed button (as in Figma), so it stays at
    // full opacity while the button sits at 0.6.
    const comingSoon = (icon: React.ReactNode, text: string) => (
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label={`${text} — coming soon`}
          title={`${text} — coming soon`}
          style={btnBase(false)}
        >
          {icon}
          {label(text)}
        </button>
        {/* "upcoming" chip pulled over the button's top-right corner. */}
        <span style={{ position: 'absolute', top: -9, right: -4, zIndex: 1 }}>
          <UpcomingChip />
        </span>
      </span>
    )

    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        gap: iconOnly ? 8 : 4, width: '100%',
      }}>
        {/* Chat with lens — live (T-020-02): opens a bounded thread with this figure. */}
        <button
          type="button"
          className="ds-btn"
          onClick={() => openChat(lens)}
          aria-label={`Chat with ${lens.figure_id}`}
          title="Chat with lens"
          style={btnBase(true)}
        >
          <Icon name="comic_bubble" size={24} />
          {label('Chat with lens')}
        </button>
        {comingSoon(<Icon name="palette" size={24} />, 'Decorate')}
        {/* Socials — opens ShareSheet. */}
        <button
          type="button"
          className="ds-btn"
          onClick={() => setShareLens(lens)}
          aria-label="Share this lens to social media"
          title="Socials"
          style={btnBase(true)}
        >
          <Icon name="ios_share" size={24} />
          {label('Socials')}
        </button>
      </div>
    )
  }

  // ── Lens carousel item: LensResponseCard + its button row. ──────────────────────────
  function lensItem(lens: LensResponseV2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* lens card mb-[-4px] so the button row overlaps its bottom by 4px
            (Figma 602:6446). */}
        <div style={{ marginBottom: -4, position: 'relative', zIndex: 1 }}>
          <LensResponseCard
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
