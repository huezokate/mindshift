# T-006-03 Research: Aesthetic Fusion — Cyberpunk × Kawaii × Notepad

## 1. The Problem Space

MindShift is a reflective tool — it deals with vulnerability, aspiration, and personal growth. The current cyberpunk aesthetic is visually striking but emotionally cold. The design challenge: make it feel warm and safe without losing the edge that makes it feel different from generic wellness apps.

The three aesthetics are not equally weighted:
- **Cyberpunk (70%):** The skeleton. Dark bg, neon accents, monospace, glitch elements. Stays dominant.
- **Kawaii (20%):** The warmth layer. Applied at emotional peaks — onboarding, figure selection, celebration.
- **Notepad/Analog (10%):** The grounding texture. Applied to input surfaces and goal-writing moments.

## 2. Cyberpunk (Current) — What to Keep

### Non-negotiables
- Dark backgrounds (#07070F, #0D0D1C, #121228)
- Neon cyan (#00FFC8) + pink (#FF2D6B) accent pair
- Monospace font for all system/data text
- Scanline overlay (reduce opacity for accessibility)
- Sharp rectangular borders (1-2px, no large radius)
- Glow effects on interactive elements
- Terminal box aesthetic for AI response

### What to refine
- Scanline opacity: reduce from current (too heavy for accessibility)
- UPPERCASE labels: keep for nav/system elements, not for user-facing body text
- Border-radius: add a single `--radius-soft: 8px` token for kawaii moments (pill buttons on kawaii screens only)

## 3. Kawaii — Integration Points

### What Kawaii Means Here
Not: pastel everything, anime characters, `:3` faces
Yes: rounded moments, bouncy animations, expressive micro-states, soft glows, mascot/guide presence, playful empty states

### Color Extensions for Kawaii
The cyberpunk palette needs soft counterparts that don't clash:

| Kawaii Token | Value | Usage |
|---|---|---|
| `--lavender` | #C8AEFF | Soft purple accent — figure selection highlight |
| `--peach` | #FFB3A7 | Soft coral — celebration/success moments |
| `--mint` | #A8FFE6 | Pale cyan — onboarding guide, empty states |
| `--star` | #FFE87C | Pale gold — achievement/save moments |

**Why these work:** They are desaturated/lightened versions of the existing neon palette. Lavender ← neon pink. Mint ← neon cyan. They feel related, not foreign.

### Kawaii Moments (screen-by-screen)
| Screen | Kawaii element | Details |
|---|---|---|
| Screen 1 — Question | Guide character in empty state | Small pixel-art or SVG sprite bot/star appears before first input |
| Screen 1 — Pills | Pill hover: gentle bounce + `--lavender` glow | Replaces current `--pink-glow` on hover |
| Screen 2 — Figure select | Selection burst: radial sparkle animation | 8 small particles fan out from selected portrait |
| Screen 3 — AI loading | Loading dots are emoji-like (`◉ ◎ ○`) rather than raw dots | Swap current ASCII for styled unicode |
| Screen 3 — Response reveal | Typewriter reveal with subtle cursor blink | Per-character reveal, 30ms/char delay |
| Screen 4 — Goal save | Star burst on goal add | ⭐ particle from the + button |
| Screen 5 — Mindmap complete | Confetti: cyan + pink + lavender + star particles | 2s burst, fade, then prompt to save |

### Kawaii Typography
One display font for emotional moments (headings, figure names, celebration text):
**Option A: "Nunito"** (Google Fonts) — rounded sans, friendly, widely used in apps
**Option B: "M PLUS Rounded 1c"** (Google Fonts) — Japanese-origin rounded sans, authentic kawaii DNA
**Option C: Stay mono** — lean harder into "kawaii hacker" — soft content, hard aesthetic

**Recommendation: Nunito for 2-3 specific elements only** (guide character name, mindmap node labels, empty state text). Load via `<link>` tag — no build step needed. Keep all system/nav/terminal text in monospace.

### Kawaii Motion Vocabulary
- **Bounce in:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — slight overshoot
- **Jelly press:** `scale(0.95)` on press, `scale(1.05)` on release, settle to 1
- **Float:** slow 4s `translateY(-4px)` loop on guide character
- **Sparkle:** 8 particles, staggered 50ms, radial fan, fade 400ms

All wrapped in `@media (prefers-reduced-motion: reduce)` to disable.

## 4. Notepad/Analog — Integration Points

### What Notepad Means Here
Not: beige paper, serif fonts everywhere
Yes: ruled line backgrounds on input areas, ink-bleed text reveal animation, slightly imperfect borders, pencil-scratch erasing animations

### Notepad Moments (screen-by-screen)
| Screen | Notepad element | Details |
|---|---|---|
| Screen 1 — Textarea | Ruled line background inside input | `repeating-linear-gradient` horizontal lines, very subtle |
| Screen 1 — Input | Ink-bleed character appear | Characters appear with brief opacity blur, like ink soaking into paper |
| Screen 4 — Goals | Full notepad aesthetic | Ruled lines, `--font-handwritten` for goal text (system font fallback) |
| Screen 4 — Goal add | Pen-write animation on new line | Underline sweeps left→right as new goal row appears |
| Screen 5 — Node text | Goal bullets look handwritten | Slight opacity variation per line (0.8, 0.9, 1.0 stagger) |

### Notepad Typography
For goal text only (Screen 4): `'Caveat', cursive` — Google Font, handwritten but highly legible, wide language support, good at small sizes.

### Notepad Texture Token
```css
--notepad-lines: repeating-linear-gradient(
  transparent,
  transparent 27px,
  rgba(0, 255, 200, 0.06) 27px,
  rgba(0, 255, 200, 0.06) 28px
);
```
Line color is the faintest cyan possible — stays on-theme while suggesting ruled paper.

### Notepad Border Treatment
Goal input fields get `border-bottom: 1px solid var(--border)` only (no full border) — the classic "lined notepad" single-underline input field.

## 5. Aesthetic Collision Points — Where Registers Conflict

### Problem 1: Kawaii bounce vs cyberpunk sharp
Resolution: **Kawaii motion only on content elements** (portraits, nodes, pills). **Sharp/no-animation on structural elements** (nav, terminal header, borders). Motion is character, not structure.

### Problem 2: Soft pastel colors vs dark bg contrast
Resolution: Kawaii pastels (`--lavender`, `--peach`) are only used for glow overlays and particles, not for text on dark backgrounds. Text always uses `--cyan` or `--white` for contrast compliance.

### Problem 3: Handwritten font vs monospace identity
Resolution: Handwritten font (`Caveat`) is only used for user-authored content (goals the user wrote). System text (labels, nav, AI response) stays monospace. The contrast is intentional — human handwriting vs machine terminal.

### Problem 4: Notepad texture on dark bg
Resolution: Ruled lines are `rgba(cyan, 0.06)` — barely visible, felt more than seen. On high-contrast mode or when `prefers-contrast: more`, the texture is removed entirely.

## 6. Animation Performance Constraints

All animations must:
- Use only `transform` and `opacity` (GPU-composited, no layout thrash)
- Be wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }`
- Complete in ≤ 400ms for micro-interactions (600ms for celebrations)
- Not block input (all run with `pointer-events: none` where applicable)

Particle systems (sparkle, confetti): CSS keyframe only — no canvas/WebGL. 8-12 particles maximum per burst. SVG unicode characters (`✦ ✧ ★ ◈`) as particle elements.

## 7. Font Loading Plan

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&family=Caveat:wght@400;700&display=swap" rel="stylesheet">
```

Two fonts, two weights each — ~8KB total. `display=swap` prevents FOUT blocking. Fallbacks:
```css
--font-kawaii: 'Nunito', 'Segoe UI', system-ui, sans-serif;
--font-handwritten: 'Caveat', 'Comic Sans MS', cursive;
```

## 8. Reference Aesthetics

### Cyberpunk references to stay true to
- Cyberpunk 2077 UI: data density, monospace, neon on dark
- Blade Runner 2049: restraint — not everything glows, darkness is part of the palette
- Ghost in the Shell (1995): terminal aesthetics, cyan/teal on black

### Kawaii references (filtered for this context)
- WWDC / Apple Watch activity rings: achievement moments, not everything
- Duolingo: character presence at emotional peaks
- Notion: "friendly but not childish" — functional kawaii

### Notepad references
- Bear app (iOS): beautiful inline ruled paper texture
- Moleskine: sparse, deliberate, analog feel in digital
- Notion: the `/` command "pencil writes" feel
