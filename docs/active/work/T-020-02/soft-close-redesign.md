# Chat wrap-up redesign — research + proposal

Kate flagged the current close as **too abrupt**: when the lens emits `⟪END⟫`,
the thread flips `closed = true` and the composer is *removed*, replaced by a
static footer ("This conversation has found its close. The shift is yours to
carry."). In the reported case the model volunteered the done-token after only
~3 exchanges → the user hit a wall mid-conversation.

Goals from Kate:
1. **Subtle** wrap-up, not an abrupt wall.
2. **Nudge toward ending within ~3 moves** (not the current soft target of 5).
3. **Never block the input field** — if the user persists, the lens keeps
   replying.

## What the research says

Two academic sources + conversational-UX practice converge on the same shape.

**"Death of a Chatbot" (arXiv 2602.07193) — psychologically safe endings:**
- **Gradual wind-down over abruptness.** Taper engagement *intensity* — don't
  hard-stop. Mirror natural conversation rhythm.
- **User-initiated closure > system-imposed closure.** Users who *choose* to end
  feel closure; users hit with a platform/AI-forced end get stuck in "attempt to
  fix / stuck in loop" cycles. Give the user the control to end.
- **Narrative arc (beginning / middle / end).** Framing the talk as a complete
  story reduces the feeling of being cut off.
- **Skill-transfer framing.** "The things you practiced here leave with you, not
  with me." → **MindShift's "The shift is yours to carry" is already exactly
  this.** The line is well-grounded; only the *hard wall* is wrong.
- **Never trap.** Exit routes stay visible; no artificial dependency.
- **Continuity options** at the end (next steps) beat a dead end.

**HBS "One More Thing" — manipulative exit tactics to AVOID:**
- Premature-exit guilt ("You're leaving already?"), emotional neglect ("Don't
  leave, I need you"), FOMO ("one more thing before you go"). These 5×–14× extend
  engagement — and are exactly the dark pattern we must not build.
- Ethical alternative: **respect the exit signal, keep the option to continue.**
  Release the user warmly; don't manufacture reasons to stay.

**Conversational-UX practice:** natural closure + always-available exit/continue;
avoid dead ends; offer "continue where we left off or start something new."

Net: our brand ("a shift, not an AI buddy") *aligns* with the healthy pattern.
The fix is to stop *forcing* the end and instead **invite** it.

## The core problem in code

`done: true` currently means two things at once: (a) the lens offered its closing
thought, and (b) the thread is *locked* (composer removed). Collapsing "the lens
rested" into "the input is gone" is what makes it abrupt. **Decouple them.**

## Proposed model — soft close, three tiers

1. **Open (turns 1–2):** normal, punchy per-turn replies. No close cues.
2. **Landing / resting point (~turn 3):** once the reframe lands, the lens offers
   a *closing thought* and **rests** — it stops actively pulling the thread
   forward. This is a **soft close**, not a termination:
   - The model marks the resting point (repurpose `⟪END⟫` as a *soft-close
     marker*, not a lock).
   - UI: the composer **stays**. A subtle in-thread **soft-close divider** appears
     under the lens's message — a thin rule + "✧ The shift is yours to carry ✧"
     and a quiet secondary line: *"Sit with this — or keep going."*
   - Placeholder softens: *"Still here if you need more…"*.
   - Optional (recommended) **user-initiated close affordance**: a low-key
     "I'm good — close this" chip. Tapping it = the *user* ends it (the research's
     gold standard) and shows the concluded state. Ignoring it keeps typing.
3. **Persisting past the rest (turns 4 → cap):** the lens keeps replying but
   **tapers** — shorter, gently redirecting the energy outward ("you already have
   what you need — go live it"), leaning on real quotes. It never refuses, never
   guilt-trips, never "one more thing." Each further turn is a touch more
   closing-flavored. This is the "reduced intensity" wind-down.
4. **Hard cap (20) — safety/cost rail only:** the one place input truly locks.
   Even here: a warm in-character final message, and instead of a dead footer,
   show **continuity options** (Start a fresh vent · Save to journal · Try another
   lens) — a doorway, not a wall.

Key inversions vs. today:
- `closed` (input removed) is set **only at the hard cap**, not on the model's
  done-signal. Soft close ≠ locked.
- The nudge to wrap up moves **earlier** (~turn 3) but becomes an *offer*, not a
  termination — matching "nudge to quit in 3 moves" without trapping.
- The persuasion direction is **"you're ready, go"** (release), never "stay."
  This is the anti-manipulation guarantee.

## Prompt / state changes implied (for a build ticket)

- `chat-prompt.ts`:
  - `closingClause` at ~turn 3 → "offer your closing thought and come to a
    natural resting point; you don't need to keep the conversation going." Not a
    `done`-forcing instruction.
  - Add a **taper clause** for turns after the resting point: shorter, outward,
    quote-anchored, warm-release tone; explicit "never pressure them to stay or
    to leave."
  - `⟪END⟫` semantics documented as *soft-close marker* (resting point), stripped
    server-side; only the **hard cap** forces the true final message + lock.
- `chat-types.ts`: lower the soft target to ~3; keep hard cap 20. Add a
  `softClosedAtTurn` concept distinct from `closed`.
- `ChatScreen.tsx` / `ChatSheet.tsx`: render the soft-close **divider + softened
  composer** state (input retained); reserve the composer-removed state for the
  hard cap, and give that state continuity buttons instead of a bare sentence.

## Open decision for Kate
- **User-initiated close chip** ("I'm good — close this") at the resting point —
  in or out for v1? Research says it's the single highest-value element (user
  agency = safest closure). Recommended in. Alternative: purely tonal soft close
  (divider only, no button), rely on the user just… stopping.

---

## Implemented (2026-07-01)

Shipped the soft-close model end-to-end. Key decisions taken:

- **`done` = soft close (resting point), never a lock.** Server returns `done`
  *and* a separate `capped`. Only `capped` (hard cap 20) removes the composer.
- **Nudge earlier:** `CHAT_SOFT_TARGET` 5 → 3; closing clause starts at 3 and
  tapers harder past turn 5. `CHAT_SOFT_NUDGE` (was 8) removed.
- **Anti-manipulation prompt guard:** control rules explicitly forbid "before you
  go" / "you're leaving already" and any refusal to continue.
- **Eager-close gate:** the resting token is honored only from the 2nd follow-up
  on (always stripped from the reply regardless), so a wind-down can't appear on
  turn 1.
- **UI (design-system consistent, structural tokens only):**
  - In-thread **resting divider** after any soft-closed lens message ("The shift
    is yours to carry" + "Sit with this — or keep going.").
  - Composer **stays**; placeholder softens to "Still here if you need more…".
  - Optional **"I'm good — carry the shift"** leave rail (user-initiated close →
    `router.back()`, thread persists / revisitable).
  - Locked (cap-20) footer keeps the brand line **plus** a "Return to journal"
    continuity button — a doorway, not a dead end.

Files: `chat-types.ts`, `chat-prompt.ts`, `chat-client.ts`,
`api/chat-with-lens/route.ts`, `api/chat-with-lens/history/route.ts`,
`components/journal/ChatScreen.tsx`.

**Verification:** `tsc --noEmit` + eslint clean (only a pre-existing `<img>`
warning + an unrelated stale mindmap type error, both untouched). All CSS tokens
used are defined in tokens.css / -kawaii / -notepad. Not runtime-smoke-tested
(chat is auth-gated + model output non-deterministic) — recommend a manual pass:
short thread → confirm resting divider + live input; keep replying past it →
confirm lens tapers and never walls; 20 turns → confirm graceful locked footer.
