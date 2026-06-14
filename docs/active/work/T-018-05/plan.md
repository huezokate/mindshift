# T-018-05 — Plan

One atomic implementation step (single file), then verification. No backend work.

## Step 1 — Implement pop + navigate (single commit)

In `V200/src/app/app/response/page.tsx`:

1. Import `useAnimationControls` alongside `motion` from `framer-motion`.
2. Add `const saveControls = useAnimationControls()` in the component body.
3. In `handleSave`, after `setSaveState('saved')`, `await saveControls.start(...)`
   (scale keyframes `[1, 1.3, 0.92, 1]`, ~0.42s), then
   `router.push(\`/app/journal-v2/${data.sessionId}\`)`.
4. Convert the Save `<button>` to `motion.button` with `animate={saveControls}`
   and `whileTap={{ scale: 0.95 }}`; preserve `onClick`, `title`, `style`.

Commit message: `feat(response): pop-animate Save then route to journal entry (T-018-05)`

## Testing strategy

This is a client-side UX flow in a project with no existing automated test
harness for pages (verify by checking for test runner config). Verification is
therefore **type-check + manual QA**, which matches the AC ("tsc clean; QA in 3
themes").

### Automated
- `cd V200 && npx tsc --noEmit` → must be clean. Catches the `motion.button`
  prop typing and the controls hook usage.
- `npm run lint` (if configured) on the changed file.
- `npm run build` (optional, higher confidence) to ensure the route compiles.

No unit/integration tests added: the change is a UI sequencing tweak with no new
pure logic to isolate; the backend it depends on is unchanged and already covered
by its own route. Adding a test runner is out of scope for this ticket.

### Manual QA (verification criteria)

Run `npm run dev` (localhost:3000, no host split).

**Signed-in flow**
1. Sign in. Go through onboarding → lens → response.
2. Wait for the typewriter to finish (Save row appears on `done`).
3. Tap Save. Expect: button pops (scale up→settle), then route changes to
   `/app/journal-v2/{id}` showing the just-saved entry with the correct vent +
   lens response.
4. Verify the entry persisted (refresh the detail page; row still loads).

**Anon → saved flow**
1. Sign out. Run onboarding → lens → response as anon.
2. Tap Save → redirected to `/sign-in?reason=save&redirect_url=/app/response`.
3. Complete sign-in → land back on `/app/response` with the same response.
4. Tap Save again → pop → navigate to the entry detail. ✅

**Error flow (no regression)**
- Simulate a failed save (e.g. offline / force 500). Expect: pink "Could not save"
  message, **no** pop, **no** navigation; button still tappable to retry.

**3-theme QA**
- Repeat the signed-in happy path with `data-theme` = cyberpunk, kawaii, notepad
  (via theme-select). Confirm the pop reads correctly and nothing clips/jumps in
  each theme. Pop is transform-only so it should be visually consistent.

**Edge checks**
- Double-tap Save rapidly → only one save, one navigation (guard holds).
- Re-saving an existing `ms_session_id` session → navigates to the same entry,
  no duplicate session created.

## Verification checklist (definition of done)

- [ ] `npx tsc --noEmit` clean.
- [ ] Signed-in: Save pops then routes to `/app/journal-v2/{id}`; entry correct.
- [ ] Anon→saved: sign-in detour then Save pops + routes.
- [ ] Error path unchanged (message, no navigate).
- [ ] QA passes in all 3 themes.
- [ ] No changes outside `response/page.tsx`.
- [ ] Committed atomically.

## Rollback

Revert the single commit; behavior returns to "save in place, stay on page."
