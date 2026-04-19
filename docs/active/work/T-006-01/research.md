# T-006-01 Research: Mobile→Web UX Scaling

## 1. Current Baseline

MindShift is a 5-screen wizard (430px max-width) centered in a full-viewport body. It has:
- Fixed 430px container, centered, with thin border rails — looks like a phone bezel on desktop
- No breakpoints whatsoever — web users see a centered phone column
- Bottom-anchored sticky CTAs — correct for mobile, awkward on desktop
- Tab nav bar occupies top ~56px — on desktop this could expand to a sidebar
- All input/interactive surfaces sized for touch (44px+ tap targets mostly met)
- Mindmap canvas: full-width within 430px container, SVG-based

## 2. Responsive Scaling Philosophy for This App Type

### App Category: Reflective/journaling wizard + spatial canvas
Closest analogues: Headspace, Notion, Miro lite, Day One

**Key insight:** Reflection apps benefit from *contained* layouts even on desktop — the "journal" metaphor implies a bounded writing surface, not a stretched viewport. Don't just stretch to 1280px; instead use the extra space for:
- Sidebar context (progress, saved goals, figure bio)
- Split-view on wider screens (question + response side-by-side)
- Expanded mindmap canvas that breathes at desktop scale

### Breakpoint Strategy
Three tiers (not four — avoid over-engineering):

| Tier | Range | Layout Mode |
|------|-------|-------------|
| Mobile | 0–767px | Single-column, full-width, bottom nav |
| Tablet | 768–1023px | Constrained center (600px), bottom nav → top tabs |
| Desktop | 1024px+ | Two-column shell: 360px sidebar + main canvas |

**Fluid zones:** Between breakpoints, content should use `clamp()` for type and `min(600px, 90vw)` for container width — no abrupt reflow.

### Container Strategy
```css
/* Replace the fixed 430px with: */
#app {
  width: min(430px, 100vw);           /* mobile */
  @media (min-width: 768px) {
    width: min(640px, 90vw);          /* tablet: breathe a bit */
  }
  @media (min-width: 1024px) {
    width: 100%;
    max-width: 1280px;
    display: grid;
    grid-template-columns: 360px 1fr; /* sidebar + main */
  }
}
```

## 3. Navigation Adaptation

### Mobile (current): Tab bar in top nav
Three tabs: SHIFT / MAP / ARCHIVE — works at 430px.

### Tablet: Horizontal tab bar, wider touch targets
- Tabs expand to full labels, more breathing room
- Sticky top, not floating

### Desktop: Left sidebar
```
┌──────────────────────────────────────────┐
│  SIDEBAR (360px)  │  MAIN CONTENT         │
│  ─────────────    │                       │
│  ◉ MindShift logo │  [Screen content]     │
│                   │                       │
│  ● Shift (active) │                       │
│  ○ Mind Map       │                       │
│  ○ Archive        │                       │
│                   │                       │
│  ─ Progress ─     │                       │
│  Step 2 of 5      │                       │
│  ████░░ 40%       │                       │
│                   │                       │
│  ─ Figure ─       │                       │
│  [Portrait]       │                       │
│  Marcus Aurelius  │                       │
│  "Consider..."    │                       │
└──────────────────────────────────────────┘
```

The sidebar is idle real estate on mobile — on desktop it becomes a persistent context panel showing:
- Current wizard step progress
- Selected figure bio snippet
- Saved goals preview
- Quick actions (share, reset)

## 4. Touch → Pointer Interaction Parity

### Tap targets
- Mobile: 44×44px minimum (WCAG 2.5.5 AAA target)
- Desktop: 32×32px acceptable (pointer precision), hover states required
- Strategy: use `@media (pointer: coarse)` to conditionally enlarge targets

```css
.nav-icon-btn {
  min-width: 34px; min-height: 34px; /* current */
}
@media (pointer: coarse) {
  .nav-icon-btn { min-width: 44px; min-height: 44px; }
}
```

