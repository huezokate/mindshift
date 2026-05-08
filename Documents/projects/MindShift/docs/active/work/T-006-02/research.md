# T-006-02 Research: Figma Lofi Screen Analysis

## 1. Source Material

Figma file: https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift
Key node: 270-1180 (Lo-fi new UI for mind map screen section)

From CLAUDE.md:
- Section "old UI" — 5 screens of the current linear wizard
- Section "Lo-fi new UI for mind map screen" — target spatial canvas mind map:
  - Centered on "In 5 years..." hub
  - 7 organic-shaped nodes: career, creativity, health & wellness, relationships, travel, finances, Scandinavia
  - Each node: goal bullets + mood board images
  - Connected by curved arrows

Note: Figma authentication is pending — this analysis is based on CLAUDE.md documentation, existing HTML, and the design intent described. To be validated and extended once Figma access is confirmed.

## 2. Screen Inventory (From HTML + Documentation)

### Screen 1: Question / Prompt Entry
**Purpose:** Get the user's current challenge or question
**Components:**
- Top nav (logo + tabs + icon buttons)
- Section label ("YOUR CHALLENGE")
- Large heading with cyan accent ("What's weighing on your mind?")
- Subtext
- Labeled textarea with char counter
- Example pills (tap to fill)
- Primary CTA button ("DECODE WITH AI")
- Usage note

**Layout grid (mobile 430px):**
- 20px horizontal padding
- 28px section gaps
- Textarea: min 120px height, full-width
- Pills: flex-wrap, 8px gap
- CTA: full-width, 16px padding (48px touch target ✓)

**Lofi → Hi-fi translation notes:**
- Textarea needs kawaii "thinking" placeholder animation
- Example pills are a strong engagement pattern — keep prominent
- CTA needs celebration micro-interaction on tap

### Screen 2: Figures / Lens Picker
**Purpose:** Choose a historical figure to provide perspective
**Components:**
- Back button + question bubble (reference to Screen 1 input)
- Screen title + subtitle
- 3-column figure grid (3×3 = 9 cards per T-005-01)
- Figure card: portrait circle, name, description
- Sticky bottom CTA ("GET THEIR PERSPECTIVE")

**Layout grid:**
- Figure grid: 3-col with 10px gap, 16px 20px padding
- Figure card: 64px portrait circle, 10px font name, 9px description
- Cards: 14px padding, flex-col centered

**Lofi implications:**
- The 3×3 grid is the primary engagement surface — cards need hover/select states that feel tactile
- Portrait circles are character presence — lean into kawaii for the selection glow
- The "question bubble" recapping their input is a clever UX anchor — preserve it

### Screen 3: AI Response / Terminal Reveal
**Purpose:** Show in-character AI response from the selected figure
**Components:**
- Response header: figure portrait + name/era + action buttons (bookmark, share, new)
- Question reference (pink left-border blockquote)
- Terminal box with header (3 colored dots) + body text
- Loading state: blinking dots animation
- "REFLECT DEEPER" CTA
- Tab row: PERSPECTIVE / QUESTIONS / EXERCISE

**Layout grid:**
- Response header: 48px portrait, flex row, space-between
- Terminal box: 16px margin horizontal, 1px border, 8px header + 20px body
- Loading state: flex row, gap 10, font-size 12px

**Lofi implications:**
- Terminal aesthetic is the most "cyberpunk" screen — lean hard into this
- The tab row (PERSPECTIVE/QUESTIONS/EXERCISE) is a depth mechanism — each tab = different engagement layer
- The "typewriter" reveal of AI text is implied but not yet implemented — high-impact engagement feature

### Screen 4: Goals Input
**Purpose:** Enter specific goals per life category
**Components:**
- Category header (career, creativity, etc. with color accent)
- Goal input list (add/remove items)
- Navigation: prev/next category
- Progress indicator

**Layout grid:**
- To be confirmed from Figma lofi — this screen is less documented in CLAUDE.md
- Likely: category title, input list, pagination controls at bottom

**Lofi implications:**
- This is the most "notepad" screen — handwritten feel, lined paper texture could work here
- Each goal entry = a small win moment (micro-celebration on add)

