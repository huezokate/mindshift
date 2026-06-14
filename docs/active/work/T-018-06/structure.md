# T-018-06 — Structure

File-level blueprint. Two new components, three token files, two screen edits.

## New files

### `src/components/ui/CircleArrow.tsx` (client-agnostic, no hooks)
Circular nav-arrow button mirroring the lens overlay arrow.
```
type Props = {
  direction: 'left' | 'right'
  onClick: () => void
  size?: number          // default 44
  'aria-label': string
}
```
Renders a `<button>`:
- `width/height: size`, `borderRadius: '50%'`, `flexShrink: 0`
- `background: var(--card-bg)`, `border: 2px solid var(--cyan)`, `color: var(--cyan)`
- `display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0`
- child: `<Icon name={direction === 'left' ? 'chevron_left' : 'chevron_right'} size={Math.round(size * 0.64)} />`
- `transition` + active scale for tap feedback (`active:scale-95` className).
No internal state. Pure presentational. Importable by lens later.

### `src/components/nav/EntryAuthRow.tsx` (client — `'use client'`)
Inline auth affordance for entry screens.
- Imports `useUser` from `@clerk/nextjs`, `Link` from `next/link`, `Icon`.
- `const { isSignedIn, user } = useUser()`
- `name = user?.firstName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? null`
- **Signed in:** a row → `Icon person` + `Hi, {name}` (token text styles).
- **Signed out:** a flex row, `gap`, two equal-width links:
  - `Log in` → `/sign-in`, secondary button tokens (`--btn-secondary-*`).
  - `Sign up` → `/sign-up`, primary button tokens (`--btn-*`).
  - Both `flex: 1`, same padding/radius/font → equal footprint.
- While Clerk is still resolving (`isSignedIn === undefined`), render a stable
  placeholder (the signed-out row) to avoid layout shift / hydration flicker.
- Self-contained inline styles, all token-driven. Optional `maxWidth` + `className` props
  so callers control width (theme-select uses `maxWidth: 376`).

## Modified files

### `src/styles/tokens.css` (cyberpunk)
Add to `:root[data-theme]` block (near other `--btn-*`):
```
--cta-solid-bg:          #080810;
--cta-solid-bg-disabled: #14141f;
```

### `src/styles/tokens-kawaii.css`
```
--cta-solid-bg:          #ffe2ac;
--cta-solid-bg-disabled: #e8e4dc;
```

### `src/styles/tokens-notepad.css`
```
--cta-solid-bg:          #ffffff;
--cta-solid-bg-disabled: #ece8e0;
```

### `src/app/app/theme-select/page.tsx`
1. Imports: add `Icon` (`@/components/ui/Icon`), `CircleArrow` (`@/components/ui/CircleArrow`),
   `EntryAuthRow` (`@/components/nav/EntryAuthRow`).
2. **EntryAuthRow:** render as the first child of the foreground column (before the hero card),
   `maxWidth: 376` to match cards.
3. **Checkbox:** replace the `<label>` + native `<input type="checkbox">` with a
   `<button type="button" role="checkbox" aria-checked={acknowledged} onClick={toggleAck}>`
   wrapper containing:
   - `<Icon name={acknowledged ? 'check_box' : 'check_box_outline_blank'} fill={acknowledged ? 1 : 0}
      size={20} style={{ color: acknowledged ? 'var(--cyan)' : 'var(--text-sub)' }} />`
   - the existing disclaimer `<span>` copy (including the nested "Learn more" button — keep its
     `stopPropagation`). The outer element becomes a button, so the inner Learn-more button must
     keep `e.preventDefault()/stopPropagation()`.
   Remove `accentColor`/native-input styling.
4. **Arrows:** replace the two `<button>…‹/›…</button>` with
   `<CircleArrow direction="left" onClick={prev} aria-label="Previous theme" />` and
   `<CircleArrow direction="right" onClick={next} aria-label="Next theme" />`. Keep the center
   "Pick your interface" label between them; bump container `gap` to ~16 for the larger arrows.
5. **CTA fill:** swap hardcoded hex →
   `backgroundColor: acknowledged ? 'var(--cta-solid-bg)' : 'var(--cta-solid-bg-disabled)'`.
   Replace the hardcode comment with a token-based note. Text/border/radius unchanged.

### `src/app/app/onboarding/page.tsx`
- Replace the lone secondary "Sign Up" `<Link href="/sign-up">` (the second child of the
  "Mind-map CTA + sign-up" motion block) with `<EntryAuthRow />`. Keep the "Try the
  mind-mapping tool →" link above it. Add the `EntryAuthRow` import.

## Ordering (matters)
1. Tokens first (so the CTA token resolves when the page edit lands).
2. `CircleArrow` + `EntryAuthRow` components (so imports resolve).
3. theme-select edits.
4. onboarding edit.
5. `tsc` + build verification.

## Interfaces / contracts
- `CircleArrow`: presentational, requires `aria-label` (a11y); no hooks → usable in server or
  client trees.
- `EntryAuthRow`: client-only (Clerk hook). Both theme-select and onboarding are already
  `'use client'`, so no boundary change.

## Risk surface
- Checkbox → button swap must preserve the nested Learn-more toggle's event isolation.
- `EntryAuthRow` undefined-state handling to avoid hydration mismatch.
- No DB / API / route / middleware changes. No new dependencies.
