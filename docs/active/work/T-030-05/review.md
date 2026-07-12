# T-030-05 native-features-store — Review

Handoff self-assessment. Implementation is complete and green; the only
open items are the four K-items that need Kate's accounts (Expo, Clerk,
Apple, Supabase release), catalogued in store-submission.md.

## What changed

29 files, +1864 / −62, commits `5deb06a..574e15d` on
`feat/storybook-clean`, plus this session's RDSPI artifacts.

### mobile/ — created

| File | Purpose |
|---|---|
| `src/lib/haptics.ts` | `tapLight` / `notifySuccess`, no-op safe |
| `src/lib/journal-lock-logic.ts` (+test) | pure lock state machine |
| `src/lib/journal-lock.ts` | `useJournalLock` hook (SecureStore + AppState relock + FaceID prompt) |
| `src/lib/push-logic.ts` (+test) | pure notification-tap routing + pref parse |
| `src/lib/push.ts` | register/unregister weekly nudge, graceful Expo Go path |
| `src/components/share/quote-card.tsx` (+story) | token-only 4:5 share card, 3 modes |
| `src/components/share/share-sheet.tsx` (+story) | ViewShot preview + web-parity action row + share logging |
| `src/components/journal/lock-gate.tsx` (+story) | themed unlock gate wrapper |

### mobile/ — modified

`app.json` (plugins, `usesAppleSignIn`, permission strings — no
`extra.eas.projectId` yet, that's K1), `package.json`/lock (8 new expo
deps), `response.tsx` (ShareSheet + success haptic), journal tab / entry
detail / chat (LockGate wraps; chat send haptic; Socials → ShareSheet),
`profile.tsx` (Weekly nudge toggle, Journal lock toggle, crisis-resources
note), `sign-in.tsx` (`onSSO(strategy)` + Apple button), `_layout.tsx`
(notification-tap → router listener).

### V200/ — created & modified

Created: `supabase/migrations/009_push_tokens.sql` (**authored, NOT
applied** — K4 gated release step), `api/push/register/route.ts`
(auth-gated POST upsert / DELETE), `lib/push-send.ts` (+test) — plain
fetch to exp.host, 100-chunking, DeviceNotRegistered pruning.
Modified: `api/cron/sunday-reminder/route.ts` — push added as a second
send channel inside the existing send step; failures never block email;
`pushSent`/`pushPruned` counters in the summary.

### docs

`store-submission.md` — EAS runbook, listing copy, privacy labels, age
rating (12+), screenshot shot-list, review notes, disclaimer + crisis
copy, K1–K4 checklist.

## Acceptance criteria status

- **Push, Face ID lock, native share work on device** — code complete.
  Face ID gate and share sheet verified on the iOS simulator (Expo Go,
  enrolled Face ID); push requires a dev build + EAS projectId (K1) for
  true on-device e2e — this is an Expo platform constraint (SDK 53+
  removed remote push from Expo Go), documented in the runbook.
- **Sign in with Apple offered alongside existing providers** ✅ — button
  ships above Google via the same proven Clerk SSO lane; completes once
  Apple is enabled in the Clerk dashboard (K2).
- **TestFlight build installs and runs v1 flow** — blocked on K1/K3
  (Kate's Expo + Apple accounts); runbook ready, `eas.json` profiles in
  place, `expo-dev-client` adopted.
- **Submission package assembled** ✅ — store-submission.md.
- **No IAP code; Pro stays web-only** ✅ — grep gate clean
  (storekit/revenuecat/react-native-purchases: zero hits); Profile copy
  names no prices/checkout URL (3.1.1 watch-item noted for review notes).

## Verification evidence (final sweep, this session)

- mobile: typecheck ✅, lint 0 problems ✅, vitest **101/101** (21 files) ✅,
  storybook stories index regenerates ✅.
- V200: `migrations:check` 9 contiguous ✅, vitest **46/46** ✅,
  `tsc --noEmit` ✅, lint 0 errors (13 pre-existing warnings, none in
  files this ticket touched).
- Boot smoke: Expo Go on iPhone 16 sim — clean boot to theme-select with
  all new native deps loaded (screenshot in scratchpad). Interactive
  flows (share capture, lock gate, toggles) were verified at their plan
  steps during implement; only the boot smoke was re-driven in this
  final sweep.

## Test coverage

- **Covered (unit):** journal-lock state machine (enable / unlock /
  background-relock / pref parse), push tap-routing + pref parse, V200
  push sender (chunking at 100, DeviceNotRegistered pruning, mocked
  fetch).
- **Covered (stories):** QuoteCard ×3 themes, ShareSheet, LockGate.
- **Gaps (accepted):** the hook layer (`journal-lock.ts`, `push.ts`) and
  ShareSheet capture/save/open-URL side effects are untested — they are
  thin wrappers over native modules that vitest can't exercise
  meaningfully; behavior sits behind the dev-build checklist instead.
  Share-platform action mapping stayed inline (plan made its extraction
  conditional) so it has no dedicated unit test. `api/push/register` has
  no route test (matches existing route-test posture in V200).

## Open concerns / needs human attention

1. **K-items are the critical path** — K1 `eas init` (+ commit the
   projectId), K2 Clerk Apple connection, K3 Apple Developer enrollment →
   TestFlight → submit, K4 apply migration 009 via Supabase MCP at PR
   release. Nothing else blocks submission.
2. **Push e2e untested until the dev build** — token registration,
   APNs delivery, tap-routing, and cron pruning are unit-tested but not
   exercised end-to-end. First dev build should run store-submission.md
   §5 checklist before the production build.
3. **3.1.1 watch-item** — Profile's "manage your plan on the web" copy is
   believed compliant (no price, no checkout link) but is flagged in the
   review notes in case App Review disagrees; fallback is removing the
   line for v1.
4. **QuoteCard parity is best-effort** (D5) — same composition/tokens as
   the web canvas, not pixel-identical. Kate may want a taste pass on the
   captured 1080×1350 output on a real device.
5. **Receipt polling deferred** (D2) — pruning only acts on synchronous
   DeviceNotRegistered tickets; delayed receipt errors accumulate until a
   later ticket adds receipt polling. Acceptable at v1 token volumes.
6. **Expo Go push warning** — expo-notifications logs a warning in Expo
   Go (remote push unsupported there); calls are lazy/wrapped so it's
   cosmetic, disappears in the dev build.