### Screen 5: Mindmap Canvas
**Purpose:** Spatial visualization of goals as organic mind map
**Components:**
- Central hub node: "In 5 years..." circle (largest)
- 7 satellite nodes: career, creativity, health & wellness, relationships, travel, finances, Scandinavia
- Organic blob shapes (not rectangles)
- Curved SVG arrows connecting hub to nodes
- Each node: category color, goal bullets (2-3), mood image thumbnail
- Pan/zoom controls

**Layout grid (lofi description):**
- Hub: centered, ~100px diameter
- Nodes: radial layout, ~80-100px each
- Arrows: curved bezier, 2px stroke
- Full-width canvas, overflow-x scroll on mobile

**Lofi implications:**
- The "organic shape" requirement means CSS clip-path or SVG shapes — not border-radius
- Mood board images inside nodes is the richest visual element — needs careful WCAG treatment (decorative vs informative)
- On desktop, this canvas should expand to fill the full main column (not stay at 430px)

## 3. Component Inventory

### Repeating Components
| Component | Screens | Notes |
|-----------|---------|-------|
| Top nav bar | 1, 2, 3, 4, 5 | Tabs vary per screen |
| Section label | 1, 4 | 10px mono uppercase cyan |
| Primary CTA button | 1, 2, 3, 4 | Full-width, 16px padding |
| Back button (square) | 2, 3, 4 | 34px square icon button |
| Portrait circle | 2, 3 | 64px / 48px, neon border |
| Terminal box | 3 | Header + body pattern |
| Icon buttons row | 3 | 34px square, border |

### Screen-Specific Components
| Component | Screen | Notes |
|-----------|--------|-------|
| Textarea with label | 1 | Custom labeled input |
| Example pills | 1 | Flex-wrap pill row |
| Figure grid | 2 | 3-col CSS grid |
| Question bubble | 2 | Reference quote |
| Tab row | 3 | PERSPECTIVE/QUESTIONS/EXERCISE |
| Goal input list | 4 | Add/remove rows |
| SVG mindmap | 5 | Canvas with organic nodes |

## 4. Token Candidates from Lofi

### Spacing Rhythm
From existing HTML:
- Base unit: 8px (most paddings are multiples of 8: 16, 20, 28)
- Inner padding: 14-16px
- Section gap: 28px
- Grid gap: 8-10px
- **Recommendation: 8px grid confirmed**

### Type Scale
From existing HTML:
- xs: 9-10px (labels, counters)
- sm: 11-12px (descriptions, subtitles)
- base: 13-14px (body text)
- lg: 20px (screen titles)
- xl: 26px (question heading)

### Color Roles (from lofi intent + current implementation)
- Surface 1 (deepest): `#07070F` — main bg
- Surface 2: `#0D0D1C` — cards, nav
- Surface 3: `#121228` — hover states, terminal header
- Primary accent: `#00FFC8` cyan — active states, focus, labels
- Secondary accent: `#FF2D6B` pink — destructive, highlights, pills
- Text primary: `#E8E8FF`
- Text muted: `#A0A0CC`
- Text disabled: `#505077`

### Missing Tokens (to define in T-006-04)
- Per-category node colors (7 categories need distinct but cohesive colors)
- Kawaii accent palette
- Notepad texture tokens
- Animation durations

## 5. Open Questions

1. **Desktop layout in lofi?** Does node 270-1180 show any desktop/tablet variants, or only mobile?
2. **Screen 4 goals input:** Exact layout not documented — need Figma access to confirm
3. **Node organic shapes:** Are specific clip-path shapes shown, or is "organic" left to interpretation?
4. **Arrow style:** Curved bezier — any arrowhead style shown?
5. **Mood images in nodes:** Placeholder boxes, or actual image references in lofi?
6. **Category node colors:** Are per-category colors defined in Figma, or TBD?
7. **Typewriter animation:** Implied or explicitly shown in lofi for Screen 3?

## 6. Figma Design System Status

From T-002-01 ticket (open, in research phase):
- CSS tokens are partially defined in the HTML
- A "Design System" Figma frame is planned but may not exist yet
- T-002-01 is ready to schedule — it overlaps significantly with T-006-04

**Recommendation:** T-006-04 (design-system-tokens) should consume the T-002-01 output or be merged with it to avoid duplication.
