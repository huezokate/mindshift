# Research: screen-interaction-research (T-009-01)

## Codebase Entry Point

`HTML/mindshift.html` — monolithic single-file app (vanilla HTML/CSS/JS, ~2300 lines).

Navigation: `navigateToPage(N)` hides all `.container` divs, shows `#pageN.active`. Six pages total:

| Page ID | Screen | Role |
|---------|--------|------|
| page1   | Landing / Home | Two-path entry: "Build my mind map" or "I have something on my mind" (vent flow) |
| page2   | Wizard / Vision Input | "How do you want to grow in the next 5 years?" multi-category input |
| page3   | Mind Map Canvas | SVG spatial canvas, 7 organic nodes, center hub, "Choose Your Lens →" button |
| page4   | Lens Selection (Personas) | 4-up persona grid: Socrates, Dolly Parton, etc. → flows to page5 |
| page5   | AI Response | Figure portrait + deep-dive response + "Try Another Lens" / "Back to Map" actions |
| page6   | Vent Lens Picker | Figure selection grid for the vent flow (accessed from landing "vent" CTA) |

---

## Screen-by-Screen Content Inventory

### Screen 1 — Landing (page1)
Content:
- Brand title: "MindShift" (no theme-specific styling currently)
- Subtitle: "Map your 5-year vision"
- Two flow cards:
  - "Build your map" card → navigateToPage(2)
  - "Vent it out" card → navigateToPage(6)
- No theme toggle exists yet

Interactions: tap one of two cards to enter the app.

### Screen 2 — Wizard / Vision Input (page2)
Content:
- Title: "How do you want to grow in the next 5 years?"
- 7 category inputs (one per life area): Career, Creativity, Health & Wellness, Relationships, Travel, Finances, Living Situation (Scandinavia in design)
- Each category: label + textarea
- CTA: "Build My Map →" → navigateToPage(3)

Interactions: text input per category, submit button.

### Screen 3 — Mind Map Canvas (page3)
Content:
- SVG canvas rendered by JS into `#canvas` element
- Center hub: "In 5 years…" + user subtitle
- 7 category nodes: each shows category name, goal bullets, optional mood images
- "Choose Your Lens →" button (canvas-lens-btn) → navigateToPage(4)
- Per-node "🔮 Apply a Lens" button when node is expanded

Interactions: click node to expand/collapse, drag/scroll canvas (T-001 scrolling logic), choose lens button.

### Screen 4 — Lens Selection (page4 + page6)
Content (page4 — map flow):
- Title: "These personas will reinterpret your map"
- 10-figure grid (FIGURES array): Dolly Parton, Socrates, Abraham Lincoln, Maya Angelou, Marcus Aurelius, Marie Curie, Nelson Mandela, Frida Kahlo, Steve Jobs, Oprah Winfrey
- Each card: emoji icon, name, tag line
- Custom persona text input
- CTA: "See My Perspective →"

Content (page6 — vent flow):
- Title: "pick your lens"
- Same figure grid but styled differently (`.figure-grid` vs `.persona-grid`)

Interactions: click figure to select, submit, custom persona fallback.

