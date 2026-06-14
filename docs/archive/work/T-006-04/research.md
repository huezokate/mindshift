# T-006-04 Research: Design System Tokens

## 1. Current Token State (mindshift-cyberpunk.html)

The current `:root` block defines:
```css
--bg, --bg-2, --bg-3          /* 3 surface levels */
--cyan, --cyan-dim, --cyan-glow
--pink, --pink-dim, --pink-glow
--white, --white-2, --white-3
--border, --border-2
--font-mono, --font-sans
```

Missing:
- Kawaii palette tokens
- Notepad tokens
- Spacing scale (hardcoded: 8, 10, 14, 16, 20, 28, 40px scattered)
- Type scale tokens (hardcoded: 9, 10, 11, 12, 13, 14, 15, 20, 26px)
- Border-radius tokens (hardcoded: 0, 1, 2, 50%)
- Animation tokens (hardcoded: 0.2s, various)
- Breakpoint tokens (none — no responsive system)

## 2. Spacing Audit

From reading mindshift-cyberpunk.html CSS:

| Value | Occurrences | Usage |
|-------|-------------|-------|
| 4px | 2 | Terminal dot spacing, small gaps |
| 6px | 3 | Subtext margin, small top spacing |
| 8px | 8 | Grid gap, pill gap, letter-spacing-related |
| 10px | 5 | Grid gap, section padding |
| 12px | 4 | Pill padding, small margins |
| 14px | 6 | Button padding, terminal padding |
| 16px | 12 | Standard padding (most common) |
| 20px | 10 | Content padding (second most common) |
| 28px | 4 | Screen/section gap |
| 40px | 1 | Desktop padding (implied) |

**Confirmed: 8px base grid.** Most values are multiples of 4 or 8. Exceptions: 6px (subtext margin), 10px (grid gap) — acceptable as half-steps.

Token recommendations:
```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-7:  28px;
--space-8:  32px;
--space-10: 40px;
```

## 3. Type Scale Audit

From mindshift-cyberpunk.html:
| px | Usage | Token |
|----|-------|-------|
| 9px | Figure description | --text-2xs |
| 10px | Labels, counters, section-label, usage-note | --text-xs |
| 11px | Pills, subtitle, nav-tab | --text-sm |
| 12px | Body text, response text | --text-base |
| 13px | CTA button, response body | --text-md |
| 14px | Input, figure name context | --text-lg |
| 15px | Nav logo | --text-xl |
| 20px | Screen title | --text-2xl |
| 26px | Question heading | --text-3xl |

Fluid type using clamp (mobile 390px → desktop 1280px):
```css
--text-2xs: clamp(9px,  0.5vw + 7px,  10px);
--text-xs:  clamp(10px, 0.5vw + 8px,  12px);
--text-sm:  clamp(11px, 0.6vw + 9px,  13px);
--text-base:clamp(12px, 0.7vw + 9px,  14px);
--text-md:  clamp(13px, 0.8vw + 10px, 16px);
--text-lg:  clamp(14px, 1vw  + 10px,  18px);
--text-xl:  clamp(15px, 1vw  + 11px,  18px);
--text-2xl: clamp(18px, 1.5vw + 12px, 24px);
--text-3xl: clamp(22px, 2vw  + 14px,  36px);
```

## 4. Border Radius Audit

| Value | Context | Token |
|-------|---------|-------|
| 0 | Most elements — cyberpunk sharp | (default, no token needed) |
| 1-2px | Nav container, pill | --radius-sharp: 2px |
| 50% | Portrait circles | --radius-full: 9999px |
| [new] 8px | Kawaii pill hover, guide character | --radius-soft: 8px |
| [new] 16px | Kawaii speech bubble | --radius-kawaii: 16px |

## 5. Animation Token Audit

Current: `transition: all 0.2s` everywhere — too generic.

| Context | Duration | Easing | Token |
|---------|----------|--------|-------|
| System hover (glow, color) | 150ms | linear | --dur-fast |
| State change (tab switch, select) | 200ms | ease-out | --dur-base |
| Kawaii entrance | 350ms | bounce | --dur-kawaii |
| Typewriter char | 30ms/char | linear | --dur-char |
| Notepad ink appear | 250ms | ease-out | --dur-ink |
| Celebration burst | 600ms | ease-out | --dur-celebrate |

## 6. Per-Category Color System

7 mindmap categories need distinct colors. Must work on dark bg, must be cyberpunk-adjacent:

| Category | Color | Rationale |
|----------|-------|-----------|
| Career | `#00FFC8` (cyan) | Primary accent — career = logic/achievement |
| Creativity | `#C8AEFF` (lavender) | Kawaii anchor — creative = imaginative |
| Health & Wellness | `#AEFFEA` (mint) | Soft cyan — health = calm, vital |
| Relationships | `#FF2D6B` (pink) | Secondary accent — love/connection |
| Travel | `#FFE87C` (star-gold) | Adventure, warmth, discovery |
| Finances | `#A0A0CC` (white-2) | Neutral, analytical, controlled |
| Scandinavia | `#6BC8FF` (ice-blue) | Nordic cool, distinct from main cyan |

All against `--bg` (#07070F): need contrast check in T-006-05.

## 7. Overlap with T-002-01

T-002-01 (design-tokens-and-figma) is open and in research phase — it covers the same ground for the mindmap canvas specifically. Recommendation: T-006-04 produces the full token set; T-002-01 should be closed or merged into T-006-04 to avoid parallel divergence.
