---
id: T-018-04
story: S-018
title: lens-picker-popup-polish
type: task
status: open
priority: medium
phase: done
depends_on: [T-018-01]
---

## Context
Flow corrections #6 + #7 (FigJam 95:2218, 95:2223): the lens-picker arrows
should live inside the popup and match the screen-1 circular arrow component;
verify the lens card uses the real Figma components (not look-alike frames).

## Acceptance Criteria
- Lens-picker arrows = the shared circular arrow component, inside the popup.
- Lens card audited against get_design_context; discrepancies fixed; tsc clean.
