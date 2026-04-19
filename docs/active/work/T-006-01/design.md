# T-006-01 Design: Mobile→Web Responsive Strategy

## Approaches Evaluated

### Option A: Breakpoint-Free Fluid Scaling (intrinsic CSS)
Use only fluid units (clamp, min, max, vw) — no `@media` queries. The app container grows from 390px to ~640px naturally.

**Pros:** Simple CSS, no layout shifts at breakpoints
**Cons:** No sidebar, no two-column layout — desktop just gets a wider phone. Wastes desktop real estate on the mindmap screen in particular.

**Verdict: Rejected.** Too little ambition for desktop — the mindmap canvas especially deserves more space.

### Option B: Three-Tier Breakpoints with Sidebar (Chosen)
Mobile (0–767px): current layout, full-width
Tablet (768–1023px): constrained container, same single-column flow
Desktop (1024px+): two-column grid — persistent sidebar + main content

**Pros:**
- Desktop gets meaningful layout upgrade (sidebar = context + progress)
- Tablet is a smooth transition, no jarring reflow
- Mindmap canvas can expand fully on desktop
- Aligns with reflection app analogues (Notion, Day One)

**Cons:**
- More CSS to write and maintain
- Sidebar needs its own component hierarchy (currently doesn't exist)

**Verdict: Chosen.** Best return on investment for desktop experience without over-engineering.

### Option C: Responsive Shell + Modal Sheets
Keep mobile layout always, but on desktop use the extra space for slide-over panels (figure bio, saved goals) instead of a persistent sidebar.

**Pros:** Lower implementation complexity
**Cons:** Modal-heavy UX is cognitively heavier than sidebar at desktop; breaks spatial continuity

**Verdict: Rejected.** Sidebar is simpler UX at desktop, modals are for mobile.

## Chosen Design: Three-Tier Responsive Shell

### Layout Structure

```
MOBILE (< 768px)
┌─────────────────────┐
│ TOP NAV             │  56px sticky
│─────────────────────│
│                     │
│   SCREEN CONTENT    │  flex-grow: 1, overflow-y: auto
│                     │
└─────────────────────┘

TABLET (768–1023px)
    ┌─────────────────────────────┐
    │         TOP NAV             │
    │─────────────────────────────│
    │                             │
    │      SCREEN CONTENT         │  max-width: 640px, centered
    │      (single column)        │
    │                             │
    └─────────────────────────────┘

DESKTOP (1024px+)
┌──────────────┬────────────────────────────┐
│   SIDEBAR    │    MAIN CONTENT            │
│   360px      │    flex: 1                 │
│   fixed      │    overflow-y: auto        │
│              │                            │
│  • Logo      │    [Screen 1-5 content]    │
│  • Nav tabs  │                            │
│  • Progress  │                            │
│  • Figure    │                            │
│    context   │                            │
│  • Saved     │                            │
│    goals     │                            │
└──────────────┴────────────────────────────┘
```

### CSS Architecture Decision

Use a single `:root` breakpoint variable approach with CSS custom properties that change at breakpoints, then consume those tokens in component CSS. This keeps the responsive logic centralized.

```css
:root {
  --app-max-width: 430px;
  --sidebar-width: 0px;
  --nav-mode: 'top'; /* custom property value for JS to read */
  --content-padding: 20px;
}
@media (min-width: 768px) {
  :root {
    --app-max-width: 640px;
    --content-padding: 28px;
  }
}
@media (min-width: 1024px) {
  :root {
    --app-max-width: 1280px;
    --sidebar-width: 360px;
    --content-padding: 40px;
  }
}
```

### Navigation Mode Transition

| Screen width | Nav pattern | Tab labels |
|-------------|-------------|------------|
| < 768px | Top bar tabs (current) | SHIFT / MAP / ARCHIVE |
| 768–1023px | Top bar tabs, wider | Shift / Mind Map / Archive |
| 1024px+ | Left sidebar nav | Full labels + icons |

The JS tab switching logic doesn't need to change — only the CSS controls layout.

### Mindmap Canvas Expansion

On desktop, the canvas container removes the 430px cap:
```css
#mindmap-canvas {
  width: 100%;
  height: 100vh;
  /* On mobile: constrained by parent 430px */
  /* On desktop: fills the main column = 1280 - 360 = 920px */
}
```

This is the highest-value responsive upgrade — the mindmap finally has room to breathe.

## Implementation Sequencing

1. Add CSS custom property breakpoint tokens to `:root`
2. Update `#app` to use grid at desktop breakpoint
3. Create sidebar HTML structure (hidden on mobile via CSS)
4. Update nav tabs to collapse into sidebar on desktop
5. Update mindmap canvas to be unconstrained on desktop
6. Update all fixed px padding to use `--content-padding` token
7. Add `@media (pointer: coarse)` touch target enlargements

## Risk: Sidebar Adds HTML Complexity

Currently the app is a flat shell. Adding a sidebar requires restructuring the top-level HTML from:
```html
<div id="app">
  <nav class="top-nav">...</nav>
  <div class="screen active" id="screen-1">...</div>
  ...
</div>
```
to:
```html
<div id="app">
  <aside class="sidebar">...</aside>
  <div class="main-shell">
    <nav class="top-nav">...</nav> <!-- only on mobile/tablet -->
    <div class="screen active" id="screen-1">...</div>
  </div>
</div>
```

This is a structural change but not a behavioral one — all JS logic stays the same.
