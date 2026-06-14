# T-018-05 — Structure

Single-file change. No new files, no backend or schema changes.

## Files

| File | Action | Why |
|---|---|---|
| `V200/src/app/app/response/page.tsx` | **Modify** | Add pop animation controls + navigate-on-success to the Save flow. |

No files created or deleted. `globals.css` untouched (pop is framer, not CSS).

## Changes within `response/page.tsx`

### 1. Imports

- Extend the existing framer import:
  `import { motion, useAnimationControls } from 'framer-motion'`
  (currently only `motion`).

### 2. Component body — new controls

Inside `ResponsePage`, near the other hooks (after `useRouter`):

```ts
const saveControls = useAnimationControls()
```

### 3. `handleSave` success branch

Replace the tail of the `try` block:

```ts
// before
const data = await res.json()
sessionStorage.setItem('ms_session_id', data.sessionId)
setSaveState('saved')

// after
const data = await res.json()
sessionStorage.setItem('ms_session_id', data.sessionId)
setSaveState('saved')
await saveControls.start({
  scale: [1, 1.3, 0.92, 1],
  transition: { duration: 0.42, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
})
router.push(`/app/journal-v2/${data.sessionId}`)
```

- Anon branch (`!isSignedIn` redirect) and the `saving`/`saved` guard are unchanged.
- `catch` branch (`setSaveState('error')`) is unchanged — no pop, no navigate.

### 4. Save button element

Convert the Save `<button>` (currently lines ~290–292) to a `motion.button`:

```tsx
<motion.button
  onClick={handleSave}
  animate={saveControls}
  whileTap={{ scale: 0.95 }}
  title={saveState === 'saved' ? 'Saved!' : 'Save to journal'}
  style={iconBtn(saveState === 'saved')}
>
  <IconBookmark />
</motion.button>
```

- `style`, `onClick`, `title`, and the active-state styling are preserved.
- Only this button changes; the disabled Decorate button and the Share button stay
  plain `<button>` (no animation needed).

## Interfaces / contracts touched

- **None external.** `handleSave` keeps its signature (`async () => void`).
- Navigation target uses `data.sessionId` from the existing
  `POST /api/save-response` response — already in the success branch.
- Route string matches the established pattern in
  `JournalPreviewCard.tsx:107` (`/app/journal-v2/${id}`).

## Ordering of changes

1. Update import (compile-safe on its own).
2. Add `saveControls` hook.
3. Wire success branch (pop + navigate).
4. Swap Save button to `motion.button` with `animate`/`whileTap`.

All four are part of one atomic edit/commit — the feature is incomplete until the
button is wired to the controls.

## Risk surface

- Smallest possible: one client component, one handler, one element.
- No server/DB/auth changes → no migration, no RLS implications.
- framer `useAnimationControls` + `motion.button` is standard API, already used
  elsewhere in the app.
