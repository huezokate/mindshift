# T-006-03 Design: Aesthetic Fusion — Chosen Approach

## Decision: "Cyberpunk Shell, Kawaii Soul"

The chosen framing: **The app is a cyberpunk terminal that has a heartbeat.**

The shell (nav, system elements, AI terminal) is pure cyberpunk — sharp, cool, data-forward. The heart (moments of human emotion: choosing a figure, writing a goal, seeing your mindmap) pulses kawaii warmth. Notepad texture is the "paper" the terminal runs on — visible only when writing.

This avoids the most common fusion failure: trying to blend aesthetics evenly, producing visual mush. Instead, we assign each register a **domain** and keep those domains clean.

## Aesthetic Domain Map

| Domain | Aesthetic | Examples |
|--------|-----------|---------|
| System chrome | Cyberpunk | Top nav, tab bar, sidebar, terminal box headers, loading states |
| Data display | Cyberpunk | AI response text, char counter, status labels, timestamps |
| User input surfaces | Notepad | Textarea, goal input lines, ruled line bg |
| Emotional peaks | Kawaii | Onboarding guide, figure selection, save celebration, empty states |
| Mindmap nodes | Hybrid (Cyber + Kawaii) | Sharp clip-path shape, but soft glow color per category |

## Color Palette (Final)

```css
/* ── Core Cyberpunk ── */
--bg:           #07070F;
--bg-2:         #0D0D1C;
--bg-3:         #121228;
--cyan:         #00FFC8;
--pink:         #FF2D6B;
--white:        #E8E8FF;
--white-2:      #A0A0CC;
--white-3:      #505077;

/* ── Kawaii Extensions ── */
--lavender:     #C8AEFF;   /* figure selection, accent sparkles */
--peach:        #FFB36E;   /* celebration, goal save */
--mint:         #AEFFEA;   /* onboarding guide, empty state text */
--star-gold:    #FFE87C;   /* achievement star particles */

/* ── Notepad ── */
--notepad-line: rgba(0, 255, 200, 0.06);  /* ruled line on textarea */
--ink-blur:     rgba(232, 232, 255, 0.6); /* ink-appear animation start */
```

## Typography Stack (Final)

```css
--font-mono:        'Courier New', 'Lucida Console', monospace;
--font-sans:        -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-kawaii:      'Nunito', 'Segoe UI', system-ui, sans-serif;
--font-handwritten: 'Caveat', 'Comic Sans MS', cursive;
```

Usage rules:
- `--font-mono`: all system chrome, labels, AI response, terminal
- `--font-sans`: question headings, screen titles (high legibility needed)
- `--font-kawaii`: figure names in grid, mindmap node category labels, guide character speech
- `--font-handwritten`: goal bullet text in Screen 4, node goal bullets in Screen 5

## Animation Register Map

```css
/* Cyberpunk: instant or linear — machines don't spring */
--ease-system:     linear;
--dur-system:      150ms;

/* Kawaii: bouncy overshoot — organic, alive */
--ease-kawaii:     cubic-bezier(0.34, 1.56, 0.64, 1);
--dur-kawaii:      350ms;

/* Notepad: slow reveal — ink absorbing */
--ease-notepad:    ease-out;
--dur-notepad:     250ms;

/* Celebration: exuberant */
--dur-celebrate:   600ms;
```

## Rejected Alternatives

### "Kawaii Overhaul" — Make everything softer
Rejected: Loses the distinctiveness that makes MindShift feel different. Becomes another pastel wellness app.

### "Notepad First" — Lead with analog feel
Rejected: A "digital notebook" product already exists (Notion, Obsidian, Bear). The cyberpunk angle is MindShift's differentiator.

### "Glitch Art" — Lean into cyberpunk distortion
Rejected: Glitch effects (CSS `clip-path` animations, RGB split) are visually aggressive and create accessibility issues (vestibular disorders). The scanline overlay is enough.

### "Full Figma Component Library" — Build real design system
Rejected for this sprint: T-002-01 covers this. T-006 is a planning pass — actual component library is the next sprint's implementation work.

## Screen-by-Screen Aesthetic Assignment

### Screen 1: Question (Cyberpunk + Notepad)
- Chrome: full cyberpunk
- Textarea: notepad (ruled lines, ink-bleed character appear)
- Example pills on hover: lavender glow instead of pink glow (softer)
- Empty state (no text yet): mint guide character speech bubble appears

### Screen 2: Figures (Cyberpunk + Kawaii peak)
- Grid cards: cyberpunk base (dark bg, sharp border)
- On select: lavender sparkle burst (8 CSS particles, 400ms)
- Portrait border on select: cycles cyan → lavender → cyan (2 cycles, then holds)
- Figure name font: `--font-kawaii` (Nunito 700)

### Screen 3: AI Response (Pure Cyberpunk)
- Most "system" screen — no kawaii
- Typewriter reveal: cyberpunk cursor blink, 30ms/char
- Quote reference: pink left-border (current, keep)
- Tab labels: PERSPECTIVE / QUESTIONS / EXERCISE — keep uppercase mono

### Screen 4: Goals Input (Cyberpunk + Notepad + Kawaii micro)
- Input lines: notepad (single underline border, ruled line bg, Caveat font for goal text)
- Goal add: star burst micro (✦ particle, 300ms)
- Category title font: `--font-kawaii` (friendly, not clinical)
- Navigation: cyberpunk (prev/next buttons, sharp)

### Screen 5: Mindmap Canvas (Hybrid)
- Canvas background: cyberpunk (dark, subtle grid)
- Node shapes: organic clip-path, cyberpunk neon border
- Node category label: `--font-kawaii` (readable at small size)
- Node goal bullets: `--font-handwritten` (user's own words feel personal)
- On complete: confetti celebration (cyan + pink + lavender + star-gold particles)
- Hub node: largest, cyan glow, mono font "IN 5 YEARS..."

## Open Questions Resolved

**Q: Can we load Google Fonts without a build step?**
A: Yes — `<link>` tag in `<head>`. Two fonts (Nunito, Caveat), `display=swap`. ~8KB. Acceptable.

**Q: Where does kawaii enter without breaking cyberpunk immersion?**
A: Character-level interactions (figure select, goal save, empty states) — not structural elements. The structure remains cyberpunk; only the moments of human connection get warmth.

**Q: How does notepad texture work on a dark background?**
A: As a `repeating-linear-gradient` with the line color at 6% opacity cyan. Barely visible — subconscious texture, not decoration.
