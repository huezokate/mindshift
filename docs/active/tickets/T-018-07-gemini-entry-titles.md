---
id: T-018-07
story: S-018
title: gemini-entry-titles
type: task
status: open
priority: low
phase: done
depends_on: []
---

## Context
Flow correction #11 (FigJam 95:2256): entry headers should be Gemini-generated
summaries of the vent in the form "Contemplating/Ruminating/Thinking about XYZ"
(min words). DEFERRED to the backend step — needs a Gemini API route + a title
column on vent_sessions. Until then, the feed/detail derive a first-words title.

## Acceptance Criteria
- Gemini route returns a short "<synonym> on <topic>" title for a vent.
- Title persisted and shown on feed cards + detail header; graceful fallback.
