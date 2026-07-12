# T-030-05 native-features-store — Progress

Implementation tracking against plan.md. All nine steps complete.
Branch `feat/storybook-clean`. Totals for steps 1–8: 29 files,
+1864 / −62 lines across 8 commits (`5deb06a..574e15d`).

## Step 1 — Native deps + config ✅ `5deb06a`

Installed via `npx expo install` (SDK-pinned): expo-notifications,
expo-local-authentication, expo-haptics, expo-sharing, expo-media-library,
react-native-view-shot, expo-apple-authentication, expo-dev-client.
app.json: plugins added (local-auth with faceIDPermission string,
media-library with savePhotosPermission, notifications,
apple-authentication), `ios.usesAppleSignIn: true`,
`NSPhotoLibraryAddUsageDescription` in infoPlist. `extra.eas.projectId`
NOT authored (K1 — needs `eas init` on Kate's account).
Verified: typecheck green; Expo Go boots after Metro restart.

## Step 2 — Haptics ✅ `0dd904d`

`src/lib/haptics.ts` — `tapLight()` / `notifySuccess()`, expo-haptics
wrapped in try/catch no-ops (D9). Wired: save-pop success on response
screen, light tap on chat send.

## Step 3 — Quote card + native share sheet ✅ `0ae89bb`

- `components/share/quote-card.tsx` — token-only 4:5 card (wordmark,
  figure name/era, quote, clamped response, optional vent block) + story
  covering all 3 theme modes.
- `components/share/share-sheet.tsx` — Sheet + live QuoteCard preview in
  a ViewShot ref, "Include what I wrote" toggle, web-parity action row
  (Share / Instagram / TikTok / Facebook / Copy link / Download), status
  line, `logShare(platform)` via useApi when responseId present. + story.
- Callsite swaps: response SHARE pill and entry-detail "Socials" now open
  ShareSheet (replacing `Share.share` text paths).
Verified on-sim (per plan step verify): sheet opens, capture renders,
OS share sheet appears, Photos save prompts add-only permission.

## Step 4 — Journal Face ID lock ✅ `8749e41`

- `lib/journal-lock-logic.ts` — pure session state machine; 6 unit tests
  (needsUnlock / unlocked / background relock / pref parsing).
- `lib/journal-lock.ts` — `useJournalLock()` hook: SecureStore pref
  `ms_journal_lock`, module-level session flag, AppState background
  re-lock, `LocalAuthentication.authenticateAsync` prompt.
- `components/journal/lock-gate.tsx` + story (visual states via prop).
- Wrapped: journal tab list, entry detail, chat screen. Profile toggle
  shown only when `hasHardwareAsync && isEnrolledAsync` (D8).
Verified on-sim with Features → Face ID → Enrolled: gate prompts,
Matching Face unlocks, backgrounding re-locks.

## Step 5 — Sign in with Apple ✅ `eb68263`

sign-in.tsx: Google-only callback generalized to `onSSO(strategy)`;
"Continue with Apple" button above Google using
`startSSOFlow({strategy: 'oauth_apple'})` (D7). Flow errors cleanly
until K2 (Apple connection enabled in Clerk dashboard) — expected state.

## Step 6 — Push client ✅ `1efb3ff`

- `lib/push-logic.ts` — pure `routeFromNotification(data)` + pref
  parsing; unit-tested (default route `/(tabs)/mindmap`).
- `lib/push.ts` — `registerForWeeklyNudge` (permission →
  `getExpoPushTokenAsync({projectId})` → POST /api/push/register),
  `unregister` (DELETE), SecureStore pref `ms_push_enabled`. All native
  calls lazy + wrapped; missing projectId / Expo Go surfaces the
  "needs a development build" state instead of crashing (plan risk #1).
- Profile "Weekly nudge" toggle; `_layout.tsx` notification-response
  listener routes taps through `routeFromNotification`.

## Step 7 — Push backend (V200) ✅ `34b289c`

- `supabase/migrations/009_push_tokens.sql` — token-PK table + RLS
  enabled, no anon policies (D1). Authored only; **NOT applied** (K4,
  gated process). `migrations:check`: 9 contiguous ✅.
- `api/push/register/route.ts` — auth()-gated POST upsert (ownership
  transfer on token PK) / DELETE scoped to caller.
- `lib/push-send.ts` — plain-fetch exp.host sender, 100-message chunks,
  `pruneFromTickets` deletes DeviceNotRegistered tokens; unit-tested with
  mocked fetch (`__tests__/push-send.test.ts`).
- sunday-reminder cron: send step extended with per-device push
  ("Your week N plan is ready" + first goal line, data
  `{url: '/(tabs)/mindmap'}`); failures logged, never block email;
  `pushSent` / `pushPruned` counters in the JSON summary (D2).

## Step 8 — Store submission package ✅ `574e15d`

`store-submission.md` artifact: EAS runbook (dev → preview → production →
submit), listing copy, App Privacy labels, age rating, screenshot
shot-list, review notes (demo account, anon-flow explanation, 3.1.1
watch-item), disclaimer + crisis copy, K1–K4 checklist. In-app
crisis-resources note added to Profile (D11).

## Step 9 — Verification sweep ✅ (this session, no code changes needed)

- mobile: `typecheck` ✅ · `lint` ✅ (0 problems) · `vitest` 101 tests /
  21 files ✅ · `storybook:stories` regenerates ✅.
- V200: `migrations:check` ✅ · `vitest` 46 tests / 5 files ✅ ·
  `tsc --noEmit` ✅ · `lint` 0 errors (13 warnings, all pre-existing
  files untouched by this ticket).
- Grep gates: no `storekit|revenuecat|react-native-purchases` anywhere in
  mobile/ or V200/src (D12) ✅; no hardcoded hex colors in the new
  share/lock/push/haptics modules (token-only) ✅.
- Boot smoke: Expo Go on booted iPhone 16 sim (iOS 18.5) — app loads to
  theme-select entry, all three theme chips + disclaimer gate render,
  no crash from the new native module imports. Screenshot in session
  scratchpad (`boot-smoke.png`).
- Working tree clean in mobile/ and V200/ — no uncommitted code.

## Deviations from plan

- None of substance. `push-logic.ts` was split out of `push.ts` for pure
  imports exactly as structure.md anticipated ("split if imports demand
  it"). Share-platform action mapping stayed inline in share-sheet.tsx
  (plan marked its extraction/test as conditional — "if extracted").

## Remains (out of session scope, by design — K-items)

K1 `eas init` + first dev build · K2 enable Apple in Clerk · K3 Apple
Developer enrollment + TestFlight/submit · K4 apply migration 009 at PR
release. Push e2e and Apple SSO completion verify on the dev build
(D10/D13), per store-submission.md section 5.
