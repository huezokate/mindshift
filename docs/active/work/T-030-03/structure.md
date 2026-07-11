# T-030-03 rn-primitives-storybook — Structure

All paths under `mobile/` unless noted. Kebab-case files (mobile convention),
PascalCase exports (web parity). Components import tokens ONLY from `@/theme`.

## A. Storybook infrastructure (created)

| File | Contents |
|---|---|
| `metro.config.js` | Expo default config wrapped in `withStorybook` (`configPath: '.rnstorybook'`, enabled unless `WITH_STORYBOOK=false`) |
| `.rnstorybook/main.ts` | `stories: ['../src/**/*.stories.@(ts\|tsx)']`, addons: ondevice-controls, ondevice-actions |
| `.rnstorybook/index.tsx` | `getStorybookUI({...})` export, wrapped in `GestureHandlerRootView` + `SafeAreaProvider` |
| `.rnstorybook/preview.tsx` | `withTheme` decorator: real `ThemeProvider` → `ThemeFrame` (paints `tokens.palette.bg`, renders `ModeSwitcher` pinned above the story) |
| `src/app/storybook.tsx` | expo-router route: `__DEV__ ? <StorybookUI/> : <Redirect href="/">` |

**Modified:** `package.json` (deps: `storybook`, `@storybook/react-native`,
`@storybook/addon-ondevice-controls`, `@storybook/addon-ondevice-actions`
@^10.5; `@gorhom/bottom-sheet@^5`; `expo-linear-gradient@~57`; script
`"storybook"` hint); `.gitignore` (`.rnstorybook/storybook.requires.ts`).

## B. Theme layer additions (created unless noted)

| File | Public interface |
|---|---|
| `src/theme/gradient.ts` | `parseLinearGradient(css: string): { colors: [string,...]; locations?: number[]; start: {x,y}; end: {x,y} } \| null` — grammar limited to the three skins' actual strings |
| `src/theme/gradient.test.ts` | asserts against all three skins' real `--fig-avatar-grad` values |
| `src/theme/index.ts` *(mod)* | re-export `parseLinearGradient` |
| `src/theme/fonts.ts` *(mod, best-effort)* | notepad body/btn/mono → Inter families if assets land (D6) |
| `src/app/_layout.tsx` *(mod, best-effort)* | register Inter TTFs in `useFonts` |
| `assets/fonts/MaterialSymbolsRounded.ttf` *(mod, best-effort)* | re-instanced FILL=1 wght=700 (D5) |

## C. UI primitives — `src/components/ui/`

