---
id: T-018-01
story: S-018
title: material-symbols-icon-system
type: task
status: open
priority: high
phase: ready
depends_on: []
---

## Context
Kate sources ALL icons from Google Material Symbols (Sharp) — never custom SVGs.
The Material Symbols Sharp stylesheet is already linked in `src/app/layout.tsx`.
Add the `.material-symbols-sharp` base CSS (globals.css) and a reusable
`<Icon name size fill weight grade opsz />` component, then replace every
hand-rolled icon SVG across the journal/nav/onboarding/lens/response components
with the correct Material symbol (e.g. camera, psychology, article, tab_group,
add, ios_share, comic_bubble, palette, release_alert, auto_stories, lock, public).

## Acceptance Criteria
- `<Icon>` renders Material Symbols Sharp; size/fill/weight props work; currentColor.
- No remaining custom icon `<svg>` paths in journal/nav components.
- Icons match the Figma names; visual parity across all 3 themes; tsc clean.