### Hover states
Currently hover is styled but not meaningful on mobile (no hover). On desktop:
- All interactive elements need `:hover` + `:focus-visible` states
- Glow effects on hover are already implemented — good
- Add `cursor: pointer` explicitly on all clickable elements (currently mixed)

### Mindmap Canvas Gestures
| Gesture | Mobile | Desktop equivalent |
|---------|--------|--------------------|
| Pinch zoom | Touch | Scroll wheel + cmd |
| Pan | Two-finger drag | Click + drag |
| Node tap | Single tap | Single click |
| Node detail | Long press | Click or hover popover |

## 5. Typography Scaling

Current type system: fixed px values throughout. For mobile→web:

### Fluid type with clamp()
```css
/* Formula: clamp(min, preferred, max) */
/* preferred = v * 1vw + r * 1rem */

--text-xs:   clamp(9px,  0.5vw + 8px,  11px);
--text-sm:   clamp(11px, 0.6vw + 9px,  13px);
--text-base: clamp(13px, 0.7vw + 10px, 16px);
--text-lg:   clamp(16px, 1vw  + 12px,  20px);
--text-xl:   clamp(20px, 1.5vw + 14px, 28px);
--text-2xl:  clamp(26px, 2vw  + 16px,  40px);
```

This preserves the tight mobile typography while giving desktop users more comfortable reading sizes without jarring jumps.

## 6. Engagement Patterns for Reflection Apps

### Onboarding / First Run
- **Pattern:** Empty state with character — kawaii avatar guides first action
- **Implementation:** On first load, show a mascot/guide character with speech bubble
- **Evidence:** Duolingo (+40% D1 retention from character presence in onboarding)

### Progress Feedback
- **Pattern:** Wizard step indicator that celebrates completion
- **Current:** None visible
- **Implementation:** Step dots (●●○○○) with spring animation on advance
- **WCAG:** Must have text alternative "Step 2 of 5"

### Micro-interactions
| Moment | Pattern | Implementation |
|--------|---------|----------------|
| Button press | Press-down scale(0.97) + glow flash | CSS transform + animation |
| Card select | Border sweep animation (draw border) | SVG stroke-dashoffset |
| Figure pick | Portrait zoom-in + glow burst | CSS keyframe |
| Text input focus | Label lift + color change | Already implemented |
| AI loading | Terminal cursor blink + dots | Already implemented |
| Mindmap node expand | Radial fan-out animation | CSS transform + JS |

### Celebration Moments
- **Mindmap complete:** Confetti burst (pink + cyan particles, 2s, then fade)
- **Goal saved:** Node "pulses" cyan glow twice
- **prefers-reduced-motion:** All replaced with instant state changes

### Retention Hooks
- **Save prompt:** After mindmap complete, "📎 Save your mindmap" CTA appears after 3s delay
- **Share:** Native share API on mobile, clipboard copy on desktop
- **Re-engage:** Last session goal shown as teaser on next open

## 7. Canvas/Mindmap Considerations

### Mobile (current 430px)
- Nodes occupy most of width — already tight
- Panning needed for 7 nodes + central hub
- Double-tap to zoom into node detail

### Desktop (800px+ canvas)
- Full radial layout visible without panning
- Nodes can be larger with more text visible
- Hover shows goal bullets without tap
- Drag to reposition nodes (optional — could be a later feature)

### Recommendation
- Keep central hub fixed center
- Scale node sizes with `vw` units within the canvas
- On desktop, expand canvas to fill main column (not just 430px)

## 8. Constraints and Open Questions

### Constraints
- No build step — fluid type must use pure CSS custom properties
- Single-file HTML — CSS breakpoints must be inline
- Current neon palette: contrast ratios need audit (see T-006-05)

### Open Questions for T-006-02 (Figma)
- Do lofi screens show a desktop layout at all, or only mobile?
- Is there a sidebar pattern implied in the lofi mindmap screen?
- What spacing rhythm does the lofi use? 8px or 4px base?

### Open Questions for T-006-03 (Aesthetic Fusion)
- Where does kawaii enter without breaking cyberpunk immersion?
- Font pairing: can we load a Google Font for kawaii display moments without a build step?
- How does notepad texture work on a dark background?
