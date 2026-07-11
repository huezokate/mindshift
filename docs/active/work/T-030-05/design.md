# T-030-05 native-features-store — Design

Decisions with options and rationale, grounded in research.md.

## D1 — Push tokens live in a Supabase table (gated migration)

Options: (a) new `push_tokens` table; (b) Clerk `privateMetadata`; (c) no
storage (client-only local notifications).
**Chosen: (a).** Multi-device users need a token *list* with pruning on
Expo's `DeviceNotRegistered`; metadata blobs (8KB cap, read-modify-write
races) model that badly, and (c) can't deliver the Sunday digest (it's
computed server-side by the cron). Migration authored as the next
contiguous `NNN_push_tokens.sql` and validated by `migrations:check`;
**applying it is release-gated** (Supabase MCP at PR release, per
migration-process.md) — implement does not touch the live DB.
Schema: `(user_id text, token text primary key, platform text,
updated_at timestamptz)` — token as PK makes re-registration an upsert and
device handoff (same token, new user) an ownership transfer. RLS enabled,
no anon policies (service-role + owner-scoped API only).

## D2 — Push rides the existing Sunday cron, as a second send channel

Options: (a) extend `sunday-reminder` step 5; (b) separate push cron;
(c) client polls. **Chosen: (a)** — the route was explicitly structured so
new channels slot into the isolated send step (its own comment says so),
and a second cron would duplicate the generate/group logic or race its
idempotency. Sends go straight to `https://exp.host/--/api/v2/push/send`
(plain fetch, 100-message chunks — no SDK dependency in V200). Tokens whose
*ticket* comes back `DeviceNotRegistered` are deleted inline; receipt
polling (delayed errors) is deferred — acceptable v1 pruning. Email keeps
sending — push is additive, not a replacement, until open rates prove out.

## D3 — Registration API: one route, POST to register, DELETE to revoke

`POST /api/push/register {token, platform}` / `DELETE {token}` — Clerk
`auth()` required (401 JSON like the mindmap routes; middleware matcher
already covers /api). Upsert on token PK. Rejected: piggybacking on an
existing route (nothing fits) and auto-registering at app launch (D4).

## D4 — Client opt-in is contextual, not at launch

The permission prompt + registration live behind a **"Weekly nudge" toggle
on Profile** (and nothing else asks). Apple review dislikes cold-open
permission prompts; the toggle also gives revoke (DELETE + SecureStore flag
`ms_push_enabled`). Notification taps deep-link via a `url` field in the
push payload → expo-router (`Notifications.addNotificationResponseReceivedListener`
in `_layout`). `getExpoPushTokenAsync` needs an EAS `projectId` —
read from `Constants.expoConfig.extra.eas.projectId` with a graceful
"run `eas init` first" error path, since EAS init needs Kate's account (K1).

## D5 — Quote card: RN view + react-native-view-shot, not a canvas port

Options: (a) styled RN view captured with `captureRef` (view-shot);
(b) Skia canvas re-implementation; (c) server-side card rendering.
**Chosen: (a)** — the card is fonts/colors/layout, all of which the token
layer + loaded fonts already provide; view-shot captures any mounted view
to a PNG file URI at explicit pixel size (1080×1350, web parity). Skia is a
heavy new native dep for zero extra fidelity; server rendering adds a
backend surface the story forbids. The card mounts inside the sheet as the
*preview itself* (what you see is what you share) — no off-screen tricks.
Pixel-perfect parity with the web canvas is explicitly best-effort; the
RN card follows the same composition (figure name, quote, response, vent
toggle, wordmark) from tokens.

## D6 — Share actions: expo-sharing primary; Photos saves via expo-media-library

- **Share** → `Sharing.shareAsync(fileUri)` (the OS sheet carries its own
  Save Image/Messages/etc.) → log `native`.
- **Instagram / TikTok** → save to Photos (`MediaLibrary.saveToLibraryAsync`,
  add-only permission) then `Linking.openURL('instagram://library' /
  'snssdk1233://')` — the web flow, minus the browser download dance → log.
- **Facebook** → `Linking.openURL(sharer?u=minds-shift.com)` → log.
- **Copy link** → honest "no public per-entry route yet" status (web parity).
- **Download** → save to Photos → log `download`.
MediaLibrary is unavoidable for the IG/TikTok flows, so keeping Download
costs nothing. `NSPhotoLibraryAddUsageDescription` via the plugin config.
Rejected: dropping to share-only (breaks the web feature matrix Kate signed
off in S-020 review).