| File | Exports & props |
|---|---|
| `icon.tsx` | `Icon({ name, size?=24, color? })` — Material glyph by ligature; default color `tokens.text.body`. **Deletes/replaces `ms-icon.tsx`** (usages migrated: grep `MsIcon`) |
| `button-logic.ts` | pure: `ButtonVariant = 'primary'\|'secondary'\|'secondary2'`; `resolveButtonStyle(t: Theme, variant, { disabled }): { family: ButtonFamily; minHeight; padV; padH; filter?; disabledOpacity }` — the accent-swap resolution as testable data |
| `button-logic.test.ts` | per-mode family resolution incl. Journal→secondary / MindMap→secondary2 colors ×3 skins (AC #2) |
| `button.tsx` | `Button({ variant?='primary', children?, subtext?, icon?, iconSize?, fullWidth?, disabled?, onPress?, accessibilityLabel?, style? })` — icon-only when `icon` && no children; Reanimated press spring (scale 0.93 → spring back); uses `button-logic` + `borderStyle` |
| `card.tsx` | `Card({ children, style? })` (`t.card` family) + `HeadingCard({ children, style? })` (`t.hcard` incl. padding) |
| `vent-input.tsx` | `VentInput({ value, onChangeText, placeholder?, header?='Dump it all here:', maxLength?=1000, warnAt?=700, editable?, autoFocus? })` — header row + `TextInput multiline` + counter |
| `vent-input-logic.ts` | pure: `counterColor(t, len, warnAt)` → body/pink |
| `sheet.tsx` | `Sheet({ open, onClose, position?='bottom'\|'center', chrome?='card'\|'fcard', children })` — RN `Modal transparent` + Reanimated overlay fade 180ms + panel reveal (bottom: SlideInDown; center: scale 0.94/y 8 fade, web LensPicker values); scrim `rgba(0,0,0,.55)` from web overlay |
| `chat-bubble.tsx` | `ChatBubble({ role: 'user'\|'lens', children })` — accents `t.chat.*`, user tail / lens cloud-dots via absolutely-positioned Views; + `TypingDots()` (Reanimated stagger loop) |
| `mode-switcher.tsx` | `ModeSwitcher({ compact? })` — extracted from theme-select (reads `useTheme` itself); theme-select refactored to consume it |
| `motion.ts` | `useSavePop(): { style, trigger }` (withSequence 1→1.3→0.92→1); `usePressScale()`; both respect `useReducedMotion` |

Stories: `button.stories.tsx` (Primary, Secondary, Secondary2, WithIcon,
IconOnly incl. chevron pair, Disabled, WithSubtext, FullWidth, **SemanticPair**
in `<TriModes>`, AllVariants), `icon.stories.tsx` (Default, Glyphs grid),
`card.stories.tsx` (Card, HeadingCard), `vent-input.stories.tsx` (Empty,
Filled, OverWarn), `sheet.stories.tsx` (Bottom/fcard, Center/card),
`chat-bubble.stories.tsx` (User, Lens, Conversation+TypingDots),
`mode-switcher.stories.tsx`.

## D. Journal — `src/components/journal/`

| File | Exports & props |
|---|---|
| `journal-types.ts` | `LensResponseLite { figureId, figureName, responseText, createdAt, sharedTo? }`, `JournalEntryLite { id, ventText, createdAt, isPublic, responses: LensResponseLite[] }` — RN-side lightweight shapes (web's V2 types are page-coupled) |
| `lens-card.tsx` | `LensCard({ response: LensResponseLite, ventText })` — avatar ring (`<LinearGradient>` from `parseLinearGradient(t.fig.avatar.gradientCss)`), name header (`t.lens.headerBg`), quote (`t.lens.quoteColor`), response body, share log |
| `journal-preview-card.tsx` | `JournalPreviewCard({ entry, onPress?, onAddLens? })` — date label, header+clamped vent (`t.input` chrome, `t.preview.*`), footer avatar stack or `<Button variant="secondary" icon="add">Lens</Button>` |
| `welcome-card.tsx` | `WelcomeCard({ onLoadDemo?, seeding?, seedMsg? })` |
| `upcoming-chip.tsx` | `UpcomingChip()` — pink pill, `release_alert` 12px |
| `social-svgs.ts` | generated: `SOCIAL_SVG: Record<ThemeMode, Record<Brand, string>>` (12 inlined XMLs from `V200/public/social/`), `Brand = 'facebook'\|'instagram'\|'sms'\|'tiktok'`, `brandFor(platform: SharePlatform): Brand` |
| `social-svgs.test.ts` | 12 entries present & non-empty; platform aliasing (link/native/download→sms) |
| `social-icon.tsx` | `SocialIcon({ platform, size?=16 })` — `SvgXml`, per-theme tile bg per web |
| `auth-banner.tsx` | `AuthBanner({ reason?: 'lens_limit'\|'vent_limit'\|'save'\|'journal' })` — REASONS copy from web; prop instead of `useSearchParams` |

Stories: one per component; `lens-card`/`journal-preview-card` stories use
fixture data in `__fixtures__/journal.ts`.

## E. Nav — `src/components/nav/`

| File | Exports & props |
|---|---|
| `entry-auth-row.tsx` | `EntryAuthRowView({ signedIn, handle?, onLogin, onSignUp, onProfile })` + default `EntryAuthRow` (Clerk `useUser` + router) |
| `app-header.tsx` | `AppHeaderView({ signedIn, entryCount?, lensCount?, mindmapHorizon?, mindmapProgress?, onNavigate(route), onSignOut? })` — brand badge + wordmark (`t.logo`), menu trigger (primary btn family), dropdown rows as `<Button fullWidth>` with the **semantic mapping** (profile/logout→primary, journal→secondary, mindmap→secondary2); + connected `AppHeader` (counts via props only) |

Stories: `entry-auth-row.stories.tsx` (SignedIn, SignedOut — View variant),
`app-header.stories.tsx` (Closed, MenuOpen signed-in/out, SemanticRows in
`<TriModes>`).

## F. Mindmap — `src/components/mindmap/`

| File | Exports & props |
|---|---|
| `area-icon-paths.ts` | pure: `AreaId = 'career'\|'health'\|'relationship'\|'personal'\|'finance'`; `AREA_PATHS: Record<AreaId, string>` (d-strings verbatim from web); `AREA_LABELS` |
| `area-icon-paths.test.ts` | every AreaId has a non-empty path; union ↔ map keys |
| `area-icon.tsx` | `AreaIcon({ id, size?=24, color? })` — `<Svg viewBox="0 0 24 24"><Path fill=color>` |
| `mindmap-area-card.tsx` | `MindmapAreaCard({ area: AreaId, title?, body?, milestones, actions, selected?, width?=331 })` — selected: border `t.palette.green`, bg `t.mmCardBgSelected` |

Stories: `area-icon.stories.tsx` (Single, AllAreas), `mindmap-area-card.stories.tsx`
(Default, Selected).

## G. Reference stories — `src/stories/`

| File | Contents |
|---|---|
| `tri-modes.tsx` | `TriModes({ children })` — renders children 3× inside fixed `themes[mode]` contexts (local override provider), labeled; the web "Compare all 3" |
| `tokens.stories.tsx` | Themes/Tokens board: palette swatches, text roles, fonts, the three Button families, radii — all from `useTheme()` |

## H. Modified summary
`package.json`, `.gitignore`, `metro.config.js`(new), `src/app/_layout.tsx`
(Inter, best-effort), `src/app/theme-select.tsx` (consume `ModeSwitcher` +
`Button`), `src/theme/{index,fonts}.ts`, delete `src/components/ms-icon.tsx`.
Screens/api untouched otherwise (T-030-04 territory). No V200 changes.

## Ordering (dependency-driven; each step = commit)
1. Deps + Storybook boot (infra files + one smoke story) — SB UI loads.
2. `Icon` + `Button` (+logic&tests) + stories; migrate MsIcon usages.
3. Surfaces: `Card`/`HeadingCard`, `VentInput`, `Sheet`, `ChatBubble` + stories.
4. SVG/gradient: `gradient.ts`, `AreaIcon`, `SocialIcon` (+tests, +expo-linear-gradient).
5. Composed: `UpcomingChip`, `AuthBanner`, `WelcomeCard`, `MindmapAreaCard`,
   `LensCard`, `JournalPreviewCard` + fixtures + stories.
6. Nav: `EntryAuthRowView`, `AppHeaderView` + stories; `ModeSwitcher`
   extraction + theme-select refactor.
7. `TriModes` + Themes/Tokens story; font best-efforts (D5 instancer, D6 Inter).
8. Full gate: typecheck, lint, vitest, `expo export` bundle check.
