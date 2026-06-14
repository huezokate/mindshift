# Research — T-005-01: trim-figures-to-9

## Location

`mindshift.html` — single-file app, all logic inline.

## FIGURES Array

Lines 2100–2111. Ten entries:

1. Dolly Parton — Resilience & joy — #f59e0b
2. Socrates — Question everything — #60a5fa
3. Abraham Lincoln — Persist through failure — #d97706
4. Maya Angelou — Strength & voice — #c084fc
5. Marcus Aurelius — Stoic clarity — #94a3b8
6. Marie Curie — Break every barrier — #34d399
7. Nelson Mandela — Long-game & forgiveness — #fb923c
8. Frida Kahlo — Pain into power — #f43f5e
9. Steve Jobs — Vision & disruption — #818cf8
10. **Oprah Winfrey** — Vulnerability & reinvention — #fb7185 ← REMOVE

## Consumers of FIGURES

- `renderFigureCards()` — iterates FIGURES, creates figure-card divs, appends to #figureGrid
- `ventToFigure(fig, cardEl)` — receives a fig object, uses fig.name, fig.icon, fig.quote, fig.accentColor, fig.loadingLines
- No other references to specific FIGURES entries by index

## Grid Layout

`.figure-grid` uses CSS Grid. No hardcoded column count tied to 10 items — layout is auto-fill. Removing one entry will simply reflow the grid naturally.

## Constraints

- Oprah is the last entry (index 9) — a clean tail removal
- The change is a single line deletion
- No downstream code references Oprah by name or index
