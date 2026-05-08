# Design: screen-architecture-design (T-009-02)

## Architecture Decision

**15 frames total**: 5 screens × 3 themes, each 390×844, side by side on the Ideation page.

Canvas layout:
```
y=7200  [Landing-CP] [Landing-KW] [Landing-NP]   (built in session, x=3312–4572)
y=8124  [Wizard-CP]  [Wizard-KW]  [Wizard-NP]    (gap 80px between screens, 140px between rows)
y=9048  [LensGrid-CP][LensGrid-KW][LensGrid-NP]
y=9972  [Response-CP][Response-KW][Response-NP]
y=10896 [MindMap-CP] [MindMap-KW] [MindMap-NP]
```

Row gap = 140px (844 + 140 = 984 per row increment). Column gap = 80px (390 + 80 = 470 per column increment).

Naming convention: `{Screen} — {Theme}` e.g. `Landing — Cyberpunk`, `Wizard — Kawaii`.

---

## Layout Zones (Theme-Invariant Structure)

Every screen shares these zones in the same vertical order:

```
┌─────────────────────────────┐  y=0
│  Status Bar                 │  44px — time, battery
├─────────────────────────────┤  y=44
│  Header Zone                │  varies — screen title or brand
├─────────────────────────────┤
│  Content Zone               │  largest — the main UI
├─────────────────────────────┤
│  Theme Switcher             │  52px — always at same y per screen
├─────────────────────────────┤
│  CTA / Action Row           │  52–80px — primary action
├─────────────────────────────┤  y=796
│  Scroll hint / label        │  48px
└─────────────────────────────┘  y=844
```

Screens where the theme switcher floats (Mind Map) have it pinned to bottom y=740.

---

## Screen-by-Screen Architecture

### Screen 1 — Landing (frames exist: 400:23 / 400:29 / 400:35)

| Zone | y | Height | Content |
|------|---|--------|---------|
| Status bar | 0 | 44 | Time + battery |
| Brand title | 112 | ~50 | MINDSHIFT / MindShift ✨ / MindShift |
| Tagline | 168 | ~50 | 2-line tagline |
| UI Switcher | 268 | 52 | Theme toggle (active on this theme) |
| Portrait area | 348 | 272 | "Choose your guide" + figure placeholder |
| CTA button | 648 | 52 | "Begin the Shift" / "Start My Journey ✨" / "Begin the Shift →" |
| Scroll hint | 796 | 24 | "scroll to explore" |

**Remaining work**: Upload portrait image fills into portrait placeholder areas.

### Screen 2 — Wizard / Vision Input

| Zone | y | Height | Content |
|------|---|--------|---------|
| Status bar | 0 | 44 | — |
| Back nav | 44 | 44 | "← back" / "← back" / "← back" |
| Screen label | 88 | 24 | "STEP 1 OF 5" / "step 1 ✦" / "step 1:" |
| Main prompt | 120 | 64 | Large heading: the question |
| Helper text | 196 | 32 | Sub-prompt or instruction |
| Text input | 244 | 272 | Large textarea — theme styled |
| UI Switcher | 540 | 52 | Theme toggle |
| CTA button | 620 | 52 | "Build My Map →" / "Build My Map ✨" / "Map It →" |
| Progress dots | 696 | 20 | ●○○○○ indicator |

CP input: dark terminal box with cyan border
KW input: rounded card with soft lavender/pink shadow  
NP input: ruled notepad lines inside the textarea

### Screen 3 — Mind Map Canvas

| Zone | y | Height | Content |
|------|---|--------|---------|
| Status bar | 0 | 44 | — |
| Canvas fill | 44 | 696 | Spatial layout (static mockup) |
| ↳ Center hub | (centered) | ~100 | "In 5 years…" node |
| ↳ 7 nodes | (radial) | ~80×60 each | Category nodes |
| ↳ Connections | — | — | Bezier curves or straight lines |
| Lens CTA | 756 | 44 | "Choose Your Lens →" floating button |
| UI Switcher (floating) | 740 | 52 | Overlaid at bottom of canvas |

CP canvas: dark bg, neon-outlined nodes, glowing connections
KW canvas: soft gradient bg, pastel bubble nodes, curved gentle connections
NP canvas: cream bg, sketch-outlined nodes, pencil-thin connections

Node radius placement (from center 195, 422):
- Career: 270° (left), ~130px out
- Creativity: 315° (top-left)
- Health: 0° (right)
- Relationships: 45° (top-right)
- Travel: 90° (top)
- Finances: 180° (bottom)
- Living: 225° (bottom-left)

