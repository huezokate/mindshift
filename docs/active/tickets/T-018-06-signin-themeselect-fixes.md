---
id: T-018-06
story: S-018
title: signin-and-theme-select-fixes
type: task
status: open
priority: medium
phase: done
depends_on: [T-018-01]
---

## Context
Flow corrections #1 + #4 (FigJam 95:2150, 95:2186) on the entry screens:
- Theme-select: button fill → cyberpunk black; make the UI-picker arrows massive
  (circles, ~40px — same component as the lens picker); fix the checkmark that
  looks auto-tapped; give log-in equal focus.
- Make sign-up more visible for users with no account; show the user's name when
  signed in.

## Acceptance Criteria
- Theme-select arrows match the shared circular component; checkmark unticked by
  default; solid button fill; log-in prominent.
- Sign-up prominent for anon; name shown when authed; get_design_context; tsc clean.
