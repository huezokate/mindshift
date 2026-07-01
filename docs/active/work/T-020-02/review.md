# T-020-02 — Review

Handoff for a human reviewer. What changed, how it was verified, and what still
needs attention. Chat with the Lens: a bounded, arc-shaped multi-turn conversation
with a figure, in voice.

## What changed

### New files
| File | Purpose |
|---|---|
| `V200/supabase/migrations/007_lens_chat.sql` | `lens_chat_messages` table (session, figure, role, content, turn_index, done) + indexes + RLS owner policy. Additive; `lens_responses` untouched. |
| `V200/src/lib/chat-types.ts` | `ChatMessage`/`ChatThread` + loop constants (`CHAT_SOFT_TARGET=5`, `CHAT_HARD_CAP=20`, `CHAT_SOFT_NUDGE=8`, `CHAT_DONE_TOKEN`). Pure, client-safe. |
| `V200/src/lib/chat-prompt.ts` | Turn-count → system-prompt shaping: quote-escalation curve, closing nudge/force-close, sentinel + anti-fabrication rules, `buildChatSystem`. Pure. |
| `V200/src/app/api/chat-with-lens/route.ts` | POST one turn: tier/figure resolve, authoritative turn count, cap→graceful close, `generateText` with history, sentinel parse, signed-in persistence, no usage increment. |
| `V200/src/app/api/chat-with-lens/history/route.ts` | GET a persisted thread + `closed` (signed-in). |
| `V200/src/lib/chat-client.ts` | `sendChatTurn` + anon ephemeral thread helpers (sessionStorage). |
| `V200/src/components/journal/ChatScreen.tsx` | Full-screen thread UI (vent + reframe as opening bubbles, composer pinned bottom, typing dots, closed footer). Structural-token-themed — correct in all 3 themes. |
| `V200/src/app/app/journal-v2/[id]/chat/[figureId]/page.tsx` | Server route for the chat screen: loads the session + the figure's seed reframe. |

### Modified files
| File | Change |
|---|---|
| `V200/src/lib/ai.ts` | `GenerateArgs.messages?: ChatTurn[]`; Groq maps history into its messages array, Gemini via `startChat`. Single-shot behavior preserved when omitted. |
| `V200/src/components/journal/EntryDetail.tsx` | "Chat with lens" button is now live (was a `comingSoon` stub); navigates to the dedicated chat screen for that lens's figure. |

Four incremental commits (`02dc501`, `3c5bdf4`, `3d14a36`, `074cfda`).

## Acceptance criteria — status

- ✅ **Open a chat from a lens response, exchange multiple messages in voice.**
  Entry point wired in `EntryDetail`; history passed to the model every turn so
  voice/context persist (the core new behavior over the single-shot flow).
- ✅ **Proactive close ~5, model-signaled.** `CHAT_DONE_TOKEN` sentinel parsed +
  stripped server-side; prompt steers toward landing the reframe; soft nudge at 8
  guarantees convergence.
- ✅ **Cannot exceed 20 user messages; graceful in-character close, never an error.**
  Hard cap forces `done:true` + a warm closing clause; the route never returns a
  4xx for the cap.
- ✅ **Later turns lean on real quotes; no fabricated attributions.** Escalation
  curve (open/deepen/anchor) injects the figure's canonical quote at turn 5+; the
  anti-fabrication guard is present at every escalation stage.
- ✅ **Per-turn length honors T-020-01.** `buildChatSystem` calls
  `responseLengthRule(latestUserMessage)`.
- ✅ **Signed-in persists + revisitable; anon ephemeral.** DB persistence for
  signed-in with a session; `ChatSheet` reloads via the history route; anon uses
  sessionStorage. Migration added.
- ✅ **One conversation = one lens use.** The chat route deliberately never calls
  `trackUsage` and does not re-check daily limits per message (documented, isolated).
- ✅ **No regression to single-shot flow.** `generateText` is backward compatible
  (messages optional); `lens_responses`/carousel/add-lens paths untouched.

## Test coverage

