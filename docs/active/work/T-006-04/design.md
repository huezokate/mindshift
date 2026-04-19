# T-006-04 Design: Complete Design Token System

## Decision: Single `:root` Block, All Tokens

All tokens live in one `:root` block with breakpoint overrides using `@media`. No JavaScript token switching — pure CSS. This is consistent with the no-build-step constraint.

## Complete Token Block

```css
/* ────────────────────────────────────────────
   MINDSHIFT DESIGN SYSTEM — v2.0
   Cyberpunk Shell × Kawaii Soul × Notepad Touch
   ──────────────────────────────────────────── */
:root {

  /* ── Surfaces ── */
  --bg:           #07070F;
  --bg-2:         #0D0D1C;
  --bg-3:         #121228;

  /* ── Cyberpunk Accents ── */
  --cyan:         #00FFC8;
  --cyan-dim:     rgba(0, 255, 200, 0.12);
  --cyan-glow:    0 0 16px rgba(0, 255, 200, 0.45);
  --pink:         #FF2D6B;
  --pink-dim:     rgba(255, 45, 107, 0.12);
  --pink-glow:    0 0 16px rgba(255, 45, 107, 0.45);

  /* ── Kawaii Extensions ── */
  --lavender:     #C8AEFF;
  --lavender-dim: rgba(200, 174, 255, 0.12);
  --lavender-glow:0 0 16px rgba(200, 174, 255, 0.4);
  --peach:        #FFB36E;
  --mint:         #AEFFEA;
  --star-gold:    #FFE87C;

  /* ── Text ── */
  --white:        #E8E8FF;
  --white-2:      #A0A0CC;
  --white-3:      #6565A8;   /* FIXED from #505077 — now passes 4.5:1 */

  /* ── Borders ── */
  --border:       rgba(0, 255, 200, 0.35);   /* STRENGTHENED from 0.25 */
  --border-2:     rgba(0, 255, 200, 0.14);   /* STRENGTHENED from 0.08 */

  /* ── Category Node Colors ── */
  --cat-career:       #00FFC8;   /* cyan */
  --cat-creativity:   #C8AEFF;   /* lavender */
  --cat-health:       #AEFFEA;   /* mint */
  --cat-relationships:#FF2D6B;   /* pink */
  --cat-travel:       #FFE87C;   /* star-gold */
  --cat-finances:     #A0A0CC;   /* white-2 */
  --cat-scandinavia:  #6BC8FF;   /* ice-blue */

  /* ── Typography ── */
  --font-mono:        'Courier New', 'Lucida Console', monospace;
  --font-sans:        -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-kawaii:      'Nunito', 'Segoe UI', system-ui, sans-serif;
  --font-handwritten: 'Caveat', 'Comic Sans MS', cursive;

  /* ── Type Scale (fluid) ── */
  --text-2xs: clamp(9px,  0.5vw + 7px,  10px);
  --text-xs:  clamp(10px, 0.5vw + 8px,  12px);
  --text-sm:  clamp(11px, 0.6vw + 9px,  13px);
  --text-base:clamp(12px, 0.7vw + 9px,  15px);
  --text-md:  clamp(13px, 0.8vw + 10px, 16px);
  --text-lg:  clamp(14px, 1vw  + 10px,  18px);
  --text-xl:  clamp(16px, 1.2vw + 11px, 20px);
  --text-2xl: clamp(20px, 1.5vw + 12px, 26px);
  --text-3xl: clamp(24px, 2vw  + 14px,  40px);

  /* ── Spacing Scale (8px grid) ── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-7:  28px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* ── Border Radius ── */
  --radius-sharp:  2px;      /* cyberpunk — nav tabs, pills base */
  --radius-soft:   8px;      /* kawaii moments — guide bubble, soft cards */
  --radius-kawaii: 16px;     /* speech bubble, celebration card */
  --radius-full:   9999px;   /* portrait circles, pill badges */

  /* ── Animation ── */
  --dur-fast:      150ms;
  --dur-base:      200ms;
  --dur-kawaii:    350ms;
  --dur-ink:       250ms;
  --dur-char:      30ms;
  --dur-celebrate: 600ms;

  --ease-system:   linear;
  --ease-base:     ease-out;
  --ease-kawaii:   cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Responsive ── */
  --app-max-width:    390px;
  --content-padding:  var(--space-5);  /* 20px */
  --section-gap:      var(--space-7);  /* 28px */
  --sidebar-width:    0px;

  /* ── Notepad ── */
  --notepad-lines: repeating-linear-gradient(
    transparent,
    transparent 27px,
    rgba(0, 255, 200, 0.06) 27px,
    rgba(0, 255, 200, 0.06) 28px
  );
}

/* Tablet breakpoint */
@media (min-width: 768px) {
  :root {
    --app-max-width:    640px;
    --content-padding:  var(--space-7);  /* 28px */
  }
}

/* Desktop breakpoint */
@media (min-width: 1024px) {
  :root {
    --app-max-width:    1280px;
    --content-padding:  var(--space-10); /* 40px */
    --sidebar-width:    360px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Token Naming Convention

Format: `--{category}-{variant}` where:
- `category` = surface / bg / text / border / cat / font / text / space / radius / dur / ease / notepad
- `variant` = numbered (1-12 for scale) or descriptive (sharp / soft / kawaii)

No camelCase — all kebab-case. No semantic naming like `--primary-color` — too abstract. Descriptive + specific.

## Migration from Current Tokens

Replace in CSS:
| Old | New |
|-----|-----|
| (no px tokens) | All hardcoded spacing → var(--space-N) |
| (no type tokens) | All hardcoded font-size → var(--text-N) |
| `#505077` | `var(--white-3)` (updated value) |
| `rgba(0,255,200,0.25)` | `var(--border)` (updated value) |
| `rgba(0,255,200,0.08)` | `var(--border-2)` (updated value) |
| `transition: all 0.2s` | `transition: [property] var(--dur-base) var(--ease-base)` |
