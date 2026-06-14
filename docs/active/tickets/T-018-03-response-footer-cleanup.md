---
id: T-018-03
story: S-018
title: response-screen-footer-cleanup
type: task
status: open
priority: high
phase: ready
depends_on: [T-018-01]
---

## Context
Flow correction #8 (FigJam 95:2228): on the response screen, remove the bottom
footer action bar (we use the header dropdown now), remove the central container
with the camera icon + "MindShift" wordmark, and fix the lens-adjacent buttons
so they match the Figma lens-card button row.

## Acceptance Criteria
- Response screen has no bottom footer / central camera-mindshift container.
- Lens-adjacent buttons match Figma (get_design_context); tokens only; tsc clean.
