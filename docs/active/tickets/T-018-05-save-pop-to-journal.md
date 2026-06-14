---
id: T-018-05
story: S-018
title: save-pop-animate-to-journal
type: task
status: open
priority: medium
phase: done
depends_on: []
---

## Context
Flow correction #9 (FigJam 95:2236): when the user taps Save on a response, it
should pop-animate and then navigate to that newly-saved entry in the journal
(the detail page /app/journal-v2/[id]).

**Save logic by tier (Kate, 2026-06-14):**
- **Anonymous (no account)** → explicit **Save** button. Tap → pop → journal.
- **Signed-in (free/basic account)** → vents **save automatically** with all
  applied lenses (no Save button for now); entry just appears in the journal.

## Acceptance Criteria
- Anon: Save button triggers a brief pop animation, then routes to the saved
  entry's detail. Signed-in: auto-save (no button); entry lands in the journal.
- tsc clean; QA in 3 themes.
