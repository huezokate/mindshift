# T-030-05 native-features-store — Structure

File-level blueprint. Two workspaces this time: `mobile/` (client) and
`V200/` (the deliberately-minimal push backend, per design D1–D3).

## mobile/ — new dependencies (package.json)

`expo-notifications`, `expo-local-authentication`, `expo-haptics`,
`expo-sharing`, `expo-media-library`, `react-native-view-shot`,
`expo-apple-authentication` (entitlement-bearing module; button deferred
D7 but the plugin/entitlement land now), `expo-dev-client` (D10).
All installed with `npx expo install` (SDK-pinned versions).

## mobile/ — config

- `app.json`: plugins gain `expo-notifications`,
  `["expo-local-authentication", {faceIDPermission: …}]`,
  `["expo-media-library", {savePhotosPermission: …, isAccessMediaLocationEnabled: false}]`,
  `expo-apple-authentication`; `ios.usesAppleSignIn: true`;
  `ios.infoPlist.NSPhotoLibraryAddUsageDescription` (belt-and-braces with
  the plugin). NOTE: `extra.eas.projectId` is K1 (eas init) — not authored.

## mobile/ — new modules

- `src/lib/haptics.ts` — `tapLight()`, `notifySuccess()`; expo-haptics
  wrapped in try/catch no-ops (D9).
- `src/lib/journal-lock-logic.ts` — PURE session state machine:
  `LockState {enabled, unlockedThisSession}`; `needsUnlock(state)`,
  `unlocked(state)`, `relockOnBackground(state)`, `parseLockPref(raw)`.
  Unit-tested.
- `src/lib/journal-lock.ts` — SecureStore pref (`ms_journal_lock`) +
  `useJournalLock()` hook: exposes `{enabled, locked, setEnabled,
  requestUnlock()}`; owns the module-level session flag +
  AppState background re-lock; calls
  `LocalAuthentication.authenticateAsync({promptMessage})`.
- `src/components/journal/lock-gate.tsx` — wraps children; when
  `useJournalLock().locked` renders a themed lock card (icon + "Unlock
  your journal" Button → requestUnlock) instead of children. + story
  (visual states only; auth mocked by prop on the View variant).
- `src/lib/push.ts` — `registerForWeeklyNudge(api)`: permission request →
  `getExpoPushTokenAsync({projectId})` → `POST /api/push/register`;
  `unregister(api)` → DELETE; `getPushPref/savePushPref`
  (`ms_push_enabled` SecureStore); `routeFromNotification(data)` PURE
  (payload `{url}` → router path, default `/(tabs)/mindmap`). Pure part
  unit-tested (`push-logic.ts` split if imports demand it).
- `src/components/share/quote-card.tsx` — presentational 4:5 card from
  tokens: wordmark, figure name/era, quote, response (clamped), optional
  vent block (`includeVent`), theme-branded chrome. Fixed logical size
  (e.g. 324×405) scaled at capture to 1080×1350. + story (3 modes).
- `src/components/share/share-sheet.tsx` — the composite (D5/D6):
  `Sheet` (bottom/fcard) + captured-preview area (the QuoteCard itself,
  wrapped in a `ViewShot` ref) + "Include what I wrote" checkbox row +
  actions row (Share / Instagram / TikTok / Facebook / Copy link /
  Download — icon-only DS Buttons + SocialIcon, exactly the web row) +
  status line. Props mirror web: `{open, responseId?, figureId,
  responseText, ventText, onClose, onShared}`. Internally: capture on
  demand → `Sharing.shareAsync` / `MediaLibrary.saveToLibraryAsync` /
  `Linking.openURL`; `logShare(platform)` via `useApi` when responseId.
  + story.

## mobile/ — modified

- `src/app/response.tsx` — SHARE pill opens `ShareSheet` (replaces
  `Share.share` text path); `notifySuccess()` on save-pop.
- `src/app/journal/[id]/index.tsx` — "Socials" opens `ShareSheet` for the
  active lens (replaces `Share.share`); screen body wrapped in `LockGate`.
- `src/app/(tabs)/journal.tsx` — signed-in list wrapped in `LockGate`.
- `src/app/journal/[id]/chat/[figureId].tsx` — wrapped in `LockGate`;
  `tapLight()` on send.
- `src/app/(tabs)/profile.tsx` — new cards: **Weekly nudge** toggle
  (push, D4 — registers/unregisters, shows "needs a development build"
  state when projectId/module is missing), **Journal lock** toggle
  (hardware-gated, D8), **Crisis resources** note (D11 copy).
- `src/app/(auth)/sign-in.tsx` — "Continue with Apple" Button above
  Google via `startSSOFlow({strategy:'oauth_apple'})` (D7); shared
  `onSSO(strategy)` helper replaces the Google-only callback.
- `src/app/_layout.tsx` — notification response listener → router
  (`routeFromNotification`), mounted once inside the nav shell.

## V200/ — new (the minimal push backend)

- `supabase/migrations/009_push_tokens.sql` — table per D1 + RLS enable
  (no anon policies), `updated_at` default now(). Validated by
  `npm run migrations:check`; **NOT applied** (K4, gated process).
- `src/app/api/push/register/route.ts` — POST `{token, platform?}` upsert
  keyed on token (ownership transfer on user change); DELETE `{token}`
  scoped to the caller's user_id; both `auth()`-gated JSON 401.
- `src/lib/push-send.ts` — `sendExpoPush(messages)` → exp.host, 100-chunk;
  returns per-token tickets; `pruneFromTickets(db, tickets)` deletes
  `DeviceNotRegistered` tokens. No SDK — plain fetch. Unit-tested with
  mocked fetch (`src/lib/__tests__/push-send.test.ts`).

## V200/ — modified

- `src/app/api/cron/sunday-reminder/route.ts` — step 5 additionally loads
  `push_tokens` for the digest users and sends one push per user-device:
  title "Your week N plan is ready", body = first weekly goal line, data
  `{url: '/(tabs)/mindmap'}`; failures logged, never block email; counters
  `pushSent`/`pushPruned` added to the JSON summary.

## docs

- `docs/active/work/T-030-05/store-submission.md` — D11 package: EAS
  runbook (init → dev build → preview → production → `eas submit`),
  privacy labels, age rating, screenshot shot-list, review notes (demo
  account + anon-flow explanation + 3.1.1 note), disclaimer + crisis copy,
  K1–K4 checklist.

## Boundaries / invariants

- Mobile screens keep calling the backend ONLY through `useApi`/stores;
  ShareSheet takes `responseId` optional exactly like web (pre-save shares
  don't log).
- `push-send.ts` is the only V200 module that knows Expo's push API;
  the cron knows only `sendExpoPush`.
- No StoreKit/RevenueCat imports anywhere (D12 grep gate).
- Token-only styling for all new UI; stories for every new presentational
  component (QuoteCard, ShareSheet, LockGate).

## Ordering

1. Deps + app.json (everything imports them).
2. Haptics (leaf) → 3. QuoteCard + ShareSheet + callsite swaps →
4. Journal lock (logic → hook → gate → screens → profile toggle) →
5. Apple SSO button → 6. Push client (lib → profile toggle → listener) →
7. V200 backend (migration → route → push-send → cron) →
8. store-submission.md + profile crisis note → 9. verify + review.
