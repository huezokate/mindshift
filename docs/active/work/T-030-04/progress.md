# T-030-04 rn-screen-port — Progress

Branch `feat/storybook-clean`. One commit per plan step. Gates green at every
step: `npm run typecheck`, `npm run lint`, `npm test` (now 97 tests / 21
files), stories regenerated where added.

## Completed

- **Step 1 — funnel data layer** (`feat(mobile): funnel data layer…`):
  `lib/figures.ts` (15 figures, metadata only — D6; `portraitUrl` → backend
  assets — D5) + test; `lib/anon-limits-logic.ts` (web rule table) + test;
  `lib/anon-limits.ts` (SecureStore blob `ms_anon_limits`); `lib/use-api.ts`
  (Clerk Bearer wrapper — D3); `lib/vent-label.ts` + test;
  `state/vent-flow.tsx` (in-memory funnel context — D1), mounted in _layout.
- **Step 2 — onboarding** (`feat(mobile): onboarding vent screen`): real
  screen — HeadingCard, VentInput (800 cap), ≥20-char gate, startVent →
  /lens, mindmap CTA, EntryAuthRow, Reanimated entrances.
- **Step 3 — lens** (`feat(mobile): lens grid + picker sheet…`):
  `figure-portrait.tsx` (expo-image over LensAvatar fallback),
  `lens-picker-sheet.tsx` (wrap-around carousel, fixed-height text block via
  onLayout max-height) + story, `limit-card.tsx` + story; real `lens.tsx`
  (vent preview chrome, anon gate, 429→LimitCard, genError card, grid).
- **Step 4 — response** (`feat(mobile): response screen…`):
  `typewriter-logic.ts`/`use-typewriter.ts` (18ms/char, reduce-motion skip)
  + test; `color.ts` (withAlpha pill tints) + test; real `response.tsx` —
  vent + lens cards, caret, action pills (kawaii family-mapped like web),
  signed-in silent auto-save + save-pop, anon Save → sign-in
  (reason=save&redirect=/response), native text share + share log (D8).
- **Step 5 — journal store + list** (`feat(mobile): journal store + list…`):
  `journal-map.ts` (the ONLY place API JSON is known; title fallback) + test;
  `state/journal-store.tsx` (paging via entries.length, counts, seed,
  fetchEntry paged fallback — D4, applyLensToEntry port of web add-lens.ts,
  favorite/share/delete, user-switch cache reset); real journal tab
  (FlatList + onEndReached + RefreshControl, filter tabs, WelcomeCard/seed,
  add-lens picker, anon AuthBanner gate).
- **Step 6 — entry detail** (`feat(mobile): journal entry detail`): title/vent
  card, snap carousel + page dots, StackButton row (Chat · Decorate+
  UpcomingChip · Socials), + Lens picker with optimistic upsert.
  **Deviation:** `applyLensToEntry` signature changed from (entryId,…) to
  (entry,…) so deep-linked (uncached) detail copies work — plan assumed
  cache-only.
- **Step 7 — chat** (`feat(mobile): chat with the lens…`): `chat-logic.ts`
  pure reducer (optimistic send/rollback, done≠locked) + 7 tests;
  ChatThread/SoftCloseDivider/ChatComposer + 6-state story; real chat screen
  (signed-in gate, history GET, arc states, KeyboardAvoiding).
- **Step 8 — mindmap** (`feat(mobile): mindmap landing + browse…`):
  `use-mindmaps.ts` (GET maps, null-while-loading); landing tab (hasMap
  branch, anon gate); browse (MindmapAreaCard per goal + done/total line);
  `web-only-stub.tsx` for new/map/reflect (D7 — honest web-only copy).
- **Step 9 — home/profile/theme-select** (`feat(mobile): home hub…`):
  ActionCard + story; home hub (welcome + 3 cards + counts via AppHeader);
  themed profile (account/plan/theme cards, has({plan}) pro check, sign-out);
  theme-select gained the ephemeral disclaimer ack + Enter CTA (D13);
  index.tsx anon → /theme-select.
- **Step 10 — auth + hex retirement** (`feat(mobile): themed auth…`):
  `auth/auth-shell.tsx` (AuthShell/AuthInput/AuthError + parseAuthReason
  normalizing the web's `lenses_limit` spelling); sign-in/up rebuilt on DS +
  AuthBanner + `?redirect=` honoring (anon Save returns to /response);
  themed (tabs)/(auth) navigator chrome; DELETED auth-form.tsx,
  placeholder-screen.tsx, nav-link.tsx, foundation-check.tsx.
  Grep gates pass: no web-only APIs outside comments; no hardcoded hex left
  in app/components (generated SVG/path modules + fixtures excepted).

## Deviations from plan (all documented rationale)

1. `applyLensToEntry` signature (Step 6 above).
2. Typewriter pure logic split into `typewriter-logic.ts` (vitest can't
   import react-native-reanimated; hook stays in `use-typewriter.ts`).
3. Journal paging offset derives from `entries.length` instead of a ref
   (lint: no ref access during render after the user-switch reset moved to
   render-time sync).
4. Added `lib/color.ts` (withAlpha) — RN has no color-mix(); needed for the
   response action pills.
5. **Mid-session external edit observed:** an untracked
   `src/components/ui/text-field.tsx` appeared (16:39) and disappeared
   (16:41) during Step 10 — evidence of a concurrent Lisa thread touching
   auth-input territory. Nothing in this ticket references it; if it
   reappears, reconcile with `auth/auth-shell.tsx`'s AuthInput.

## Remaining

- Step 11 — live verification on simulator against the local backend
  (see review.md for what was and wasn't verifiable this session).
