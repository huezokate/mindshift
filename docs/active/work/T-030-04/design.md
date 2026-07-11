# T-030-04 rn-screen-port — Design

Decisions for composing the T-030-03 primitives into screens on the reused
backend. Each decision lists the options considered and why the winner won,
grounded in research.md.

## D1 — Funnel state: in-memory React Context (not persisted storage)

Web stitches onboarding→lens→response through sessionStorage strings
(`ms_vent`, `ms_figure_id`, `ms_response`, `ms_session_id`).
Options: (a) React Context provider holding the same fields in memory;
(b) SecureStore persistence; (c) add AsyncStorage.
**Chosen: (a)** — a `VentFlowProvider` (`{vent, figureId, figureName,
response, sessionId}` + setters/reset). sessionStorage's lifetime is "the
tab"; the RN analogue is "the app process" — in-memory context matches the
web semantics exactly (kill app = close tab = fresh session). SecureStore is
keychain-backed and wrong for ephemeral flow state; AsyncStorage adds a dep
for no benefit. Rejected (b)/(c).

## D2 — Anon daily limits: SecureStore, same rules as web

Anon gating is client-side only (server enforces nothing for anon), so the
RN client must self-enforce or anon users get unlimited generation.
Options: (a) SecureStore JSON blob; (b) AsyncStorage; (c) skip (defer).
**Chosen: (a)** — one key `ms_anon_limits` holding `{date, ventKey,
lensCount}` with the exact web rules (1 vent/day, 3 lenses/vent, ventKey =
first 100 chars). SecureStore is already the app's persistence idiom
(`ms_theme`) and the blob is tiny. Logic extracted to a pure, tested module
(`anon-limits-logic.ts`) with a thin storage wrapper. (c) rejected: AC
requires anon-path parity; unlimited anon would also be a cost bug.

## D3 — Auth transport: Clerk Bearer token via a `useApi` hook

`clerkMiddleware` accepts `Authorization: Bearer <session token>`; the
profile smoke test already proved it against journal-v2. **Chosen:** a small
`useApi()` hook wrapping the existing `apiFetch` — resolves
`getToken()` per call (Clerk handles caching/refresh), passes it when signed
in, omits it for anon calls. No cookies, no backend changes. Rejected:
per-screen manual `getToken()` plumbing (repetitive, error-prone).

## D4 — Entry detail data: journal store cache + paged fallback

There is NO single-entry GET endpoint (web queries Supabase in a server
component). Options: (a) add a backend endpoint — violates the story's
"reuse backend as-is"; (b) pass the entry through navigation params —
expo-router params are strings, entries are deep objects, and stale-on-update;
(c) a `JournalStore` context that caches pages fetched by the list screen;
detail reads by id from the cache, and on cache miss (cold deep link) pages
through `GET /entries` until the id is found.
**Chosen: (c).** The store also gives the list optimistic add-lens updates
and shared counts. Fallback paging is acceptable: journals are small and the
miss path is rare (notifications/deep links arrive in T-030-05).

## D5 — Portraits: remote from the deployed web app via expo-image

45 PNGs = 26MB — bundling would balloon the binary (store friction) for
assets the web already serves at `${API_URL}/portraits/{theme}/{id}.png`.
**Chosen:** remote URLs built from `API_URL` + `expo-image` (disk cache,
`placeholder` = existing LensAvatar initials/gradient so offline/slow still
renders). Dev already requires the local backend running, so no new
constraint. Rejected: bundling (26MB), a resized bundled subset (asset
pipeline work out of scope; revisit in T-030-05 if offline matters).

## D6 — Figures module: port metadata WITHOUT systemPrompt

The server resolves the persona from `figureId` authoritatively; the client
`systemPrompt` is only a fallback for unknown ids. **Chosen:** port
`figures.ts` with `{id, name, descriptor, era, quote, bio}` only and send no
`systemPrompt`. Keeps persona prompts out of the shipped binary and the
payload smaller. Rejected: verbatim port (ships ~150 lines of prompts to no
effect for known ids).

## D7 — Mindmap scope: landing + browse (area cards); map/new/reflect stay stubs

Ticket scope line is "Mindmap (area cards)". The `map` canvas is
@xyflow/react with no RN equivalent (a port is its own ticket); `new` is a
6-step AI wizard (large); `reflect` is mock-data even on web.
**Chosen:** port the mindmap landing (hasMap branch: Browse/Reflect cards vs
Create card) and `browse` (MindmapAreaCard per saved goal, milestone progress,
live `GET /api/mindmap/maps`). `new`, `map`, `reflect` remain routed
placeholders restyled onto tokens with honest "on the web for now" copy +
(where useful) a link-out. This satisfies the ticket's stated scope; the
deviation from the broader AC ("each flow end-to-end") is flagged in review.
Note: web forces notepad theme on mindmap; mobile keeps the user's mode —
MindmapAreaCard is already token-correct in all three (T-030-03), and forcing
a mode fights the app-level ModeSwitcher. Flagged for Kate.

## D8 — Share: minimal native text-share now; full sheet is T-030-05

