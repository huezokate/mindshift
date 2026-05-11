# MindShift Component Workflow

Use this command to implement, update, or add a MindShift UI component from a Figma node.

**Usage:** `/component <figma-url> [component-name]`

- `<figma-url>` — the Figma node URL (required), e.g. `https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift?node-id=397-3689`
- `[component-name]` — optional override for the component filename (e.g. `HeroCard`). If omitted, infer a name from the Figma node name.

---

## Workflow

### 1. Fetch the design

Call `get_design_context` and `get_screenshot` in parallel using the extracted `fileKey` and `nodeId` from the URL.

Analyze the result for:
- How many theme variants are shown (there should be three: Cyberpunk, Kawaii, Notepad)
- The structural differences between them — not just colors, but border widths, border-radius, inset shadows, split sections, filters, etc.
- Which CSS custom properties from the MindShift token system each value maps to

### 2. Map Figma values to MindShift tokens

**Core palette aliases:**
| Figma hex | Token |
|---|---|
| `#00F5FF` | `var(--cyan)` (cyberpunk) |
| `#39FF14` | `var(--green)` (cyberpunk) |
| `#FF2D78` | `var(--pink)` (cyberpunk) |
| `#B04CFF` | `var(--violet)` (cyberpunk) |
| `#0d0d1a` / `#0d0d1c` | `var(--card-bg)` (cyberpunk) |
| `#ff50c5` | `var(--cyan)` / `var(--pink)` / `var(--violet)` (kawaii — same value) |
| `#49dbc8` | `var(--green)` (kawaii) |
| `#270007` | dark border color (kawaii) |
| `#400b14` | darker border color (kawaii cards) |
| `#ffffff` | `var(--card-bg)` (kawaii/notepad) |
| `#3a6fa8` | `var(--cyan)` (notepad — used for input/card borders) |
| `#7d9e7d` | `var(--green)` (notepad) |
| `#c0605a` | `var(--pink)` (notepad) |
| `#1e1e40` | `var(--text-body)` (notepad) |

**Structural tokens:**
- Input card borders → `var(--input-bt/bl/br/bb)`, radius → `var(--input-radius)`, shadow → `var(--input-shadow)`
- Input header bg → `var(--input-header-bg)`, header shadow → `var(--input-header-shadow)`
- Content card borders → `var(--card-bt/bl/br/bb)`, bg → `var(--card-bg)`, radius → `var(--card-radius)`
- Heading card borders → `var(--hcard-bt/bl/br/bb)`, bg → `var(--hcard-bg)`, radius → `var(--hcard-radius)`
- Drop-shadow (notepad only) → `filter: var(--card-filter)` on outer wrapper, never on element with `overflow: hidden`
- Figure avatar → `border: var(--fig-avatar-border)`, shadow → `var(--fig-avatar-shadow)`, bg → `var(--fig-avatar-grad)`

**If Figma uses a value with no existing token** — add it to all three theme files AND to the library page token maps. Common new tokens follow the pattern `--lens-*`, `--session-*`, etc.

### 3. Implement the component

Create or update `src/components/<ComponentName>.tsx`.

**Always use three render paths:**

```tsx
'use client'
import { useTheme } from '@/lib/theme'
// other imports as needed

export default function ComponentName({ ...props }: Props) {
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'

  if (isCyberpunk) {
    // cyberpunk render — exact borders, colors, typography per Figma
    return (...)
  }

  if (isKawaii) {
    // kawaii render — rounded, pastel, inset shadows
    return (...)
  }

  // notepad default — paper-like, drop-shadow via filter on outer wrapper
  return (...)
}
```

**Key rules:**
- Use `var(--*)` for every design token — never hardcode hex values
- For portrait images: `isKawaii ? fig.imgKawaii : fig.imgCyberpunk`
- Notepad drop-shadow: apply `filter: 'var(--card-filter)'` to the outer wrapper div, never on an element that also has `overflow: hidden` (shadow gets clipped)
- For stacked/overlapping avatars: `marginRight: -4` on all but the last, `position: relative`, `zIndex: i + 1`
- For fixed-height truncation: set `height` + `overflow: 'hidden'` on the body div, not the outer wrapper

### 4. Add a Preview to the library page

Open `src/app/library/page.tsx` and:

1. Add a `<ComponentName>Preview({ themeKey }: { themeKey: string })` function near the top with the other Preview functions. It must render the correct per-theme structure using only `var(--*)` resolved by the parent div's inline style map — same three-path logic as the real component, but no `useTheme()` hook (use `themeKey` prop instead).

2. Add a `<SectionLabel>` + `<ComponentNamePreview themeKey={themeKey} />` pair inside `AllComponents`, in a logical position (group related components together).

3. If the Preview needs shared UI (like an icon SVG), add a shared helper function at the top of the file alongside the existing `ShareIcon`, etc.

### 5. Sync token maps in the library page

If you added new CSS custom properties to the theme `.css` files, also add them to the `CYBERPUNK`, `KAWAII`, and `NOTEPAD` const objects in `src/app/library/page.tsx`. These are the inline-style token maps used for the three side-by-side library columns.

### 6. Verify

Run `npx tsc --noEmit` and confirm it exits cleanly with no output.

---

## File reference

```
src/components/              ← component files live here
src/app/library/page.tsx     ← library preview page, view at /library
src/styles/tokens.css        ← cyberpunk tokens (:root)
src/styles/tokens-kawaii.css ← kawaii tokens (html[data-theme="kawaii"])
src/styles/tokens-notepad.css← notepad tokens (html[data-theme="notepad"])
src/lib/figures.ts           ← FIGURES array with id, name, imgKawaii, imgCyberpunk, quote
src/lib/theme.tsx            ← useTheme() hook
```

## Common patterns

**Split-section card (header + body):**
Apply `overflow: hidden` to each section div individually, not the outer wrapper (so drop-shadows survive in notepad).

**Inset left accent (kawaii/notepad):**
`boxShadow: 'inset 4px 0 0 0 var(--cyan)'` — always 4px, always left edge.

**Notepad drop-shadow:**
`filter: 'var(--card-filter)'` on outer div. Keep a separate outer div just for the filter when the inner needs `overflow: hidden`.

**Asymmetric borders:**
Cyberpunk: `4px top/left + 1px right/bottom` (card) or `1px top/left + 4px right/bottom` (violet card).
Kawaii: `1px top/bottom + 2px left + 4px right` (dark `#270007`).
Notepad: `1.5px top/right/bottom + 4px left` (blue for input, green for content).
