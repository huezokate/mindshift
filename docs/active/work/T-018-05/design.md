# T-018-05 — Design

Goal: on a **successful** save, briefly pop-animate the Save button, then route to
`/app/journal-v2/{sessionId}`. Cover both signed-in and anon→saved flows. No
backend change — `sessionId` already returns from `POST /api/save-response`.

## Decision summary

- Drive the pop with **framer-motion `useAnimationControls`** on the Save button
  (framer is already imported and used in this file).
- After the pop resolves, `router.push(\`/app/journal-v2/${sessionId}\`)`.
- Keep `saveState` for guard/error/disabled logic; add the pop+navigate inside the
  success branch of `handleSave`.
- Sequence: POST success → store id → `setSaveState('saved')` → await pop → navigate.

## Options considered

### A. Framer `useAnimationControls` pop, then `router.push` (CHOSEN)

```ts
const saveControls = useAnimationControls()
// success branch:
sessionStorage.setItem('ms_session_id', data.sessionId)
setSaveState('saved')
await saveControls.start({
  scale: [1, 1.3, 0.92, 1],
  transition: { duration: 0.42, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
})
router.push(`/app/journal-v2/${data.sessionId}`)
```

Make the Save button a `motion.button` with `animate={saveControls}` and keep
`whileTap={{ scale: 0.95 }}` for press feedback (matches lens/onboarding).

- **Pros**: framer already in module; declarative keyframe; `start()` returns a
  promise so "then navigate" is a clean `await` — no `setTimeout` races; respects
  the existing `whileTap` idiom; theme-agnostic (pure transform).
- **Cons**: button must become `motion.button` (trivial). Slight coupling of the
  visual flourish to the navigation await.

### B. CSS `@keyframes pop` + `onAnimationEnd` → navigate

Add `@keyframes pop` to `globals.css`, toggle a class on save, navigate in the
button's `onAnimationEnd`.

- **Pros**: no framer controls; pop lives with other keyframes.
- **Cons**: `onAnimationEnd` fires per-property and can double-fire / need name
  guarding; class lifecycle (add then must reset) is fiddlier than an awaited
  promise; more state to manage than Option A for the same result. Rejected —
  more moving parts, weaker sequencing guarantee.

### C. `setSaveState('saved')` + `setTimeout(navigate, 400)`, CSS transition for pop

- **Pros**: minimal.
- **Cons**: timeout duration must be hand-synced to the CSS transition; brittle if
  durations drift; no real "animation finished" signal. Rejected — fragile timing.

### D. Navigate immediately, run pop on the detail page entry

- **Pros**: detail page can own an arrival animation.
- **Cons**: ticket explicitly wants the pop **on Save then navigate** ("pop-animate
  and then navigate"). The flourish belongs to the act of saving, on the response
  screen. Rejected — wrong UX per FigJam 95:2236.

## Why A

Option A is the smallest change that gives a *guaranteed* "animation done →
navigate" ordering (awaited promise, not a timer), reuses the framer dependency and
`whileTap` convention already in `response/page.tsx`, and needs zero CSS or backend
changes. The pop is a transform-only animation, so it renders identically across
cyberpunk/kawaii/notepad.

## Flow handling

- **signed-in**: tap → `saving` → POST 200 → `saved` → pop → navigate. ✅
- **anon→saved**: tap while `!isSignedIn` → existing redirect to
  `/sign-in?reason=save&redirect_url=/app/response`. After auth the user returns to
  `/app/response` (session-storage state intact), taps Save again, now signed in →
  same success path → pop → navigate. The pop/navigate is bound to POST success, so
  it never fires on the redirect tap. ✅
- **error**: POST fails → `setSaveState('error')`, no pop, no navigate, pink message
  shown (unchanged). ✅

## Edge cases & details

- **Double-tap**: existing guard `if (saveState === 'saving' || saveState === 'saved') return`
  prevents re-entry. Because we navigate after `saved`, the page unmounts anyway.
- **Re-save of existing session**: `ms_session_id` already set → API upserts and
  returns the same `sessionId`; we still navigate to it. Correct.
- **`prefers-reduced-motion`**: pop is a brief scale; acceptable. Optional nicety —
  could shorten/skip, but not required by AC. Keep simple; note in review.
- **Pop duration** ~420ms: long enough to read as a "pop", short enough not to feel
  laggy before navigation.
- **Detail page auth**: guaranteed signed-in at navigation time (save 401s for anon),
  so the `[id]` page's `auth()` guard passes and the just-saved row is found.

## Out of scope

- No changes to `save-response` route or DB.
- No changes to the footer "Converse"/"Try another"/"New" buttons.
- No new arrival animation on the detail page.