T-030-05 explicitly owns "native share sheet (replaces the web ShareSheet)"
+ view-shot imagery. But response/entry-detail need a working SHARE action
for parity. **Chosen:** RN's built-in `Share.share` with a text quote-card
(figure, quote line, app link), then `POST /responses/[id]/share` with
platform `'native'` (a valid enum) when the share completes and the response
is persisted. No new deps, no canvas port. Rejected: porting the web
ShareSheet composite (duplicate of T-030-05), disabling share (breaks AC
parity of the response flow).

## D9 — Journal list: FlatList with onEndReached (no IntersectionObserver)

`FlatList` with `onEndReached` (threshold ~0.5, concurrency-guarded like the
web's `loadingRef`) replaces the sentinel/IntersectionObserver. Filter tabs
(all/favorites) refetch from offset 0. Empty states: WelcomeCard + seed
(`POST /seed`) for `all`, text for `favorites`. Pull-to-refresh via
`RefreshControl` (native affordance web lacks; cheap win).

## D10 — Chat: signed-in only, server-driven arc, optimistic sends

Parity: web chat is signed-in-only (anon branch is dead code) — the AC's
"anon path" for chat means *anon never reaches it*, enforced by entry points
(chat button lives only in entry detail, which is auth-gated). The arc
(escalation, `⟪END⟫` soft-close, cap 20) is entirely server-side; the client
renders `done` (wind-down divider, composer stays open) and `locked`
(composer removed, closing card). Mount = `GET history`; send = optimistic
user bubble + TypingDots, rollback on `ApiError`. Vent + seed reframe render
as opening bubbles from route data (never sent in `messages`), matching web.
KeyboardAvoidingView + inverted-scroll considered; **chosen:** normal list +
auto-scroll-to-end (matches web, simpler with the divider/cap footers).

## D11 — Response screen: interval typewriter + auto-save split by auth

18ms/char `setInterval` slice reveal + caret, exactly the web constants;
reduce-motion (`AccessibilityInfo`) skips straight to done. Signed-in:
silent auto-save once typing completes → status pill (Saving…/Saved/Retry),
`useSavePop` on saved. Anon: SAVE pill routes to `/sign-in` (AuthBanner
`reason=save` — carried via param). After anon sign-in mid-flow, funnel
state survives (D1 context outlives navigation).

## D12 — Navigation: keep the tabs shell; AppHeader on tab screens

T-030-01 chose a 4-tab shell (home/journal/mindmap/profile) over the web's
header-dropdown-only nav. **Chosen:** keep tabs as primary nav (native
idiom); mount `AppHeader` on the tab screens for brand + counts + the
semantic dropdown (parity affordance), with screens supplying
`entryCount`/`lensCount` (GET counts) and mindmap horizon/progress (from the
journal/mindmap stores) since `AppHeaderView` is props-only. Funnel screens
(onboarding/lens/response) are stack screens with `EntryAuthRow`/back
affordances like web. Theme the tab bar + stack from tokens (retiring the
hardcoded hex). Anon tab access mirrors web gating: journal/mindmap/profile
tabs render AuthBanner-led sign-in states instead of hiding tabs.

## D13 — Anon entry: restore theme-select as anon landing (with disclaimer)

Web: anon `/app` → theme-select (carousel + **ephemeral** disclaimer ack →
Enter). Mobile `index.tsx` currently sends anon straight to onboarding, and
theme-select lacks the disclaimer. **Chosen:** anon → `/theme-select`; add
the disclaimer ack (unchecked every visit, never persisted — web comment is
explicit) + "Enter Minds Shift" CTA → onboarding. The existing ModeSwitcher
UI stays (mobile idiom) rather than porting the web carousel. This closes
the "anon chat entry unreachable"-class gap for the disclaimer requirement.

## D14 — No new state/data libraries

Plain hooks + two small contexts (VentFlow, JournalStore). No react-query/
zustand: the app has ~6 fetching screens, the stores are trivial, and every
new dep is EAS-build surface. Re-evaluate if T-030-05 adds offline/push.

## D15 — Retire Phase-0 hex chrome in touched paths

Auth screens rebuilt on DS (Card/Button/VentInput-style inputs + AuthBanner);
tab bar + navigator options themed from tokens; `PlaceholderScreen`/`NavLink`
survive only inside the three remaining mindmap stubs (restyled onto tokens);
`foundation-check` unmounts from home (kept for storybook/debug).
`auth-form.tsx` hex components deleted once auth screens are rebuilt.

## D16 — Testing strategy (no RN rendering rig — unchanged from T-030-03)

Pure-logic vitest: anon-limits rules, vent-label keyword derivation, journal
API→Lite mapping, typewriter step math, chat reducer (optimistic add/rollback/
locked transitions), portrait URL builder. Stories: LensPickerSheet, limit
card, chat screen states (done/locked), response action row. Live
verification: on-simulator against `localhost:3000` backend covering the AC
flows (anon funnel, signed-in funnel incl. auto-save→journal→detail→chat
arc→cap, mindmap browse, profile). No RNTL adoption this ticket (same
rationale as T-030-03 D10).

## Rejected wholesale
- Moti (T-030-03 already standardized on Reanimated 4.5).
- Backend additions (single-entry GET, anon rate-limit API) — story boundary.
- Porting the web ShareSheet canvas pipeline (T-030-05).
- @gorhom/bottom-sheet for LensPicker (Sheet primitive already covers both
  chromes; bottom-sheet stays a Storybook-only peer).