## D7 — Apple sign-in: Clerk SSO flow (same lane as Google)

Options: (a) `startSSOFlow({strategy:'oauth_apple'})`; (b) native
`expo-apple-authentication` + Clerk token exchange.
**Chosen: (a)** — identical, already-proven code path to the working Google
button; zero new native modules; verifiable in Expo Go; satisfies 4.8
(Sign in with Apple is offered wherever Google is). The `usesAppleSignIn`
entitlement is still added to app.json now (free, needed the moment (b) is
wanted). **Kate action (K2): enable Apple as a Clerk social connection in
the dashboard** — code renders the button regardless; Clerk errors cleanly
if the connection is off. Native button (b) deferred: worth revisiting if
App Review pushes back on the browser round-trip.

## D8 — Face ID: session-scoped gate over the journal surfaces

`expo-local-authentication`. Preference `ms_journal_lock` in SecureStore
(same idiom as theme); **toggle on Profile**, shown only when
`hasHardwareAsync && isEnrolledAsync`. A `LockGate` component wraps the
journal tab, entry detail, and chat screens: when enabled, the first
gated screen per app session calls `authenticateAsync({promptMessage:
'Unlock your journal'})` (system fallback to passcode stays on); success
unlocks for the session, and an AppState → background listener re-locks.
Rejected: per-screen re-prompt (hostile), app-wide lock (the vent funnel
is anon-friendly by design and must stay frictionless).

## D9 — Haptics: one tiny module, three touchpoints

`lib/haptics.ts` wrapping expo-haptics (no-ops on unsupported platforms):
light impact on chat send, success notification on save-pop + share
completion. Deliberately minimal — haptics sprinkled everywhere reads as
gimmick; these three are confirmation moments. Not gated on reduce-motion
(haptics are an accessibility *aid*; iOS has its own system toggle).

## D10 — Dev build posture: adopt expo-dev-client, verify what Expo Go can

`expo-dev-client` is added and `eas.json` already has the development
profile, but **no EAS/cloud build runs in this session** — builds and
submission need Kate's Expo + Apple accounts (K1/K3). Verification split:
share sheet, Face ID toggle+gate (simulator Face ID enrollment), Apple
button rendering, haptics code paths → Expo Go / unit tests; remote push
end-to-end and the native entitlement → the first dev build (documented
runbook in store-submission.md). Rejected: local `expo run:ios` prebuild
this session — 10+ min Xcode build with New-Arch pods is a poor
time/certainty trade against an already-green Expo Go rig.

## D11 — Store submission is a package, not a button-press

Authored as `store-submission.md` (work artifact): EAS build/submit
runbook, App Privacy label mapping (email + user content + identifiers,
no tracking), age-rating questionnaire answers (frequent/mild mature
themes — venting content — suggests 12+), screenshot shot-list per device
class, review notes (demo account, anon flow explanation), and the
mental-wellness disclaimer + **crisis-resources copy**. In-app: the
disclaimer already ships (theme-select ack, T-030-04); a crisis-resources
line is added to Profile so the app carries it, not just the store listing.
Everything needing Kate's accounts is an explicit K-item checklist, not
silently skipped.

## D12 — No IAP (AC guard)

Nothing StoreKit/RevenueCat-shaped is added; Pro copy on Profile keeps
pointing at the web ("manage your plan on the web") — which is permitted
for a free app with no in-app purchase path as long as it doesn't link to
external *purchase* flows; the copy names no prices and no checkout URL.
Review flags this as a 3.1.1 watch-item for the submission notes.

## D13 — Testing strategy

Pure logic (vitest, mobile): journal-lock state machine (enable/unlock/
background-relock), push payload/`url` routing helper, share-platform →
action mapping. V200 (vitest): push chunking + `DeviceNotRegistered`
pruning of `lib/push-send.ts` with a mocked fetch; migrations:check green.
Stories: QuoteCard (3 modes), ShareSheet states. Live (Expo Go, iPhone 16
sim): share sheet capture→OS sheet, Face ID gate with enrolled sim,
profile toggles. Push e2e + Apple SSO completion: deferred to the dev
build (K-items), stated plainly in review.md.

## Kate-action register (referenced above)
- **K1**: `eas init` (writes `extra.eas.projectId`) + first dev build.
- **K2**: enable Apple social connection in Clerk dashboard.
- **K3**: Apple Developer enrollment (individual), `eas credentials`,
  TestFlight + submission using store-submission.md.
- **K4**: apply `NNN_push_tokens.sql` via Supabase MCP at PR release.
