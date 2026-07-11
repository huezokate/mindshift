# T-030-05 native-features-store — Plan

Ordered, individually committable steps. Mobile gates: `npm run typecheck
&& npm run lint && npm test` (+ `storybook:stories` when stories change).
V200 gates: `npm run migrations:check` + `npx vitest run` for touched libs.
Branch `feat/storybook-clean` (Lisa owns merges).

## Step 1 — Native deps + config
`npx expo install expo-notifications expo-local-authentication expo-haptics
expo-sharing expo-media-library react-native-view-shot
expo-apple-authentication expo-dev-client`; app.json plugins + entitlement
+ infoPlist strings per structure.
**Verify:** typecheck; Expo Go still boots (Metro restart).
**Commit:** `feat(mobile): native module deps + config for T-030-05`

## Step 2 — Haptics
`lib/haptics.ts`; wire save-pop success (response), chat send tap.
**Commit:** `feat(mobile): haptic confirmations (T-030-05)`

## Step 3 — Quote card + native share sheet
`components/share/quote-card.tsx` (+3-mode story),
`components/share/share-sheet.tsx` (+story); swap response SHARE pill and
entry-detail Socials onto it; share logging parity (native/instagram/
tiktok/facebook/download; link = status only).
**Verify:** on-sim — open sheet, capture renders, OS share sheet appears,
Photos save path (permission prompt).
**Commit:** `feat(mobile): quote-card share sheet replaces text share (T-030-05)`

## Step 4 — Journal Face ID lock
`lib/journal-lock-logic.ts` (+tests: needsUnlock/unlocked/background
relock/pref parse), `lib/journal-lock.ts` hook,
`components/journal/lock-gate.tsx` (+story), wrap journal list / entry
detail / chat, Profile toggle (hardware-gated).
**Verify:** sim Features→Face ID→Enrolled; toggle on → gate prompts →
Matching Face unlocks; background → relock.
**Commit:** `feat(mobile): Face ID journal lock (T-030-05)`

## Step 5 — Sign in with Apple
Shared `onSSO(strategy)` in sign-in.tsx; Apple button above Google.
**Verify:** button renders; flow errors cleanly until K2 (Clerk dashboard).
**Commit:** `feat(mobile): Sign in with Apple via Clerk SSO (T-030-05)`

## Step 6 — Push client
`lib/push.ts` (+pure routing/pref tests), Profile "Weekly nudge" toggle
(graceful no-projectId/Expo Go state), `_layout` notification-tap router.
**Commit:** `feat(mobile): weekly-nudge push registration + tap routing (T-030-05)`

## Step 7 — Push backend (V200)
`supabase/migrations/009_push_tokens.sql` (NOT applied — K4),
`api/push/register` route, `lib/push-send.ts` (+chunk/prune tests),
sunday-reminder cron extension (pushSent/pushPruned counters).
**Verify:** `npm run migrations:check`; vitest; `npm run build` types.
**Commit:** `feat(api): push token registry + weekly nudge push channel (T-030-05)`

## Step 8 — Store submission package
`store-submission.md` artifact (runbook, privacy labels, age rating,
shot-list, review notes, disclaimer + crisis copy, K1–K4); Profile
crisis-resources note.
**Commit:** `docs(mobile): App Store submission package + in-app crisis note (T-030-05)`

## Step 9 — Verification sweep
Both workspaces green (typecheck/lint/tests); grep gates (no StoreKit/
RevenueCat; token-only styling); Expo Go on-sim pass over share sheet,
lock gate, profile toggles, Apple button; screenshots to scratchpad.
Document what needs the dev build (push e2e, Apple completion, TestFlight).
Fixes as `fix(mobile): … (T-030-05)`.

## Testing strategy summary
- Mobile unit: journal-lock state machine, push routing/pref parsing,
  share-platform action mapping (if extracted) — pure modules only.
- V200 unit: push-send chunking + DeviceNotRegistered pruning (mock fetch).
- Stories: QuoteCard ×3 modes, ShareSheet, LockGate.
- Live: Expo Go scope per design D10; dev-build items → K-checklist.

## Risks
- expo-notifications import may warn/throw in Expo Go (SDK 53+ removed
  remote push there) — all calls lazy + wrapped; Profile toggle shows the
  "needs a development build" state instead of crashing.
- view-shot on New Arch: supported ≥ v4; verify capture on-sim early
  (Step 3, before building the actions row on top).
- Apple SSO completes only after K2; treat Clerk error as expected-state.
- Any deviation recorded in progress.md before proceeding.
