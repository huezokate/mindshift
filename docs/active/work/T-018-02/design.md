# T-018-02 — Design

Decision: what to change and why, grounded in Research.

## Summary of state vs. acceptance criteria

| AC item | State | Action |
|---|---|---|
| Detail page shows AppHeader | ✅ done (`EntryDetail` line 41, AppHeader committed) | verify only |
| "+ Lens" present & wired (602:6511) | ✅ done — matches Figma Button-Primary, wired to T-018-04 stub | verify only |
| "Vent it out" present & wired (606:7872) | ⚠️ present + wired, **but visual diverges** | **refine to match Figma** |
| Token-driven, tsc clean, QA 3 themes | ✅ tsc clean; tokens used throughout | preserve through the change |

The only substantive implementation work is bringing the **"Vent it out" CTA** to
fidelity with Figma `606:7872`. Everything else is verification.

## The "Vent it out" decision

### Figma 606:7872 (target)
A composite CTA, not a filled button:
- **Top row** — an `add` icon Button-Primary (`w-120px`, green `t-4 l-4 r` borders,
  **open bottom**, bg `--bg`, radius 2px) centered between two green horizontal rules
  (left `h-4px`, right `h-1px`), the button overlapping each rule by `-4px` so it reads
  as "breaking through" the line.
- **Bottom bar** — full-width bg-`--bg` strip with the "Vent it out" label (Alumni Sans
  SC SemiBold, 14px, tracking 3px, uppercase, green).

### Options considered

**Option A — Keep the current generic filled `--btn-*` button.**
- Pros: zero work; already wired; reads as a clear primary action.
- Cons: fails the AC ("pull get_design_context… token-driven [to the node]"); visually
  inconsistent with the green Button-Primary language used by "+ Lens" and the per-lens
  button row on the very same surfaces. Rejected.

**Option B — Rebuild as the Figma composite (icon-on-rule + label bar).** *(chosen)*
- Pros: matches 606:7872 exactly; reuses the established Button-Primary idiom + the
  `-4px` overlap idiom already in `EntryDetail`; stays token-driven; visually consistent
  with the rest of the journal surface.
- Cons: more markup than a single button; the open-bottom border + negative-margin rule
  overlap needs care to render identically across the three themes.

**Option C — Extract a shared `<VentItOutCta/>` (and/or a `<ButtonPrimary/>`) component.**
- Pros: DRY — the Button-Primary treatment recurs in 3+ places.
- Cons: scope creep for this ticket; a refactor of "+ Lens" and the lens button row into
  a shared primitive is its own change and risks touching committed code beyond this
  ticket's mandate. Deferred (noted in Review as a follow-up).

### Decision
**Option B.** Replace the generic `--btn-*` Link in `JournalV2Client` with the Figma
composite, implemented inline (consistent with how `EntryDetail` builds "+ Lens" inline).
Keep it a single `<Link href="/app/onboarding">` so the whole composite is one tap target
and the routing is unchanged.

## Visual / token mapping

- Surfaces & accent: `background: var(--bg)`, borders & rules & text `var(--green)` —
  identical token choices to the existing "+ Lens" button, so all three themes follow.
- Label font: `var(--font-btn)` (Alumni Sans SC), weight 600, 14px, letter-spacing 3px,
  uppercase, lineHeight 16px — same `btnLabel` recipe used across the journal.
- Icon: `<Icon name="add" size={24} />` inheriting `currentColor` (green).
- Notepad drop-shadow: mirror the existing rule — `filter: isCyberpunk || isKawaii ?
  'none' : 'var(--card-filter)'` on the bordered button so notepad gets its offset
  shadow and the neon themes don't.
- Geometry: button `width: 120`, borders `t-4 l-4 r-1` (omit bottom), radius 2px, pad
  `8px 9px 0 12px` (justify-end, no bottom pad → open bottom meets the bar). Rules:
  `flex: 1`, heights `4px` (left) / `1px` (right), `marginRight: -4` on the left rule and
  the button to recreate the overlap; `isolation: isolate` + z-indexes (rule-left z3,
  button z2, rule-right z1) per Figma.

## Accessibility

- Whole composite = one `<Link>` with `aria-label="Vent it out — start a new entry"`.
- `add` icon `aria-hidden` (decorative; the label carries meaning).
- Effective height (button ~37px + bar) comfortably exceeds the 44px tap minimum; the bar
  + button together form the hit area.

## Out of scope (unchanged)

- AppHeader on detail — already correct.
- "+ Lens" wiring — stays a stub until T-018-04 (lens picker).
- No DB / route / type changes. No edits to sibling-ticket files.
