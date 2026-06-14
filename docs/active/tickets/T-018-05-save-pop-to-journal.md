---
id: T-018-05
story: S-018
title: save-pop-animate-to-journal
type: task
status: open
priority: medium
phase: ready
depends_on: []
---

## Context
Flow correction #9 (FigJam 95:2236): when the user taps Save on a response, it
should pop-animate and then navigate to that newly-saved entry in the journal
(the detail page /app/journal-v2/[id]).

## Acceptance Criteria
- Save triggers a brief pop animation, then routes to the saved entry's detail.
- Works for anon→saved and signed-in flows; tsc clean; QA in 3 themes.
