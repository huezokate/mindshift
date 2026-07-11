# T-030-04 rn-screen-port — Review

Self-assessment / handoff. Ten commits on `feat/storybook-clean` (Step 1 →
Step 10, one per plan step). Typecheck, lint, and **97 vitest tests / 21
files** green throughout; grep gates pass (no web-only APIs outside comments,
no hardcoded hex left in app/components outside generated modules/fixtures).
Live-verified on the iPhone 16 simulator (Expo Go) against the local V200
backend — screenshots in the session scratchpad (`01-entry` … `07-signin`).

## What changed

### Data/state layer (created)
`lib/figures.ts` (15 figures, metadata WITHOUT systemPrompt — server resolves
persona; portraits stream from `${API_URL}/portraits/{mode}/{id}.png` via
expo-image, 26MB stays out of the binary), `lib/anon-limits-logic.ts` +
`lib/anon-limits.ts` (web's localStorage gate → SecureStore JSON, 1 vent/day
+ 3 lenses/vent — the server does NOT rate-limit anon), `lib/use-api.ts`
(Clerk Bearer per call), `lib/vent-label.ts`, `lib/journal-map.ts` (the only
module that knows the journal-v2 JSON; title fallback), `lib/chat-logic.ts`
(pure chat reducer), `lib/typewriter-logic.ts` + `use-typewriter.ts`
(18ms/char, reduce-motion jumps to done), `lib/color.ts` (withAlpha),
`lib/use-mindmaps.ts`; `state/vent-flow.tsx` (in-memory funnel context — the
sessionStorage analogue), `state/journal-store.tsx` (paged cache + counts +
optimistic add-lens/favorite/delete + `fetchEntry` paged fallback because
**no single-entry GET exists on the backend**).

### Screens (all former placeholders now real)
Onboarding (VentInput 800/20 gates → startVent → lens) · Lens (vent preview
w/ derived label, 15-figure grid w/ streamed portraits, LensPickerSheet
carousel, anon-limit + 429 + genError cards, POST generate-response) ·
Response (typewriter + caret, signed-in silent auto-save + save-pop status
pill, anon SAVE → sign-in?reason=save&redirect=/response, NEW LENS loop,
native text share + share log) · Journal tab (FlatList paging + pull-to-
refresh, all/favorites tabs, WelcomeCard + demo seed, add-lens, anon
AuthBanner gate) · Entry detail (title/vent card, snap carousel + dots,
Chat/Decorate[upcoming]/Socials rows, +Lens) · Chat (signed-in only, history
GET, optimistic sends w/ rollback, wind-down strip on `done`, composer
removed only on hard-cap `locked`) · Mindmap landing + browse (live GET
maps, MindmapAreaCard per goal w/ done/total) · Home hub (3 action cards +
counts) · Profile (account/plan/theme/sign-out) · Theme-select (ephemeral
disclaimer ack → Enter; anon entry per `index.tsx` redirect) · Auth rebuilt
on the DS (AuthShell/AuthInput + AuthBanner reason/redirect params).

### Components (created)
`journal/figure-portrait.tsx` (expo-image over LensAvatar initial fallback —
never blank offline), `journal/lens-picker-sheet.tsx` (+story),
`journal/limit-card.tsx` (+story), `chat/chat-thread.tsx` +
`chat-composer.tsx` (+6-state story incl. wind-down + capped),
`home/action-card.tsx` (+story), `mindmap/web-only-stub.tsx`,
`auth/auth-shell.tsx`.

### Deleted (Phase-0 hex chrome)
`auth-form.tsx`, `placeholder-screen.tsx`, `nav-link.tsx`,
`foundation-check.tsx`; tab/auth navigators re-themed from tokens.

## Acceptance criteria status
1. **Each flow works e2e on a simulator against the live backend** — ✅
   partially machine-verified: app boots to theme-select, every ported screen
   renders on-sim (screenshots), the backend contract was exercised live
   (anon POST generate-response 200 with the app's exact payload; journal-v2
   Bearer auth was proven in T-030-01). ⚠️ Interactive walk-through (typing
   a vent, tapping Select, chat turns, sign-in) was NOT automatable — no
   cliclick/idb/maestro on this machine and osascript lacks assistive
   access. **Kate should run the 5-minute AC script in plan.md Step 11.**
2. **Behavior parity** — ✅ by construction (constants and copy ported
   verbatim; arc/tier logic is server-side and untouched) + unit tests for
   every ported rule (anon limits table, chat done≠locked, title fallback,
   typewriter step, vent label).
3. **No web-only APIs** — ✅ grep gate: no sessionStorage/localStorage/
   document/window/IntersectionObserver/navigator.share outside comments.
4. **Navigation matches web route structure** — ✅ expo-router mirrors
   journal-v2 → `/journal/[id]/chat/[figureId]`, funnel = stack screens,
   plus the T-030-01 tabs shell (deliberate native divergence, design D12).

## Test coverage
97 tests / 21 files (+40 new): anon-limits (11), chat-logic (7),
journal-map (3), figures (4), vent-label (3), typewriter (3), color (3),
plus the inherited theme/CSS-fidelity gates. **Gaps:** no RN rendering tests
(unchanged D16 posture — stories are the visual rig); network layer mocked
only at the apiFetch level; journal-store paging/optimistic logic is only
exercised via its pure `journal-map` core (the store itself needs the
missing RN test rig); on-sim verification covered rendering, not
interaction.

## Open concerns for a human reviewer
1. **Scope deviations, all deliberate (design.md):** mindmap `new`/`map`/
   `reflect` are honest web-only stubs (D7 — ticket scope said "area
   cards"; React Flow canvas has no RN equivalent); share is native
   *text* share + `platform:'native'` log (D8 — the full quote-card sheet
   is T-030-05); chat is signed-in-only (web parity — the ticket's "anon
   path" for chat doesn't exist in product).
2. **Anon limits are self-enforced client-side** (like web). SecureStore
   blob `ms_anon_limits`; a reinstall resets it — same weakness class as
   the web's localStorage. Server-side anon limiting remains a backend
   backlog item.
3. **Journal filter tabs are a minimal underline treatment** — web fidelity
   of that strip wasn't in the Figma census; flag if pixel parity matters.
4. **Mindmap keeps the user's theme** instead of forcing notepad (D7 note)
   — decision for Kate.
5. **applyLensToEntry re-sorts** an upserted same-figure lens to the end
   (web does the same optimistically; server order on reload wins).
6. **Concurrent-thread sighting:** an untracked `ui/text-field.tsx` appeared
   and vanished mid-Step-10 (progress.md #5) — another Lisa thread may be
   working adjacent territory; watch for merge overlap on auth inputs.
7. **Expo Go vs dev build:** verification ran in Expo Go; T-030-05's
   native modules (push, Face ID) will force a dev build — re-verify these
   screens there.
8. Response screen's `useSavePop` wraps the status pill; on very long
   responses the auto-save fires at typewriter end — if Kate wants save on
   arrival instead, it's a one-line gate change.

Ready for T-030-05 (native features + store submission).