### Screen 5 — AI Response (page5)
Content:
- Context bar: figure icon, quote
- Vent context display (user's original text, if vent flow)
- Four deep-dive sections revealed with animation:
  - Core Philosophy
  - Direct Advice
  - Challenge
  - Call to Action
- Action row: "← Try Another Lens" | "Back to Map"

Interactions: read response, navigate back.

---

## Theme Toggle — Current State

**Does not exist in the codebase.** All pages use a single dark purple theme (CSS vars on `:root`). No theme switching is implemented.

The 3 design systems (Cyberpunk, Kawaii, Notepad) exist only in Figma. The theme toggle is a new feature to design and implement.

---

## Portrait Asset Inventory

15 figures have portraits in all 3 styles:

| Figure | Cyberpunk | Kawaii | Notepad |
|--------|-----------|--------|---------|
| Abraham Lincoln | ✓ | ✓ (v2 available) | ✓ |
| Che Guevara | ✓ | ✓ | ✓ |
| Ching Shih | ✓ | ✓ | ✓ |
| Chuck Norris | ✓ | ✓ | ✓ |
| Dolly Parton | ✓ | ✓ | ✓ |
| Donald Trump | ✓ | ✓ | ✓ |
| Frida Kahlo | ✓ | ✓ | ✓ |
| Mahatma Gandhi | ✓ | ✓ | ✓ |
| Maya Angelou | ✓ | ✓ | ✓ |
| Napoleon Bonaparte | ✓ | ✓ | ✓ |
| Nelson Mandela | ✓ | ✓ | ✓ |
| Rosa Parks | ✓ | ✓ | ✓ |
| Salvador Dali | ✓ | ✓ | ✓ |
| Socrates | ✓ | ✓ | ✓ |
| Vladimir Lenin | ✓ | ✓ | ✓ |

**Mismatch with FIGURES array:** The app uses 10 figures (Dolly Parton, Socrates, Lincoln, Maya Angelou, Marcus Aurelius, Marie Curie, Nelson Mandela, Frida Kahlo, Steve Jobs, Oprah Winfrey). Only 6 of those have portrait PNGs. 9 portrait-having figures are NOT in the app.

**For Figma screens:** Use the 9 portrait-having figures that best align with the app's tone. Recommended selection: Dolly Parton, Socrates, Abraham Lincoln, Maya Angelou, Nelson Mandela, Frida Kahlo, Che Guevara, Salvador Dali, Mahatma Gandhi.

---

## Theme Visual Specifications (from Figma design system session)

### Cyberpunk
- Background: `#080810` → `#0D0D1A` gradient
- Accent: cyan `#00F5FF`, green `#39FF14`, pink `#FF2D78`, violet `#B04CFF`
- Fonts: Courier New Bold/Regular (headings/body), Alumni Sans SC SemiBold (buttons)
- Borders: asymmetric (thick bottom-right), neon glow effects
- Tone: dark, terminal, hacker aesthetic

### Kawaii
- Background: `#FFF0F8` → `#F5E7FF` gradient (pink → lavender)
- Accent: hot pink `#FF64A0`, lavender `#C09DF7`, mint `#9BEFCF`, yellow `#FFF587`
- Fonts: Fredoka One Regular (H1, buttons), Comfortaa Bold (H2), Nunito Regular (body)
- Borders: rounded-[32px] pills, soft shadow
- Tone: bubbly, playful, warm

### Notepad
- Background: `#FAF7F2` (cream paper)
- Accent: navy `#1E1E40`, blue `#3A6FA8`, sage `#7D9E7D`, red `#C0605A`
- Fonts: Inter Semi Bold (brand/headings), Inter Medium (buttons), Inter Regular (body)
- Details: ruled lines (horizontal), left margin line (red), offset drop-shadow buttons
- Tone: analog, grounded, reflective

---

## UI Theme Switcher Designs (from Main Components, node 397:3524)

### Cyberpunk switcher
- Inline 3 chips: CYBERPUNK (active, cyan border + tinted bg), KAWAII (pink), NOTEPAD (green)
- Font: Alumni Sans SC, asymmetric borders, no container bg

### Kawaii switcher
- 3 pills in a row with semi-transparent white container, cornerRadius 32px
- Active=pink (#FDB6FE), Cyberpunk=teal (#49DBC8), Notepad=white
- Font: Fredoka One

### Notepad switcher
- 3 buttons with solid border + offset drop-shadow
- Active=cream (NOTEPAD), others=navy/blue and red
- Font: Inter Medium

---

## Key Constraints and Assumptions

1. **Theme toggle is new.** Must design both the Figma interaction (overlay states) and eventual implementation (CSS var swap).
2. **Portrait grid should use 9 figures with real PNGs** (not the current FIGURES array which has 4 without portraits).
3. **Screen 3 (Mind Map) is complex** — the spatial canvas likely needs to be represented as a static Figma mockup, not interactive.
4. **Page 6 (vent lens) and Page 4 (map lens)** are functionally the same screen with different contexts — design as one template, show one version per theme.
5. **Notepad margin alignment** — text content starts at x=68 (after left margin line at x=52).
