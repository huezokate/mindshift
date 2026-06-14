---
id: S-018
title: mindshift-journal-flow-corrections
status: in-progress
priority: high
---

## Story

MindShift is a perspective-shifting app (vent → pick a historical-figure lens →
AI response), three themes (cyberpunk/kawaii/notepad). This story delivers the
journal + app-flow corrections from Kate's Figma review boards:

- Journal screen edits — Figma `469:4431` (top header bar, "Vent it out" CTA,
  "+Lens" button, dropdown nav).
- App-flow corrections — FigJam `95:2261` (11 notes across sign-in → vent →
  lens picker → response → save → journal).

## Already shipped (not ticketed)
- Journal v2 feed + entry detail rebuilt to Figma; real notepad portraits;
  theme-switch fix; comp allowlist for test@minds-shift.com.
- App-wide top nav (AppHeader bar + dropdown) built and wired to the feed.
- Quick wins: removed CRT/scanline; fixed iOS input-zoom; mindmap banner → CTA;
  circular lens arrows. Removed the journal bottom FooterNav.

## Goals
- Single icon source: Google Material Symbols (Sharp) everywhere — no custom SVGs.
- Finish the journal-edit affordances (detail header, Vent-it-out, +Lens).
- Apply the remaining flow corrections (response footer, lens picker, save flow,
  sign-in / theme-select).
- Gemini-generated entry titles (deferred to the backend step).

## Source of truth
Figma `Mubv0Ghdm2SPxF42JVsX8M` (design) + `we0ZAnIHjmoKrlN82tJoB0` (FigJam).
Always pull `get_design_context`; match Figma exactly; tokens only, no hex.
