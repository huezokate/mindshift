# T-018-06 — Research

Flow corrections #1 (FigJam 95:2150) + #4 (FigJam 95:2186) on the entry screens.
Scope: the **theme-select** screen and **auth visibility** across the entry flow.

## Ticket intent (decoded)

Correction #1 — theme-select:
- Primary CTA button fill should be solid **cyberpunk black**, not the current
  hardcoded kawaii cream.
- The theme UI-picker arrows (`‹` `›`) should be **massive circular buttons (~40px)**,
  reusing the same component as the lens picker's overlay arrows.
- The disclaimer checkmark "looks auto-tapped" — must read as **unticked by default**.
- Log-in should get **equal focus** on this screen.

Correction #4 — auth:
- **Sign-up more visible** for users with no account.
- **Show the user's name** when signed in.

## Relevant files

### Theme-select — `src/app/app/theme-select/page.tsx` (479 lines, client)
The single screen this ticket centers on. Key structures:
- `THEMES[]` — cyberpunk / kawaii / notepad copy + taglines.
- `cardStyle` — shared Figma card token bundle (`--card-*`).
- Background: a 3×5 decorative figure grid (`FIGURES.map`) dimmed by a `--bg` overlay
  at 0.55 opacity. **This is why the CTA needs an opaque fill** — a transparent button
  lets the figure grid bleed through.
- **Disclaimer checkbox** (lines 225–272): a native `<input type="checkbox">` with
  `accentColor: var(--cyan)`, `width/height: 16`. State `acknowledged` initializes from
  `localStorage[ACK_KEY]` in a `useEffect`. The native control on the dark cyberpunk bg
  is what reads as "auto-tapped" — an empty native box with a cyan accent looks filled.
- **Theme arrows** (lines 394–445): two `<button>`s rendering literal `‹` / `›` glyphs at
  `fontSize: 20`, `color: var(--cyan)`, no border, `padding: 4px 8px`. Tiny. `prev()`/`next()`
  cycle `index` and call `setTheme()`.
- **Primary CTA** (lines 450–475): "Enter MindShift". Disabled until `acknowledged`.
  Fill is **hardcoded** `#ffe2ac` (active) / `#e8e4dc` (disabled) with an inline comment
  explaining the hack ("never lets the figure grid show through, regardless of theme").
  Text color `--violet` (active) / `--text-sub` (disabled). Borders from `--card-b*`.
- **No auth affordance exists on this screen at all** — no sign-in, sign-up, or name.

### Lens picker — `src/app/app/lens/page.tsx`
The "shared circular component" the ticket references is the **lens detail overlay arrows**
(lines 285–293, 393–401): circular `<button>`, `width/height: 48`, `borderRadius: '50%'`,
`background: var(--card-bg)`, `border: 2px solid var(--cyan)`, `color: var(--cyan)`,
glyph `‹`/`›` at `fontSize: 30`. This is the visual target for the theme-select arrows.
There is **no extracted component** today — the style is inlined twice in lens/page.tsx.

### Auth surfaces
- **`src/components/nav/AppHeader.tsx`** — full top nav with an account dropdown that already
  derives `username` from `useUser()` (`@username` → email fallback) and shows it on the
  Profile row. Only rendered on `response` and `journal-preview` — **not** on the entry
  screens (theme-select / onboarding / lens).
- **`src/app/app/onboarding/page.tsx`** — has a lone secondary "Sign Up" `<Link href="/sign-up">`
  (lines 234–254). Always shown, even when already signed in. No name display.
- **`src/components/AuthBanner.tsx`** — reason-aware banner on the sign-in/up pages.
- **`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`** — Clerk `<SignIn>` + `AuthBanner`.
- Clerk client API: `useUser()` → `{ isSignedIn, user }`; `user.firstName`, `user.username`,
  `user.primaryEmailAddress?.emailAddress`. `useClerk()` → `signOut()`.

### Icons — `src/components/ui/Icon.tsx`
Single icon primitive: Google **Material Symbols (Sharp)** by glyph name, `currentColor`,
optical sizing. Used everywhere (T-018-01 migrated to it). Relevant glyphs:
`chevron_left` / `chevron_right` (crisp nav arrows), `check_box` / `check_box_outline_blank`
(custom checkbox), `person` / `login`.

## Design tokens (`src/styles/tokens*.css`)

Per-theme values relevant to this ticket:

| token | cyberpunk | kawaii | notepad |
|---|---|---|---|
| `--bg` | `#080810` (black) | `#ffafd6` | `#faf7f2` |
| `--bg-card` | `#0d0d1a` | — | — |
| `--card-bg` | `var(--bg-card)` | `#ffffff` | `#ffffff` |
| `--cyan` | `#00F5FF` | `#ff50c5` | `#3a6fa8` |
| `--violet` | `#B04CFF` | `#ff50c5` | `#3a6fa8` |
| `--btn-radius` | `2px` | `32px` | `8px` |
| `--btn-bg` | `transparent` | (filled) | (filled) |

Note cyberpunk's `--btn-bg: transparent` is precisely why the CTA can't use the standard
button token over the figure grid. There is **no existing "solid opaque CTA" token** — the
hardcoded hex filled that gap.

## Constraints & conventions

- **AGENTS.md:** Next.js 16 with breaking changes — `proxy.ts` not `middleware.ts`; check
  `node_modules/next/dist/docs/` before new Next APIs. (No new Next APIs needed here.)
- **CLAUDE.md (V200):** never hardcode hex; use CSS custom properties. The current CTA hack
  violates this with a justification comment — the proper fix is a new token.
- All three themes must follow via tokens; theme flips live as the user cycles the picker.
- Material Symbols only — no custom SVGs.
- Entry screens are anon-friendly; auth UI must gracefully handle signed-out vs signed-in.
- `get_design_context` on the two FigJam nodes + `tsc` clean are explicit acceptance gates.

## Open questions for Design

1. Extract the circular arrow into a shared component, or inline-match in theme-select?
2. Custom checkbox (Icon-based) vs. restyled native input to kill the "auto-tapped" look?
3. Where does auth (log-in equal focus / sign-up / name) live on theme-select, and should
   onboarding's lone "Sign Up" be unified with it?
4. Solid CTA fill: one new per-theme token, or theme-conditional inline values?
