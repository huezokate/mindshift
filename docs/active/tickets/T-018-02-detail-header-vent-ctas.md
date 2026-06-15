---
id: T-018-02
story: S-018
title: detail-header-and-vent-ctas
type: task
status: open
priority: high
phase: done
depends_on: [T-018-01]
---

## Context
Apply the remaining journal-edit affordances from Figma `469:4431`:
- Put the shared `<AppHeader/>` bar on the entry **detail** page (EntryDetail),
  replacing its placeholder medallion header.
- Add the **"+ Lens"** button on the detail vent card (Figma 602:6511) → opens
  the lens picker for that entry.
- Add the **"Vent it out"** CTA at the bottom of the feed (Figma 606:7872) →
  routes to /app/onboarding.

## Acceptance Criteria
- Detail page shows AppHeader; "+ Lens" and "Vent it out" present and wired.
- Pull get_design_context for each node; token-driven; tsc clean; QA in 3 themes.
