# T-030-05 native-features-store — Research

Descriptive map for the native-features + store-submission ticket. Builds on
the T-030-04 research/review (mobile screen port complete, 97 tests green);
this doc covers only what THIS ticket touches. Verified 2026-07-11.

## 1. Workspace state after T-030-04

- `mobile/` Expo SDK 57 / RN 0.86 New Arch / Expo Go verified. **No
  expo-dev-client** — the app has only ever run in Expo Go; `mobile/ios/`
  does not exist (no prebuild has been run). EAS config exists
  (`eas.json`: development profile with `developmentClient: true` +
  simulator, preview/prod pointing at `https://app.minds-shift.com`,
  `appVersionSource: remote`, empty `submit.production`).
- `app.json`: name MindShift, slug `minds-shift`, scheme `mindsshift`,
  `com.mindsshift.app`, portrait, icons + splash configured (blue `#208AEF`
  splash), plugins: expo-router / expo-splash-screen / expo-secure-store.
  **No push, local-auth, or apple-auth plugin entries; no
  NSFaceIDUsageDescription; no `usesAppleSignIn` entitlement.**
- Relevant deps installed: expo-device, expo-constants, expo-image,
  expo-linear-gradient, expo-secure-store, expo-web-browser, react-native-svg.
  **NOT installed:** expo-notifications, expo-local-authentication,
  expo-haptics, expo-sharing, expo-apple-authentication,
  react-native-view-shot, expo-media-library.
- Auth: Clerk Expo with email/password + **Google via
  `useSSO().startSSOFlow({strategy:'oauth_google'})`** (system browser) —
  sign-in.tsx. This is the pattern Apple sign-in must sit beside (Apple
  guideline 4.8: offering Google login requires offering Apple).
- Share today (T-030-04 D8, deliberately minimal): RN `Share.share` **text**
  quote + `POST /responses/[id]/share {platform:'native'}` — on the response
  screen and entry detail ("Socials" button). The full quote-card sheet was
  explicitly deferred to this ticket.
- Journal surfaces to lock: `(tabs)/journal.tsx`, `journal/[id]/index.tsx`,
  `journal/[id]/chat/[figureId].tsx`. All gate on Clerk sign-in already;
  no biometric anything exists. SecureStore idiom: `theme/storage.ts`
  (`ms_theme`), `lib/anon-limits.ts` (`ms_anon_limits`).
- Haptics: none anywhere. Motion recipes live in `components/ui/motion.ts`.
- Deep links: scheme-only (`mindsshift://`); expo-router typed routes; no
  universal links / associated domains configured.

## 2. The web ShareSheet to replace (V200/src/components/journal/ShareSheet.tsx)

- Bottom sheet (fcard chrome; the RN `Sheet` primitive already models this).
- Renders a **1080×1350 PNG quote card** via `renderQuoteCard()`
  (`QuoteCardCanvas.ts`, browser `<canvas>`): figureId + responseText +
  theme + optional ventText (`includeVent` checkbox re-renders the card).
- Actions row (icon buttons: DS secondary 45px + SocialIcon brand SVGs —
  all already ported to RN in T-030-03):
  - **Share** → `navigator.share({files:[png]})` → log `native`
  - **Instagram** → download png + deep link `instagram://library` → log
  - **TikTok** → download png + deep link `snssdk1233://` → log
  - **Facebook** → download + `facebook.com/sharer?u=minds-shift.com` → log
  - **Copy link** → honest "no public per-entry route yet" status (no log)
  - **Download** → `<a download>` → log `download`
