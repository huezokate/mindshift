# T-020-02 — Progress

Tracks execution of `plan.md`. All 8 steps complete. Committed incrementally on
`STALE-feat/mindmap`.

## Completed

- [x] **Step 1 — Migration** `V200/supabase/migrations/007_lens_chat.sql`
  Additive `lens_chat_messages` table + indexes + RLS owner policy. `lens_responses`
  and its unique constraint untouched. Not yet applied to the remote Supabase
  project (file is the deliverable; apply via SQL editor / MCP out of band).
- [x] **Step 2 — Types** `src/lib/chat-types.ts`
  `ChatRole`/`ChatMessage`/`ChatThread` + `CHAT_SOFT_TARGET=5`, `CHAT_HARD_CAP=20`,
  `CHAT_SOFT_NUDGE=8`, `CHAT_DONE_TOKEN='⟪END⟫'`.
- [x] **Step 3 — Prompt shaping** `src/lib/chat-prompt.ts`
  `quoteEscalationClause` (open ≤2 / deepen 3–4 / anchor 5+, canonical quote
  injected), `closingClause` (soft nudge @8, forced close @20), `chatControlRules`
  (sentinel + plain-prose), `buildChatSystem` (persona + control + escalation +
  closing + `responseLengthRule` on the latest message).
- [x] **Step 4 — `ai.ts` multi-turn** optional `messages?: ChatTurn[]` on
  `GenerateArgs`; Groq maps history into its OpenAI-style array (lens→assistant),
  Gemini replays via `startChat({ history })` (lens→model). Single-shot behavior
  preserved when `messages` omitted — both existing callers unaffected.
- [x] **Step 5 — Turn endpoint** `src/app/api/chat-with-lens/route.ts`
  Tier/figure resolve, authoritative prior-turn count (DB for persisted, history
  for anon), cap→forceClose, `buildChatSystem`, `generateText` with assembled
  context (vent + seed reframe + history), sentinel parse+strip, signed-in
  persistence (2 rows/turn), **no `trackUsage`**, fail-loud 400/502.
- [x] **Step 6 — History + client** `history/route.ts` (signed-in ordered thread +
  `closed`) and `src/lib/chat-client.ts` (`sendChatTurn`, anon
  `loadAnonThread`/`saveAnonThread` via sessionStorage).
- [x] **Step 7 — `ChatSheet.tsx`** bottom-sheet thread UI: seed reframe as opening
  lens bubble, optimistic user bubble w/ rollback on error, typing indicator,
  graceful closed footer, composer disabled when closed, token-themed, anon
  ephemeral vs signed-in persisted load.
- [x] **Step 8 — Wire entry point** `EntryDetail.tsx`: "Chat with lens" button is
  now live (was a `comingSoon` stub) and opens `ChatSheet` seeded by the vent +
  that lens's reply. Carousel/add-lens flow untouched.

## Verification done

- `npx tsc --noEmit`: no errors from any T-020-02 file. (One pre-existing error
  from a stale `.next` validator referencing a mindmap page — unrelated.)
- `npx eslint` on all new/modified files: 0 errors. Two `<img>` warnings in
  `ChatSheet.tsx` — the same pattern used across `LensCard`/`LensPickerSheet`
  (Material-Symbols-only, no `next/image` in journal components), so left as-is.
- Fixed one lint error mid-implementation: `set-state-in-effect` in the load
  effect — restructured so all state updates happen inside async callbacks.

## Deviations from plan

- **`seedReply` added to the request/client contract.** The route needs the
  original reframe as model context (the seed lens bubble), and it is not derivable
  server-side without an extra query. Passing it from the client (`lens.response_text`,
  already in hand) is cheaper and keeps the route stateless for anon. `chat-client`
  and `ChatSheet` thread it through. Not a behavior change — just an explicit field.
- **No `/app/response` chat button** in v1 (Design marked it nice-to-have). The live
  entry point is the journal detail, which always has a `sessionId`. Left for a
  cheap follow-up rather than reworking the sessionStorage-driven response page.
- **No automated test files added.** The repo has no test runner (`package.json`
  scripts are dev/build/start/lint only). Per plan, did not introduce a framework in
  this ticket. The pure `chat-prompt.ts` logic is the intended unit-test surface —
  flagged as a gap in `review.md`.

## Post-review revisions (Kate feedback)

- **Debug pass (route robustness).** Signed-in threads now rebuild model context
  and `turn_index` from the DB (authoritative) instead of trusting the client's
  optimistic history — prevents drift and `turn_index` collisions. Persist failures
  are now logged (`console.error`) rather than silently swallowed.
- **Popup → dedicated screen.** Replaced the `ChatSheet` bottom-sheet modal with a
  full-screen route `src/app/app/journal-v2/[id]/chat/[figureId]/page.tsx` +
  `ChatScreen.tsx`. The vent and the lens's first reframe now open the thread as
  real chat bubbles; the composer is pinned at the bottom. "Chat with lens" in
  `EntryDetail` navigates to this route (was: opened the sheet). `ChatSheet.tsx`
  deleted. NOTE: the earlier `structure.md`/`plan.md` describe the sheet approach —
  superseded by this screen.
- **Theme-correct styling.** The chat UI now uses ONLY the structural token
  families (`--card-*`, `--input-*`, `--btn-*`, `--text-*`), never the raw
  `--cyan/--pink/--green` accent slots — those collapse to one magenta in kawaii
  (per the `Button.tsx` "The Rule" note). Fixes the "kawaii buttons look cyberpunk"
  report. Verified it reads correctly in all three themes structurally.

## Not done (intentionally deferred — see design.md)

- Streaming (non-streaming v1, per Design Decision 2).
- Tier-gated chat depth (S-020 non-goal; usage/cap logic isolated for the flip).
- Pre-loading the persisted thread in the detail server component (lazy-load via the
  history GET route instead).
- Remote application of migration `007` (out-of-band, like prior migrations).
