# MindShift — Next session to-do (written 2026-06-14)

## Where things stand (shipped this session)
- **Journal frontend SHIPPED to prod** — merged `feat/landing-figure-vent` → `main` (Vercel auto-deploys). Feed + entry detail, 3 themes, AppHeader nav + dropdown, Material Symbols icons, real per-theme portraits, social badges, "Vent it out" / "+Lens" CTAs.
- **Migration 004 applied to prod DB** — `vent_sessions.title` column exists (for AI titles).
- **Comp allowlist live** — `test@minds-shift.com` = pro (unlimited), in `src/lib/user-tier.ts` `COMP_EMAILS`.
- **Repos untangled** — `MindShift/` has worktrees `website/` (feat/website) + `mindmap/` (feat/mindmap-flow); journal = root on `main`. TimeLens + strawberry-farm split into their own projects. Home `~` de-gitted. lisa scoped to MindShift (`docs/active/` = story **S-018** only; older tickets archived in `docs/archive/`).
- ⚠️ **Lisa-worker screens shipped without direct review** — response-screen footer cleanup, sign-in/theme-select arrows, Gemini-title scaffolding. Eyeball on prod; revert any single commit if off.

## Key facts for next session
- Supabase project ref: `wwszertnwbsdwbkzrupk` (one project). Migrations in `V200/supabase/migrations/`.
- Save logic (Kate): **anon = explicit Save button** (→ pop → journal); **signed-in = auto-save** vent + all lenses (no button). Tracked on ticket T-018-05.
- Tiers: anon 3 lenses/day · free 3 quotes/day, 5 lenses/quote · pro unlimited. Logic in `src/lib/user-tier.ts`.
- Figma source of truth — always `get_design_context`, match exactly, tokens only. For Figma *builds*, load `figma-generate-design` + bind real design-system variables/styles/components (don't hardcode). Note: the use_figma plugin has Google-Fonts only (no OS "Georgia").
- lisa is clean for MindShift — `cd ~/Documents/projects/MindShift && lisa loop` will only schedule S-018.

## ▶ DO FIRST — Journal backend (close the shipped feature)
1. **Verify end-to-end on prod** signed-in: vent → lens → save → appears in `/app/journal-v2` → detail page loads. Fix any API/RLS gaps.
2. **Save-by-tier (T-018-05):** anon Save button persists; signed-in auto-saves vent + all applied lenses. Wire to `save-response` API.
3. **Gemini entry titles (T-018-07):** call `/api/generate-title` on save → persist to `vent_sessions.title` (column exists). Falls back to first-words if it fails.
4. **Lens-picker popup (T-018-04):** the `onAddLens` stub on feed + the "+Lens" button on detail → open picker → add lens to an existing entry, tier-gated (free 3/entry, pro unlimited).
5. **Review/polish the worker-shipped screens** (response footer, sign-in/theme-select #1/#4).

## ▶ THEN — Mindmap + its backend (the bigger build)
6. Mindmap **schema migration** (goals / milestones / weekly_goals / check-ins — draft in `V200/SESSION_CONTEXT.md`).
7. **Gemini generation** — WOOP/scope input → weekly goals + milestones at the chosen cadence.
8. **Persistence + auth/email** — gate map creation or capture email; wire save/load.
9. **Mindmap frontend** — reconcile feat/mindmap-flow with the latest Figma; match design-system styles.

## ▶ LATER (roadmap order)
10. **Clerk billing** — free-premium passcode/comp (recruited users free; stumble-on users must pay). Comp allowlist already exists as a stopgap.
11. **Ship + campaign.**
12. **Gemini response-quality tuning** (audit the lens responses).
13. **Weekly goals + Monday email** (Resend; `hello@minds-shift.com` verified).

## Queued (parallel, non-blocking)
- **Code → Figma component inventory** at node `603:6971` (cyberpunk first) — once journal components are final. Needs `figma-use` + `figma-generate-library`.
- Redo the **share card in Figma** (node `534:4003`) on real design-system styles/components (current one is hardcoded + Inter placeholder avatar).
