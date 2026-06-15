# T-018-04 — Structure

File-level blueprint. The shape of the code, not the code.

## Files

### CREATE — `V200/src/components/ui/CircularArrow.tsx`

A small, token-driven circular nav button. Sibling of `Icon.tsx` in `components/ui/`.

Public interface:

```tsx
type Props = {
  direction: 'prev' | 'next'
  onClick: (e: React.MouseEvent) => void   // caller owns stopPropagation
  ariaLabel: string
  size?: number          // default 44 — diameter; also the tap target
  disabled?: boolean      // default false
  style?: CSSProperties   // optional positioning overrides (escape hatch)
}
export default function CircularArrow(props: Props): JSX.Element
```

Internal organization:
- `'use client'` not required (no hooks/state) — pure presentational, but it is rendered
  only inside the client lens page, so either is fine; omit the directive (keeps it a
  plain component usable in server trees too).
- Renders one `<button type="button">`:
  - layout: `flex items-center justify-center`, `width/height = size`,
    `borderRadius: '50%'`, `flexShrink: 0`.
  - color: `border: '2px solid var(--cyan)'`, `background: 'var(--card-bg)'`,
    `color: 'var(--cyan)'`, `cursor: 'pointer'` (or `'not-allowed'` when disabled).
  - child: `<Icon name={direction === 'prev' ? 'chevron_left' : 'chevron_right'}
    size={Math.round(size * 0.6)} weight={500} />`.
  - `aria-label={ariaLabel}`, `disabled`, spread `style` last so callers can override.
- Imports: `Icon` from `@/components/ui/Icon`; `CSSProperties`/`MouseEvent` types from
  react.

Boundary: knows nothing about figures or the overlay. Reusable by theme-select later.

### MODIFY — `V200/src/app/app/lens/page.tsx`

Changes, in order of appearance:

1. **Import** `CircularArrow` (top, with the other imports) and `Icon`
   (`@/components/ui/Icon`) for the Back button glyph.
2. **Remove the overlay-edge left arrow** (current lines ~285–293) and **right arrow**
   (~393–401) — the two `absolute left-3 / right-3` `<button>`s with literal `‹` / `›`.
3. **Wrap the portrait in a nav row** inside the detail `motion.div` (around current
   lines 317–328): replace the bare portrait `<div>` with

   ```
   <div className="flex items-center justify-between w-full">
     <CircularArrow direction="prev" ariaLabel="Previous figure"
       onClick={e => { e.stopPropagation(); prevPreview() }} />
     <div … existing 120px portrait … />
     <CircularArrow direction="next" ariaLabel="Next figure"
       onClick={e => { e.stopPropagation(); nextPreview() }} />
   </div>
   ```

   The portrait `<div>` keeps its existing size/tokens; only its wrapper changes.
4. **Back button glyph** (current line ~366): replace the literal `← Back` text with an
   `<Icon name="arrow_back" size={16}>` + `Back` label (flex row, gap), so the card's
   own iconography is Material Symbols. Keep button styling/tokens as-is.
5. No change to `prevPreview` / `nextPreview` / `handleGetPerspective` logic — only the
   render tree moves.

Net: the overlay `motion.div` no longer has absolutely-positioned children; the card owns
its navigation.

## Ordering of changes

1. Create `CircularArrow.tsx` (compiles standalone).
2. Edit `lens/page.tsx`: add imports → restructure portrait row + remove edge arrows →
   swap Back glyph.
3. `npx tsc --noEmit` → expect clean.

Single logical change → **one commit**.

## Interfaces & contracts

- `CircularArrow.onClick` receives the raw `MouseEvent`; the lens page passes a handler
  that calls `e.stopPropagation()` then `prev/nextPreview()` — preserving the existing
  "arrow click doesn't close the overlay" behavior (the overlay closes on backdrop click;
  the card already `stopPropagation`s, but arrows are explicit for safety).
- `Icon` contract unchanged (name/size/weight props already exist).

## Out of scope (explicit)

- `theme-select/page.tsx` — not modified (future reuse of `CircularArrow`).
- `LensCard.tsx`, `journal-v2`, `JournalPreviewCard.tsx`, `save-response`,
  `journal-types.ts` — sibling-ticket files, untouched.
- No new tokens, no token-file edits (cyan/card-bg already exist in all 3 theme sets).

## Risk surface

- Lowest-risk kind of change: additive component + a contained render-tree move.
- Visual regression risk = arrow placement; mitigated by keeping the same circle/cyan
  treatment and verifying tokens resolve in all 3 themes (no hex).
- Material Symbols `chevron_left/right` + `arrow_back` are standard glyphs already used
  by the app's Sharp stylesheet (loaded in `layout.tsx`).
