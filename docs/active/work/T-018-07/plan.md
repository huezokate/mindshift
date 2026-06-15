# T-018-07 — Plan: sequenced steps

Each step is independently committable. Steps 2–4 are the backend; 5–7 the read
path. Verification is mostly type-check + manual flow (no test harness exists in
the repo — see Testing).

## Step 1 — Schema migration
- Add `V200/supabase/migrations/004_entry_titles.sql`:
  `alter table vent_sessions add column if not exists title text;`
- Apply via Supabase MCP `apply_migration` (project ref `wwszertnwbsdwbkzrupk`)
  OR document for manual run. Verify with `list_tables` that `title` exists.
- **Commit:** `feat(db): add title column to vent_sessions (T-018-07)`

## Step 2 — Title generator lib
- Create `V200/src/lib/title.ts` with `deriveTitleFallback` (pure) and
  `generateVentTitle` (async, Gemini via **dynamic import** so the module stays
  client-safe).
- `generateVentTitle`: build system prompt, cap vent at 800 chars, `Promise.race`
  a 4s timeout, `cleanTitle()` the output, fall back on any error/empty.
- Verify: `npx tsc --noEmit` passes; `deriveTitleFallback('a b c d e f g')`
  returns `'a b c d e f'`.
- **Commit:** `feat(title): gemini vent-title generator + deterministic fallback (T-018-07)`

## Step 3 — Persist title at save
- Edit `V200/src/app/api/save-response/route.ts`: import `generateVentTitle`,
  compute `title` in the new-session branch, add to the insert payload.
- Verify: type-check; reading the diff, the existing-session branch is untouched
  and the return shape is unchanged.
- **Commit:** `feat(save): generate + persist gemini title on new session (T-018-07)`

## Step 4 — Generate-title route
- Create `V200/src/app/api/generate-title/route.ts` (POST, Clerk-guarded,
  `{ ventText } → { title }`).
- Verify: type-check; route shape matches sibling routes.
- **Commit:** `feat(api): POST /api/generate-title route (T-018-07)`

## Step 5 — Type + read paths
- `journal-types.ts`: add `title?: string | null` to `JournalEntry`.
- `api/journal-v2/entries/route.ts`: add `title` to `RawSession`, both selects,
  and the normalized map.
- `journal-v2/[id]/page.tsx`: add `title` to `RawSession`, the select, and the
  built entry.
- Verify: type-check.
- **Commit:** `feat(journal): carry title through feed + detail read paths (T-018-07)`

## Step 6 — Render title in components
- `JournalPreviewCard.tsx` + `EntryDetail.tsx`: import `deriveTitleFallback`,
  replace the inline `slice(0,6)` title with
  `entry.title?.trim() || deriveTitleFallback(entry.vent_text)`.
- Verify: type-check; visually the uppercase render path is unchanged.
- **Commit:** `feat(journal): prefer persisted title, fall back to derived (T-018-07)`

## Step 7 — Final verification + review
- Run `npx tsc --noEmit` (or `npm run build` if fast) for the whole app.
- Run `npm run lint` if present.
- Write `review.md`.

## Testing strategy

The repo has **no automated test harness** (no `__tests__`, no jest/vitest
config observed). Verification is therefore:

1. **Type safety** — `npx tsc --noEmit` after each step is the primary gate.
   Catches select/type drift between read paths and `JournalEntry`.
2. **Pure-function sanity** — `deriveTitleFallback` is trivially checkable; if a
   test harness is added later this is the unit to cover (deterministic, no I/O).
3. **Manual flow (documented for the human reviewer in review.md):**
   - Sign in → vent → pick lens → Save → land on detail page → header shows a
     Gemini "<synonym> on <topic>" title (uppercased).
   - With `GOOGLE_GEMINI_API_KEY` unset / network blocked → Save still succeeds,
     header shows the first-words fallback (graceful fallback AC).
   - Reload feed → card shows the same persisted title.
   - Load demo → demo cards show first-words fallback (no Gemini calls).
4. **Migration check** — `list_tables` / a `select title from vent_sessions
   limit 1` confirms the column.

## Verification criteria (maps to AC)

- AC1 "Gemini route returns a short '<synonym> on <topic>' title" →
  `POST /api/generate-title` + `generateVentTitle`.
- AC2 "Title persisted and shown on feed cards + detail header; graceful
  fallback" → `title` column written at save, read into both surfaces, with the
  three-layer fallback from design.md.

## Risks / mitigations

- **Save latency** from the extra Gemini call → 4s `Promise.race` cap + instant
  fallback. Save UX already animates.
- **Client-bundle leakage** of the Gemini SDK via the shared module → dynamic
  `import()` inside `generateVentTitle`; top-level stays pure. Verify the client
  components compile without pulling server-only deps.
- **Schema-before-write ordering** → migration is Step 1; `add column if not
  exists` is safe to re-run.
