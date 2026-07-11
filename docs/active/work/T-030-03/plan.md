# T-030-03 rn-primitives-storybook — Plan

Eight steps, each independently verifiable and committed atomically on
`feat/storybook-clean`. Commit prefix `feat(mobile):` / `chore(mobile):`,
suffix `(T-030-03)`. Gate for every step: `npm run typecheck && npm run lint
&& npm test` inside `mobile/` stay green.

## Step 1 — Storybook infrastructure boot
1. `npm i -D storybook@^10.5 @storybook/react-native@^10.5
   @storybook/addon-ondevice-controls@^10.5 @storybook/addon-ondevice-actions@^10.5`
   and `npm i @gorhom/bottom-sheet@^5 expo-linear-gradient@~57` (via
   `npx expo install` for the SDK-pinned one).
2. Create `metro.config.js` (expo default + `withStorybook`), `.rnstorybook/`
   (main.ts, index.tsx, preview.tsx with `withTheme` decorator — initially
   wrapping ThemeProvider + bg paint; ModeBar chips arrive with Step 6's
   extraction, so Step 1 uses a minimal inline mode-cycler button).
3. Route `src/app/storybook.tsx` (`__DEV__` gate). `.gitignore` the generated
   requires file. Add a `smoke.stories.tsx` (token-colored square + label).
4. **Verify:** `npx expo export --platform ios` bundles clean (proves module
   graph incl. SB); typecheck/lint/test green. On-device smoke = deferred to
   Step 8's manual pass (documented).
   *Commit 1: `feat(mobile): RN Storybook 10 on-device + themed decorator + smoke story (T-030-03)`*