### Screen 4 — Lens Selection

| Zone | y | Height | Content |
|------|---|--------|---------|
| Status bar | 0 | 44 | — |
| Back nav | 44 | 44 | — |
| Screen heading | 96 | 40 | "SELECT YOUR LENS" / "choose your guide ✦" / "pick your perspective:" |
| 3×3 portrait grid | 152 | 480 | 9 figures, portrait img + name + era |
| UI Switcher | 656 | 52 | — |
| Confirm CTA | 720 | 52 | Disabled until selection, then themed |

Each portrait card: ~100×140px. One card in active state per frame (pre-selected for mockup).

CP card: dark bg, cyan border on active, name in Courier New
KW card: soft white card with rounded corners, pink border on active, name in Nunito
NP card: cream card with navy underline on active, name in Inter

### Screen 5 — AI Response

| Zone | y | Height | Content |
|------|---|--------|---------|
| Status bar | 0 | 44 | — |
| Figure header | 44 | 140 | Portrait (left, ~100px) + name + tag |
| Response block | 200 | 460 | Theme-styled text card (2-3 paragraphs) |
| Action row | 672 | 64 | Save ✦ New Lens ✦ Share — themed buttons |
| UI Switcher | 752 | 52 | (appears as floating overlay if no space) |

CP response: green text (`#39FF14`) on dark terminal card, typewriter font
KW response: bubble card on pink/white, speech bubble tail, Nunito body text
NP response: ruled notepad card with handwriting-style font, "perspective" stamp

---

## Theme-Invariant vs. Theme-Variant

| Element | Invariant (all themes) | Variant (per theme) |
|---------|----------------------|---------------------|
| Frame dimensions | 390×844 | — |
| Zone y-positions | ±10px tolerance | — |
| Content / copy | Same words | Slight tone variations (CAPS / ✨ / Title) |
| Navigation structure | Same pages, same CTA targets | — |
| Number of figures | 9 | — |
| Background | — | Dark gradient / pink-lavender / cream paper |
| Typography | — | Courier/Alumni / Fredoka/Nunito / Inter |
| Border style | — | Asymmetric / rounded pill / offset shadow |
| Effects | — | Neon glow / soft glow / no glow |
| UI Switcher | Position, 3 options | Colors, shape, font |
| CTA label | Similar intent | Different copy, color, font |

---

## Figma Canvas Positioning

All screens on Ideation page. Starting x = 3312, y = 7200.

| Screen | y start | Cyberpunk x | Kawaii x | Notepad x |
|--------|---------|-------------|----------|-----------|
| Landing | 7200 | 3312 | 3782 | 4252 |
| Wizard | 8124 | 3312 | 3782 | 4252 |
| Lens Grid | 9048 | 3312 | 3782 | 4252 |
| Response | 9972 | 3312 | 3782 | 4252 |
| Mind Map | 10896 | 3312 | 3782 | 4252 |

Row gap between screen rows = 140px.

---

## Theme Toggle Interaction Spec

The switcher is always present. The active button reflects the current screen's theme.

**Figma representation:** 3 separate frames per screen (one per theme). The toggling is represented by showing which frame is active, not actual interactivity.

**Future implementation approach:** CSS custom properties (`data-theme` attribute on `<body>`). Three theme token sets override `:root` vars. Theme preference persists in `localStorage`.

The theme switcher component is positioned consistently:
- Landing: y=268
- Wizard: y=540  
- Lens Grid: y=656
- Response: y=752 (or floating)
- Mind Map: y=740 (floating overlay)

---

## Portrait Strategy for Figma

Use these 9 figures (have portrait PNGs in all 3 themes):
1. Dolly Parton — Resilience
2. Socrates — Philosophy
3. Abraham Lincoln — Perseverance
4. Maya Angelou — Voice
5. Nelson Mandela — Long-game
6. Frida Kahlo — Pain into power
7. Mahatma Gandhi — Non-resistance
8. Salvador Dali — Surrealism / creativity
9. Rosa Parks — Courage

Upload portrait PNGs as image fills into Figma portrait frames for landing teaser and full lens grid.

---

## Decisions Made / Alternatives Rejected

- **5 rows of 3 frames** (not 3 rows of 5) — keeps themes visually comparable, easier to review one screen across themes
- **Mind Map as static** — real interactivity is code-only; Figma shows composition intent
- **9 portraits** from file system, not the app's current FIGURES array — aligns Figma with available visual assets
- **Theme switcher always visible** — core feature, must be present on all screens even when tight on space
