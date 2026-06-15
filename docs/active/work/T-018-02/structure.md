# T-018-02 — Structure

File-level blueprint. Not code — the shape of the change.

## Files

| File | Change | Reason |
|---|---|---|
| `V200/src/components/journal/JournalV2Client.tsx` | **modify** | Replace the generic filled "Vent it out" `<Link>` (lines ~170–188) with the Figma 606:7872 composite. |
| `V200/src/components/journal/EntryDetail.tsx` | **verify only** | AppHeader + "+ Lens" already match Figma; no edit. |
| `V200/src/components/nav/AppHeader.tsx` | **verify only** | Shared header, committed; no edit. |

No files created or deleted. No DB / route / type / token-file changes.

**Do NOT touch** (uncommitted sibling-ticket edits): `[id]/page.tsx`,
`JournalPreviewCard.tsx`, `QuoteCardCanvas.ts`.

## JournalV2Client — change shape

Current (to replace):
```
{entries.length > 0 && (
  <Link href="/app/onboarding" style={{ ...filled --btn-* primary... }}>
    <Icon name="add" size={20} /> Vent it out
  </Link>
)}
```

New composite (still gated on `entries.length > 0`, still one `<Link>`):

```
<Link href="/app/onboarding" aria-label="Vent it out — start a new entry"
      style={{ outer: flex column, items-center, width 100%, marginTop 8,
               textDecoration none }}>
  {/* Row: icon button raised on a rule (Figma 606:7864) */}
  <div style={{ display:flex, alignItems:'flex-end', width:'100%',
                isolation:'isolate' }}>
    <span aria-hidden style={{ flex:1, height:4, background:var(--green),
                               minWidth:1, marginRight:-4, zIndex:3 }} />
    <div style={{ width:120, background:var(--bg),
                  borderTop:'4px solid var(--green)',
                  borderLeft:'4px solid var(--green)',
                  borderRight:'1px solid var(--green)',   // no bottom border
                  borderRadius:2, marginRight:-4, zIndex:2,
                  display:flex, flexDirection:'column', alignItems:'center',
                  justifyContent:'flex-end', padding:'8px 9px 0 12px',
                  color:var(--green),
                  filter:isCyberpunk||isKawaii?'none':'var(--card-filter)' }}>
      <Icon name="add" size={24} />
    </div>
    <span aria-hidden style={{ flex:1, height:1, background:var(--green),
                               minWidth:1, zIndex:1 }} />
  </div>
  {/* Bar: label (Figma 606:7869) */}
  <div style={{ width:'100%', background:var(--bg), borderRadius:2,
                display:flex, justifyContent:'center', padding:'0 8px 8px' }}>
    <span style={{ ...btnLabel, color:var(--green) }}>Vent it out</span>
  </div>
</Link>
```

`btnLabel` = `{ fontFamily:'var(--font-btn)', fontWeight:600, fontSize:14,
letterSpacing:'3px', textTransform:'uppercase', lineHeight:'16px',
textAlign:'center' }`.

## Dependencies / interfaces

- Needs `theme` in `JournalV2Client` for the notepad `--card-filter` branch.
  `JournalV2Client` does **not** currently call `useTheme()` → add the import + hook
  (mirrors `EntryDetail`'s `isCyberpunk`/`isKawaii` pattern). This is the only new
  import; `useTheme` from `@/lib/theme` is already used app-wide.
- `Icon` and `Link` are already imported in `JournalV2Client`.
- No prop or signature changes; `JournalV2Client`'s public interface is unchanged.

## Ordering

1. Add `useTheme()` + `isCyberpunk`/`isKawaii` locals in `JournalV2Client`.
2. Swap the CTA markup.
3. tsc.
4. Verify "+ Lens" / AppHeader unchanged (read-only).

## Risk notes

- The open-bottom button + negative-margin rule overlap is the only fiddly part; if a
  theme renders the seam oddly it is contained to this one block and easy to tune.
- Keeping it a single `<Link>` preserves the existing route behavior and analytics-free
  navigation — no regression surface beyond visuals.