- Share log endpoint: `POST /api/journal-v2/responses/[id]/share`, valid
  platforms `instagram|tiktok|facebook|link|native|download`; only possible
  with a persisted responseId (response screen pre-save shares don't log).
- Browser-only surface: canvas, Blob URLs, `navigator.share`, `<a download>`,
  `window.open`, focus trap — all must be replaced, not ported.

## 3. The weekly loop to port to push (S-021 / T-021-01)

`GET /api/cron/sunday-reminder` (V200, Vercel cron `0 1 * * 1`):
1. Auth via `Authorization: Bearer ${CRON_SECRET}`.
2. Loads every ACTIVE mindmap (service-role) + goals/milestones/weekly goals.
3. Computes current week from `created_at`; AI-generates this week's goal
   per area if missing (idempotent via `mindmap_weekly_goals`).
4. Groups digests by user; resolves email via Clerk; **sends one Resend
   email per user**. The send step is *deliberately isolated* — the route
   comment says an SMS channel can slot in "without touching the
   generation/grouping logic". Push is the same shape: a second channel at
   step 5.
- There is **no push-token storage anywhere** (no Supabase table, no API
  route, nothing in Clerk metadata) and **no /api/push/* routes**.
- Migrations are gated (`docs/knowledge/migration-process.md`): next
  contiguous `NNN_name.sql` under `V200/supabase/migrations/`, validated by
  `npm run migrations:check`, applied via Supabase MCP **as part of
  releasing the PR** — never by hand. Existing: 001_journal, 002_journal_v2,
  003_waitlist (+ mindmap/chat tables applied via the process since).

## 4. Platform/tooling constraints (verified locally)

- **Expo Go cannot do remote push** (SDK 53+ removed it) and does not
  include expo-apple-authentication; expo-local-authentication and
  expo-haptics DO work in Expo Go, but Face ID on the *simulator* needs
  Features→Face ID enrollment; expo-sharing + view-shot work in Go.
  ⇒ full verification of push + Apple sign-in requires an **EAS dev build**
  (or `expo run:ios` prebuild) — a new build artifact this repo has never
  produced. `eas.json` is ready for it; EAS builds need an Expo account
  login + Apple credentials that an agent session does not hold.
- Expo push pipeline: client `expo-notifications`
  `getExpoPushTokenAsync({projectId})` → **projectId comes from EAS init**
  (`extra.eas.projectId` — NOT yet in app.json); server POSTs to
  `https://exp.host/--/api/v2/push/send` (batchable, no SDK needed —
  plain fetch works from the Next.js cron).
- Apple sign-in: Clerk supports `startSSOFlow({strategy:'oauth_apple'})`
  (system browser — identical shape to the working Google flow) and native
  `expo-apple-authentication` token flow. The Clerk dashboard must have
  Apple enabled as a social connection; the iOS app needs the
  `usesAppleSignIn` entitlement (app.json ios key) for the native module.
- Store submission needs: Apple Developer account (individual — S-030
  decision), `eas credentials`/`eas submit`, App Privacy labels (data
  collected: email via Clerk, user content vents/responses via Supabase,
  identifiers), age rating questionnaire, screenshots per device class,
  and the mental-wellness disclaimer — **the in-app disclaimer already
  ships** (theme-select ack, T-030-04 D13); a crisis-resources note exists
  nowhere yet.

## 5. Existing UI hooks this ticket composes

- `Sheet` primitive (bottom/fcard) — exactly the web ShareSheet chrome.
- `SocialIcon` + `OWN_TILE` brand SVGs (12, per-theme) — the platform row.
- Icon-only DS `Button` (45px secondary) — the action buttons.
- `useSavePop`/`usePressScale` (motion.ts) — haptics attach naturally here.
- `LensCard`/`FigurePortrait`/theme tokens — the RN quote-card view can be
  a styled RN view (view-shot captures any view at 1080×1350 via
  `captureRef(ref, {width, height})`).
- Profile screen (T-030-04) — natural home for the Face ID toggle + push
  opt-in; `parseAuthReason`/AuthShell for any new gates.
- `proxy.ts` middleware matcher covers `/api/*` — any new `/api/push/*`
  route self-checks auth like the mindmap routes (JSON 401, not redirect).

## 6. Constraints & open questions for Design

1. **Push token storage**: new Supabase table (gated migration) vs Clerk
   `privateMetadata` (no migration, but token lists in user metadata are
   awkward: multi-device, pruning, 8KB metadata cap). Where do tokens live?
2. **Push send**: extend sunday-reminder's step 5 (email + push together)
   vs a separate cron. How do invalid tokens get pruned (Expo receipts)?
3. **Backend boundary**: the epic says "reuse backend as-is", but push
   REQUIRES a token-register route + cron send extension + one migration.
   Scope it minimally or punt server-side to a follow-up?
4. **Quote card geometry**: web renders 1080×1350 canvas. view-shot
   captures a mounted view — off-screen mounting strategy + pixel size vs
   point size (device pixelRatio) needs a decision.
5. **Download action on iOS** = save to Photos → expo-media-library +
   NSPhotoLibraryAddUsageDescription, or drop Download in favor of the
   native share sheet's own "Save Image" (zero new perms)?
6. **Apple sign-in**: SSO browser flow (matches Google, minimal) vs native
   AppleAuthentication button (Apple-preferred UX, new module + entitlement).
7. **Face ID scope**: lock at tab-focus vs app-foreground; where the toggle
   lives; fallback to device passcode (`authenticateAsync` default) —
   and Expo Go simulator enrollment for verification.
8. **Store package**: what can an agent genuinely produce vs what needs
   Kate's Apple account (build, screenshots on real devices, submission)?
9. Dev build: adopt `expo-dev-client` now (unblocks native verification
   forever) or keep Expo Go and accept unverified push/Apple paths?
10. Crisis-resources note placement (submission requirement): in-app
    (profile/about) and/or App Store notes field.
