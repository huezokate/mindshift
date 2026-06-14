# T-018-05 — Review

Flow correction #9 (FigJam 95:2236): Save → pop-animate → navigate to the saved
entry's detail page. Implemented in a single client component; no backend/DB/schema
change.

## What changed

| File | Change |
|---|---|
| `V200/src/app/app/response/page.tsx` | **Modified.** (1) import `useAnimationControls`; (2) add `saveControls` hook; (3) in `handleSave` success branch, `await` a scale pop then `router.push(\`/app/journal-v2/${data.sessionId}\`)`; (4) Save `<button>` → `motion.button` with `animate={saveControls}` + `whileTap={{ scale: 0.95 }}`. |
| `docs/active/work/T-018-05/*` | RDSPI artifacts (research, design, structure, plan, progress, review). |

No files created or deleted. No changes to `save-response` route, Supabase schema,
or `globals.css`. Committed as `0ac2485`.

## How it meets the acceptance criteria

- **"Save triggers a brief pop animation, then routes to the saved entry's detail."**
  ✅ Success branch awaits a ~0.42s scale pop (`[1, 1.3, 0.92, 1]`) on the bookmark,
  then pushes `/app/journal-v2/{sessionId}`. The `sessionId` is the value already
  returned by `POST /api/save-response` and matches the detail route's `[id]`
  (= `vent_sessions.id`), confirmed against `JournalPreviewCard.tsx:107`.
- **"Works for anon→saved and signed-in flows."** ✅ Signed-in: single tap →
  save → pop → navigate. Anon: existing redirect to
  `/sign-in?reason=save&redirect_url=/app/response`; after auth the user returns and
  the next (now-authenticated) Save runs the same success path. The pop/navigate is
  bound to a real POST success, so it never fires on the redirect tap. Because save
  401s for anon, the user is always authenticated by navigation time, so the detail
  page's `auth()` guard passes and the row is found.
- **"tsc clean."** ⚠️ See open concern #1 — the *changed file* is clean; the repo has
  unrelated errors from a parallel ticket.
- **"QA in 3 themes."** ⏳ Pop is transform-only (theme-agnostic); manual QA steps for
  cyberpunk/kawaii/notepad are documented in `plan.md` and must be run by a reviewer
  in a live dev server.

## Test coverage

- **Type check**: `npx tsc --noEmit` reports **no errors in `response/page.tsx`**.
- **No automated UI tests added.** The project has no page-level test harness; the
  change is UI sequencing with no isolable pure logic, and the backend dependency is
  unchanged. Adding a runner is out of scope. Verification is tsc + manual QA, which
  matches the AC.
- **Manual QA**: happy path (signed-in), anon→saved detour, error path (no
  pop/navigate), 3-theme check, and double-tap/re-save edge cases are enumerated in
  `plan.md`. **Not yet exercised in a running app** — needs a reviewer with a dev
  server + Clerk/Supabase creds.

## Open concerns / flags for human attention

1. **Unrelated tsc errors on the shared branch (not from this ticket).**
   `src/components/journal/JournalPreviewCard.tsx` references `PlatformGlyph`,
   `ArrowIcon`, `ShareGlyph` that were removed in an in-flight edit (now imports
   `Icon`/`SocialIcon` but the JSX still uses the old names). This is concurrent
   work from **T-018-01 (Material Symbols icons)** on the same branch. I did **not**
   touch or commit that file, to avoid clobbering the other thread. The branch will
   not fully `tsc`-clean until T-018-01 finishes its refactor. **Action: ensure
   T-018-01 lands before relying on a green full-project type check.**

2. **Manual QA outstanding.** The pop+navigate must be eyeballed in all 3 themes and
   for both flows in a live environment. Logic is straightforward but unverified at
   runtime here.

3. **`prefers-reduced-motion` not special-cased.** The pop is a brief scale; likely
   fine, but a motion-sensitive user gets the full pop. Optional follow-up: skip/
   shorten under reduced motion. Not required by the AC.

4. **Navigation latency feel.** The detail page is a server-component fetch; there's
   a brief load after the pop. Acceptable, but if it feels slow in QA, consider a
   `router.prefetch` of the detail route once `sessionId` is known.

## Risk assessment

Low. One client component, one handler, one element; no server/auth/DB surface.
Rollback = revert commit `0ac2485` (behavior reverts to save-in-place). The pop
ordering uses an awaited animation promise rather than a timer, so "animation done →
navigate" is deterministic.
