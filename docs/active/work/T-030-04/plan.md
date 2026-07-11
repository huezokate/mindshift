# T-030-04 rn-screen-port — Plan

Ordered, individually committable steps. Every step ends green on
`npm run typecheck && npm run lint && npm test` (in `mobile/`); steps that
add stories also regen `npm run storybook:stories`. Branch:
`feat/storybook-clean` (current working branch; Lisa owns merges).

## Step 1 — Data/state substrate
Create `lib/figures.ts` (+test: 15 ids, portraitUrl shape), 
`lib/anon-limits-logic.ts` (+test: web rule table — new day reset, new-vent
same day → 'vents', 4th lens → 'lenses', tracking transitions),
`lib/anon-limits.ts`, `lib/use-api.ts`, `lib/vent-label.ts` (+test),
`state/vent-flow.tsx`; mount `VentFlowProvider` in `_layout.tsx`.
**Verify:** unit tests; app still boots (typecheck is the proxy).
**Commit:** `feat(mobile): funnel data layer — figures, anon limits, useApi, vent-flow (T-030-04)`

## Step 2 — Onboarding screen
Real `onboarding.tsx` per structure. Reuses VentInput/HeadingCard/Button/
EntryAuthRow.
**Verify:** typecheck/lint; on-sim later (Step 11).
**Commit:** `feat(mobile): onboarding vent screen (T-030-04)`

## Step 3 — Lens screen + picker composite
`components/journal/lens-picker-sheet.tsx` (+story), 
`components/journal/limit-card.tsx` (+story), real `lens.tsx` wiring
anon-limits → generate-response → vent-flow → response. 429 handling maps
`limitType` → LimitCard.
**Commit:** `feat(mobile): lens grid + picker sheet + generate wiring (T-030-04)`

## Step 4 — Response screen
`lib/use-typewriter.ts` (+pure step test), real `response.tsx`: typewriter,
action pills, signed-in auto-save (save-response → sessionId), anon save →
sign-in reason=save, native text share + share log, NEW LENS loop.
**Commit:** `feat(mobile): response screen — typewriter, auto-save, share (T-030-04)`

## Step 5 — Journal store + list
`lib/journal-map.ts` (+test: API session fixture → Lite types, title
fallback), `state/journal-store.tsx` (mounted in `_layout`), real
`(tabs)/journal.tsx` (FlatList paging, filters, WelcomeCard/seed, add-lens,
anon AuthBanner state).
**Commit:** `feat(mobile): journal store + list screen (T-030-04)`

## Step 6 — Entry detail
Real `journal/[id]/index.tsx`: getEntry cache/fallback, lens snap-carousel +
dots, add-lens, chat/decorate/socials rows.
**Commit:** `feat(mobile): journal entry detail (T-030-04)`

## Step 7 — Chat
`lib/chat-logic.ts` (+test: optimistic append/rollback, done/locked
transitions, turn_index math), `components/chat/chat-thread.tsx` +
`chat-composer.tsx` (+story with canned states incl. wind-down + capped),
real `journal/[id]/chat/[figureId].tsx`.
**Commit:** `feat(mobile): chat with the lens — thread, composer, arc states (T-030-04)`

## Step 8 — Mindmap landing + browse
`lib/use-mindmaps.ts`, real `(tabs)/mindmap.tsx` + `mindmap/browse.tsx`;
`new`/`map`/`reflect` restyled token stubs.
**Commit:** `feat(mobile): mindmap landing + browse area cards (T-030-04)`

## Step 9 — Home hub, profile, theme-select disclaimer
`components/home/action-card.tsx` (+story), real `(tabs)/home.tsx` (AppHeader
counts wired), themed `(tabs)/profile.tsx`, `theme-select.tsx` disclaimer +
Enter CTA, `index.tsx` anon → theme-select.
**Commit:** `feat(mobile): home hub, profile, theme-select entry (T-030-04)`

## Step 10 — Auth rebuild + hex retirement
Rebuild `(auth)/sign-in|sign-up` on DS + AuthBanner(reason param); theme
`(tabs)/_layout` tab bar; delete `auth-form.tsx`, retire
`foundation-check`/`nav-link` per structure. Grep gate: no web-only APIs, no
stray hex outside Storybook diagnostics.
**Commit:** `feat(mobile): themed auth + retire Phase-0 chrome (T-030-04)`

## Step 11 — Live verification + fixes
Run V200 backend (`npm run dev`) + iOS simulator (`npm run ios`). Walk the
AC script:
1. Anon: theme-select (ack) → vent → lens (portrait loads) → response
   typewriter → 4th lens blocked by LimitCard → SAVE → sign-in gate.
2. Signed-in: vent → lens → response auto-saves → journal shows entry →
   detail → add lens → chat: seed bubbles, turn replies, wind-down ≥3,
   (cap state via story, not 20 live turns) → favorite/share log.
3. Journal paging (seed demo), filters, pull-to-refresh.
4. Mindmap landing/browse against saved map (create one on web if none).
5. Profile, sign-out, tab theming across all 3 modes.
Record screenshots to the session scratchpad; fix what breaks.
**Commit:** fixes as `fix(mobile): … (T-030-04)`

## Testing strategy summary
- **Unit (vitest):** anon-limits rules, vent-label, journal-map, chat-logic,
  typewriter step, figures/portraitUrl — the port's behavioral logic.
- **Stories:** every new presentational composite (picker, limit card, chat
  states, action card) — the visual rig, 3 modes via existing decorator.
- **Live:** Step 11 script = the AC. No RNTL (per design D16).
- **Regression:** existing 57 tests + CSS-fidelity gate must stay green.

## Risks / adjustments protocol
- Portraits 404 in dev if V200 isn't running — acceptable (placeholder
  renders); note in review.
- `applyLensToEntry` port needs web `lib/add-lens.ts` re-read at impl time
  (two sequential API calls; keep order + error copy).
- Any plan deviation is recorded in progress.md before proceeding.