## Step 2 — Icon + Button primitives
1. `ui/icon.tsx`; migrate `MsIcon` usages (grep) and delete `ms-icon.tsx`.
2. `ui/button-logic.ts` (pure resolver) + `ui/button-logic.test.ts`:
   for each of the 3 modes assert primary/secondary/secondary2 resolve to that
   mode's family values, secondary=blue-positive vs secondary2=red-negative
   (reuse expected hexes from `build.test.ts`'s accent assertions), sizing
   (primary 56/12/16, secondary 45/8/12), disabled opacity 0.6.
3. `ui/motion.ts` (`usePressScale`, `useSavePop`) — press spring mirrors web
   `.ds-btn` (active 0.93, springy return ≈ cubic-bezier(0.34,1.56,0.64,1)).
4. `ui/button.tsx`: variants + subtext + icon/iconSize + icon-only square +
   fullWidth + disabled; Text styling from `t.fonts.btn`, letterSpacing,
   uppercase (web parity); filter only on primary (notepad offset shadow).
5. Stories per structure.md §C (SemanticPair story waits for TriModes — Step 7
   adds the 3-up wrap; Step 2 ships it single-mode).
6. **Verify:** unit tests pass (accent-swap AC now machine-checked); export
   bundles.
   *Commit 2: `feat(mobile): token-driven Button + Icon primitives, press spring, stories (T-030-03)`*

## Step 3 — Shared surfaces
1. `ui/card.tsx` (Card, HeadingCard), `ui/vent-input.tsx` +
   `vent-input-logic.ts/.test.ts` (counter color flip at warnAt),
   `ui/sheet.tsx` (Modal + Reanimated reveals, positions/chromes),
   `ui/chat-bubble.tsx` (ChatBubble + TypingDots).
2. Stories: card, vent-input (Empty/Filled/OverWarn), sheet (Bottom, Center —
   open-state controls), chat-bubble (User/Lens/Conversation w/ TypingDots).
3. **Verify:** tests+typecheck; export.
   *Commit 3: `feat(mobile): Card/HeadingCard, VentInput, Sheet, ChatBubble surfaces + stories (T-030-03)`*

## Step 4 — SVG + gradient foundations
1. `theme/gradient.ts` + test against the three skins' real
   `--fig-avatar-grad` strings (from `themes[mode].fig.avatar.gradientCss`);
   export from `@/theme`.
2. `mindmap/area-icon-paths.ts` (d-strings read from
   `V200/src/components/mindmap/AreaIcon.tsx`) + completeness test;
   `mindmap/area-icon.tsx`.
3. `journal/social-svgs.ts` — inline the 12 XMLs from `V200/public/social/`
   (scripted read → file authoring) + map/alias test; `journal/social-icon.tsx`.
4. Stories: area-icon (Single, AllAreas), social-icon (grid of platforms).
5. **Verify:** all new pure tests green.
   *Commit 4: `feat(mobile): AreaIcon + SocialIcon (react-native-svg) and avatar-gradient parser (T-030-03)`*

## Step 5 — Composed journal/mindmap cards
1. Read each web source before porting: `UpcomingChip.tsx`, `AuthBanner.tsx`,
   `WelcomeCard.tsx`, `MindmapAreaCard.tsx`, `LensResponseCard.tsx`,
   `JournalPreviewCard.tsx` (faithful port of layout + per-theme branches;
   theme branching via `t.mode` where the web branches on theme).
2. `journal/journal-types.ts` + `__fixtures__/journal.ts` (fixture entry with
   2 lens responses, share log; reuse web fixture content where present).
3. Components + stories per structure.md §D/§F.
4. **Verify:** typecheck (fixture types), export, stories compile.
   *Commit 5: `feat(mobile): journal + mindmap composed cards with stories (T-030-03)`*

## Step 6 — Nav components + ModeSwitcher extraction
1. `ui/mode-switcher.tsx` extracted from theme-select (self-reads `useTheme`);
   refactor `theme-select.tsx` to use it + the real `Button` (drops
   DemoButton); `.rnstorybook/preview.tsx` swaps its inline cycler for
   ModeSwitcher (compact).
2. `nav/entry-auth-row.tsx` (View + Clerk-connected), `nav/app-header.tsx`
   (View + connected; dropdown as in-flow expand like web; rows =
   `<Button fullWidth>` semantic mapping).
3. Stories (View variants; signedIn/out controls).
4. **Verify:** typecheck/lint; theme-select behavior unchanged (manual in
   Step 8); export.
   *Commit 6: `feat(mobile): AppHeader + EntryAuthRow, shared ModeSwitcher (T-030-03)`*

## Step 7 — Reference stories + font best-efforts
1. `src/stories/tri-modes.tsx` (fixed-theme override contexts ×3) — wire into
   Button `SemanticPair` + AppHeader `SemanticRows` stories.
2. `src/stories/tokens.stories.tsx` Themes/Tokens board.
3. **Best-effort D5:** `pip3 install --user fonttools && fonttools
   varLib.instancer` pin FILL=1 wght=700 GRAD=0 (keep opsz range or pin 24) on
   `MaterialSymbolsRounded.ttf`; on any failure, revert and record gap.
4. **Best-effort D6:** fetch Inter Regular/SemiBold TTFs (github rsms/inter);
   register in `_layout.tsx`, map notepad body/btn/mono in `theme/fonts.ts`;
   on network failure, skip and record.
5. **Verify:** if fonts changed, `expo export` again; vitest fidelity gate
   still green (font files aren't in the CSS gate — confirm no test coupling).
   *Commit 7: `feat(mobile): TriModes compare + Themes/Tokens reference story; font fidelity (T-030-03)`*

## Step 8 — Full gate + manual verification
1. `npm run typecheck && npm run lint && npm test` (all suites).
2. `npx expo export --platform ios` final bundle proof.
3. Manual on-device/simulator pass IF a simulator is available in this
   session: boot Storybook route, cycle all three modes on Button SemanticPair,
   AppHeader, LensCard, VentInput; else document exact steps owed (mirroring
   T-030-02's review.md pattern).
4. Write `progress.md` finalization + `review.md`.
   *Commit 8: `docs(T-030-03): RDSPI artifacts + review (T-030-03)` (artifacts may also be committed incrementally alongside earlier steps)*

## Testing strategy summary
- **Unit (vitest, node):** button-logic (accent-swap AC ×3 modes — the
  ticket's named bug-class), gradient parser ×3 skins, area-icon path
  completeness, social-svg map completeness + aliasing, vent-input counter
  logic. Target: every pure module has a test file.
- **Visual (stories):** every roster component ships ≥1 story; mode coverage
  via the decorator's live switcher + TriModes for the two semantic-swap
  stories. This is the AC's verification surface.
- **Bundle (CI-equivalent):** `expo export` per step catches module-graph and
  native-dep wiring errors without a device.
- **Not covered (accepted):** RN runtime rendering assertions (no RNTL rig —
  design D10), on-device animation feel.

## Risks & mitigations
- **SB metro/requires codegen quirks** (v10 on Expo 57): isolate in Step 1;
  if `withStorybook` conflicts with typed-routes codegen, fall back to
  committed requires file (drop the .gitignore line).
- **`@gorhom/bottom-sheet` on Reanimated 4:** peer range allows it; it's only
  a dependency of the SB UI (we don't consume it directly).
- **Per-theme branched composites drift:** port each from a fresh read of the
  web file (Step 5.1), never from memory; keep web line refs in comments? No —
  keep a port-source note in each story's description instead.
- **Font steps are network/toolchain-dependent:** explicitly best-effort with
  recorded fallbacks; never block the gate on them.