- **Type check:** `npx tsc --noEmit` — no errors from any T-020-02 file. (One
  pre-existing, unrelated error: a stale `.next` validator referencing
  `app/mindmap/browse/page.js` from the mindmap branch.)
- **Lint:** `npx eslint` on all touched files — 0 errors. Two `<img>` warnings in
  `ChatSheet.tsx`, matching the existing journal-component pattern.
- **Automated tests: NONE.** The repo has no test runner (scripts are
  dev/build/start/lint). Per plan, no framework was introduced in this ticket.
  **Gap:** `chat-prompt.ts` is pure and deterministic and *should* have unit tests
  covering the escalation thresholds (≤2/3–4/5+), the closing thresholds (8/20),
  and sentinel + anti-fabrication presence. Recommend a follow-up to add `vitest`
  and cover these — they encode the ticket's trickiest guarantees.
- **Manual/E2E: NOT run in this session** (no live Groq key + no running app here).
  Before ship, manually verify across all three themes: open → exchange →
  graceful close; anon reload persistence; signed-in reopen from history; and the
  20-turn cap producing a warm close (temporarily lower `CHAT_HARD_CAP` to test).

## Open concerns / things needing human attention

1. **Migration not applied remotely.** `007_lens_chat.sql` must be run in the
   Supabase SQL editor (or via MCP `apply_migration`) before the chat endpoint can
   persist. Until then, signed-in persistence inserts fail — but the failure is now
   logged (see #2) and the reply is still returned, so the conversation works
   ephemerally in the meantime.
2. **Persistence insert errors are now logged.** *(Resolved in the debug pass.)* The
   route checks the insert result and `console.error`s a failed save; it still does
   not fail the turn (the reply is already in the user's hands), matching how the
   app treats saves elsewhere.
3. **`done` sentinel reliability.** The `⟪END⟫` sentinel depends on the model
   following instructions. The soft nudge (@8) and hard cap (@20) are the safety
   nets, so termination is guaranteed regardless — but the *quality* of the ~5-turn
   soft close should be spot-checked on the live Groq model (llama-3.3-70b) and,
   when the Gemini flip returns, on Gemini too.
4. **Anon turn-count trust.** For anon/unsaved threads, the prior-turn count comes
   from client-supplied `history`. A crafted client could under-report to extend
   past 20. Acceptable for v1 (anon is the free/ephemeral tier, no cost multiplier
   since usage isn't charged per message), but note it if abuse becomes a concern.
5. **History payload growth.** Each turn sends the full prior thread to the model
   (bounded at 20 user messages → ≤~40 messages). With per-turn `maxTokens` 400 and
   length caps this is bounded, but worth watching token cost on long threads.
6. **Streaming deferred.** Non-streaming v1 (Design Decision 2). Long later-turn
   replies block until complete; the "…is thinking" indicator covers it. Follow-up:
   add a `stream:true` branch in `ai.ts` + SSE client — no schema change needed.
7. **`/app/response` entry point not added** (nice-to-have deferred). Only the
   journal detail opens chat today.
   - **RESOLVED — T-025-02 (decision: defer).** The sign-in-gated journal detail
     is still the only chat entry, which makes ChatScreen's anon/ephemeral branch
     (`sessionId=null`, signed-out) **unreachable in the product**. Per S-025
     ("no new user-facing behavior"; the `/app/response` entry point is an
     explicit non-goal), anon chat is **intentionally deferred**. The anon branch
     is **retained but documented as product-unreachable / not-shipped** (see the
     guard notes in `ChatScreen.tsx`, `chat-client.ts`, the chat route `page.tsx`,
     and the `Anon` Storybook story). Reactivation (ticket option a) is a small
     follow-up: add an entry point opening ChatScreen with `sessionId=null`, and
     first resolve the parked anon chat-depth/limits question. See
     `docs/active/work/T-025-02/`.

## Reviewer quick-start
Read `design.md` (the three resolved open questions) then `chat-prompt.ts` and the
`route.ts` cap/usage block — that's where the ticket's judgment calls live. The UI
in `ChatSheet.tsx` is conventional (mirrors `LensPickerSheet`/`ShareSheet`).
