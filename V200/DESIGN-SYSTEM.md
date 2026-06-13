# MindShift — Design System (the shared map)

The single source of truth for how Figma ↔ code line up. **Read this before building UI.**
Order of truth: **Figma variables/styles → `src/styles/tokens*.css` → components.**

> How we work it (the fix for "Claude keeps losing the design system"):
> 1. **Read `get_design_context` (real CSS/tokens), not screenshots**, when implementing a screen.
> 2. **Components use structural tokens, never hardcoded theme hex** (see The Rule).
> 3. **Reuse the code component** the Figma component maps to (see Inventory / Code Connect), don't regenerate.
> 4. Figma variants must have **clean, named props** (e.g. `lens`, `shared`) — no `Variant6/7/8`.

---

## 1. Tokens — the 3 themes

⚠️ **Token names are historical (cyberpunk-derived). They are accent *slots*, not literal colors.**
`--cyan` is **blue** in notepad and **magenta** in kawaii. Always think "accent-1 / accent-2 / accent-3", not the literal word.

| Slot | Role | Notepad | Cyberpunk | Kawaii |
|---|---|---|---|---|
| `--bg` | page background | `#faf7f2` | `#080810` | `#ffafd6` |
| `--card-bg` | card surface | `#ffffff` | `#0d0d1a` | `#ffffff` |
| `--cyan` | accent 1 (primary) | `#3a6fa8` (blue) | `#00f5ff` | `#ff50c5` |
| `--green` | accent 2 (positive/shared) | `#7d9e7d` (sage) | `#39ff14` | `#49dbc8` (teal) |
| `--pink` | accent 3 (brand/private) | `#c0605a` (terracotta) | `#ff2d78` | `#ff50c5` |
| `--violet` | accent 4 | `#3a6fa8` | `#b04cff` | `#ff50c5` |
| `--amber` | accent 5 | `#7d9e7d` | `#ffb800` | `#ffe2ac` |
| `--text-h1` / `--text-body` | headings / body | `#1e1e40` | `#e0f7ff` | `#270007` |
| `--text-sub` / `--text-meta` | secondary / tertiary | `rgba(30,30,64,.55/.45)` | `#7ecfdf` / `#3697b8` | `rgba(39,0,7,.5/.35)` |

### Structural tokens (the per-theme "shape" of a thing) — **use these, don't reinvent**
The card/input/button *treatment* differs a lot per theme and is fully encoded in tokens. Use them:

| Token group | What it encodes | Notepad | Cyberpunk | Kawaii |
|---|---|---|---|---|
| `--card-bt/bl/br/bb` | card borders | 1.5px + **4px left**, terracotta | **4px top/left** + 1px, cyan | asym 1/2/4/1, dark |
| `--card-radius` | card corner | `8px` | `4px` | `32px` |
| `--card-filter` | card shadow | `drop-shadow(3px 4px 0 #d4cbbf)` | `none` (uses glow) | `none` |
| `--card-shadow` | inset/glow | `none` | `none` | `inset 4px 0 0 rgba(64,11,20,.5)` |
| `--input-*` | input field borders (blue-accent) | 1.5px + 4px-left blue | cyan | dark |
| `--btn-*` / `--btn-filter` | CTA button | white, dark border, `drop-shadow(2px 3px 0 #1e1e40)` | neon | rounded |
| `--glow-cyan/green/...` | neon glow | `none` | `0 0 16px …` | `none` |

**Fonts** (`--font-display` / `--font-body` / `--font-btn`): Notepad = Georgia / Inter / Inter · Cyberpunk = Alumni Sans SC / Courier New / Alumni · Kawaii = Nunito Sans / Nunito Sans / Fredoka.

**Textures** already live in the token CSS: notepad `body` = ruled paper; cyberpunk `body::before` = scanlines; kawaii = (todo: cotton-candy clouds).

---

## 2. The Rule (why things don't theme)

**A component is theme-ready only if its colors/borders/shadows come from tokens.** Hardcoding `#3a6fa8` or `drop-shadow(... #d4cbbf)` makes it **notepad-only** — it breaks the instant the theme changes.

✅ `border: var(--card-bl); filter: var(--card-filter); color: var(--cyan)`
❌ `border: 4px solid #3a6fa8; filter: drop-shadow(3px 4px 0 #d4cbbf)`

**Current debt** (built fast against forced-notepad — refactor to tokens before un-forcing themes):
- `app/journal/page.tsx` (EntryCard) — hardcodes blue/green borders + `#d4cbbf` shadow.
- `components/mindmap/MindmapAreaCard.tsx` — same (BLUE const, hardcoded shadow).
- `app/app/mindmap/map/page.tsx` — hardcoded paper bg + `#d4cbbf`.
- The mindmap surfaces also **force notepad** (`setTheme('notepad')`) — remove once they're token-driven.

---

## 3. Component inventory (Figma ↔ code ↔ tokens)

| Figma component (node) | Variants / props | Code component | Tokens used | Status |
|---|---|---|---|---|
| Journal Preview Card (`572:5505`, notepad `572:5715` / cyber `579:6146`) | `lens`, `shared` (4 states) | `app/journal/page.tsx › EntryCard` | card-*, --cyan/--green/--pink | ✅ built (hardcoded → needs tokens) |
| Notepad mindmap card folded/unfolded (`541:4896` → `4895`/`4894`) | `Mind Map Card folded` / `unfolded` | `components/mindmap/MindmapAreaCard.tsx` | card-*, --cyan/--green | ✅ built (hardcoded → tokens) |
| Area Card (`541:4022`) | `default` / `selected` | (folded variant of MindmapAreaCard) | --green/--pink | ✅ |
| Areas of Life icons (`541:4902`) | Career/Health/Relationship/Personal/Finance | `components/mindmap/AreaIcon.tsx` | currentColor | ✅ |
| Lense preview (avatar) (`469:4000`) | size, theme | inline (journal/map avatars) | --pink ring | ⚠️ duplicated inline — extract |
| Lens detail / "Lens selected" (`419:8189`) | per-figure | `app/lens/detail/page.tsx` | card, --cyan/--green/--pink | ✅ |
| User quote input field | header + body | inline (vent/woop) | input-* | ⚠️ should be one component |
| CTA button | primary / secondary | inline `PrimaryButton` (new flow) | btn-* | ⚠️ extract to shared Button |
| Hand-drawn arrows (`/public/mindmap/arrows/`) | arrow1–5 | `map/page.tsx › ArrowNode` | — (ink) | ✅ |

**Biggest extraction wins** (one component, reused everywhere): **Card**, **Button**, **Input field**, **Lens avatar**. These three+1 are inlined in several places; extracting them is what makes Code Connect (§4) worthwhile.

---

## 4. Code Connect & Claude Design (next)

- **Code Connect** (Figma → "use *this* code component"): map the extracted Card / Button / Input / Avatar / AreaCard via `*.figma.tsx` files (figma-code-connect skill). Publish needs a Figma token (`figma connect publish`) — Kate runs that step.
- **Claude Design (intern, not lead):** a synced component gallery mirroring our code, via `/design-sync`. Supporting reference; Figma + this doc stay the source of truth.

_Living doc — update the inventory whenever a component is added or extracted._
