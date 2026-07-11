# T-030-03 rn-primitives-storybook — Progress

Executed on `feat/storybook-clean`, one commit per plan step. All gates
(`npm run typecheck && npm run lint && npm test` in `mobile/`, plus
`npx expo export --platform ios`) green at every step.

## Step log

| Step | Commit | Status |
|---|---|---|
| 1 · Storybook infra | `feat(mobile): RN Storybook 10 on-device + themed decorator + smoke story` | ✅ |
| 2 · Icon + Button | `feat(mobile): token-driven Button + Icon primitives, press spring, stories` | ✅ |
| 3 · Surfaces | `feat(mobile): Card/HeadingCard, VentInput, Sheet, ChatBubble surfaces + stories` | ✅ |
| 4 · SVG + gradient | `feat(mobile): AreaIcon + SocialIcon (react-native-svg) and avatar-gradient parser` | ✅ |
| 5 · Composed cards | `feat(mobile): journal + mindmap composed cards with stories` | ✅ |
| 6 · Nav + ModeSwitcher | `feat(mobile): AppHeader + EntryAuthRow, shared ModeSwitcher` | ✅ |
| 7 · Reference + fonts | `feat(mobile): TriModes compare + Themes/Tokens reference story; icon font pinned FILL1/wght700, Inter statics for notepad` | ✅ |
| 8 · Final gate + review | this document + review.md | ✅ |

Final test count: **57 vitest tests, 12 files, all passing**; typecheck and
lint clean; iOS Hermes bundle exports cleanly with the full Storybook graph.

## Deviations from the plan (all documented in design.md/review.md)

1. **Step 1:** `@storybook/react-native` v10 deprecates `addons` in main.ts →
   used `deviceAddons`. CSF types come from `@storybook/react-native`
   re-exports (`@storybook/react` isn't hoisted by npm) — stories import
   `Meta`/`StoryObj` from there.
2. **Step 1:** the generated `.rnstorybook/storybook.requires.ts` is
   **committed**, not gitignored — `tsc --noEmit` needs it to exist, and it's
   stable config (`require.context`), not a per-story list. Regenerate with
   `npm run storybook:stories` after config changes only.
3. **Step 2:** `react-hooks/immutability` (eslint v6 rule) flags Reanimated
   shared-value writes; disabled file-scoped in `ui/motion.ts` only.
4. **Step 6:** AppHeader dropdown rows use the DS Button's own label
   typography (15px/theme tracking) instead of the web dropdown's bespoke
   14px/3px-tracking label span — one label system on RN instead of two.
   Menu trigger and bar are faithful.
5. **Step 7 (both best-efforts landed):**
   - Material Symbols TTF re-instanced (fonttools venv in scratchpad) to
     FILL=1 / wght=700 / GRAD=0 / opsz=24 — now matches Kate's web icon spec
     AND shrank the asset 15.1MB → 1.8MB. The pre-pin variable font is at
     scratchpad `MaterialSymbolsRounded.variable.bak.ttf` (session-temporary).
   - Inter downloaded (google/fonts OFL variable) and instanced to
     `Inter-Regular` (wght 400) / `Inter-SemiBold` (wght 600) statics;
     notepad body/btn/mono now map to them (fonts.ts), closing the T-030-02
     review concern #1. `build.test.ts` expectation updated accordingly.
6. **Sheet:** exit animations are entering-only (RN `Modal` unmounts
   instantly; keeping it mounted through an exit animation adds state
   machinery the T-030-04 composites should own if the design needs it).
7. **Typewriter:** not built — no web implementation exists to port
   (research.md); flagged for T-030-04's response screen.

## Regeneration notes

- `journal/social-svgs.ts` — regenerate by re-reading
  `V200/public/social/{theme}-{brand}.svg` (12 files) into the
  `SOCIAL_SVG` map (node script inlined in the session; any equivalent works).
- `mindmap/area-icon-paths.ts` — d-strings copied verbatim from
  `V200/src/components/mindmap/AreaIcon.tsx` `PATHS`.
- Font instancing: `python3 -m venv … && pip install fonttools` then
  `fonttools varLib.instancer <ttf> FILL=1 wght=700 GRAD=0 opsz=24`.

## Manual verification

On-simulator pass: see review.md (performed at Step 8 with the booted
iPhone 16 sim via `npx expo start --ios` → deep link to `/storybook`).
