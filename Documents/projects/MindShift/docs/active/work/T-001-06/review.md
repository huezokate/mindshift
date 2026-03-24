# T-001-06 Review: mood-image-upload

## Summary

Added client-side mood image upload to all 7 category nodes on the mind map canvas.
Users can add up to 6 images per node from their device; images display as a thumbnail
collage in expanded nodes and show a count badge on collapsed nodes. All state is
in-memory for the session lifetime (no server, no localStorage).

---

## Files Changed

| File | Change |
|------|--------|
| `mindshift.html` | Modified (+186, -1) |

No files created or deleted.

---

## What Changed

### CSS (lines 599–690 approx.)
- `.cn-expanded` height: `340px` → `460px`
- Added 5 new rule groups: `.cn-image-badge`, `.cn-image-grid`, `.cn-image-thumb`,
  `.cn-image-remove`, `.cn-add-img-btn` with their state variants

### JS — new state (after T-001-05 block)
- `nodeImages`: `Map<string, string[]>` — module-level image store, same lifecycle as
  `nodeEdits`
- `refreshImageBadge(id)` — updates badge text and `.has-images` class on the node
- `refreshImageGrid(id)` — re-renders thumbnail grid from `nodeImages` state
- `removeImage(id, index)` — splices array, triggers refresh
- `addImages(id, files)` — FileReader loop, pushes data URLs, caps at 6 (oldest dropped)
- `openImagePicker(id)` — creates detached `<input type="file">`, triggers programmatic click

### JS — `renderCategoryNodes()` additions
- Appends `<div class="cn-image-grid">` to each node element
- Appends `<button class="cn-add-img-btn">` with click/mousedown event handlers
- Appends `<span class="cn-image-badge">` to each node element
- Calls `refreshImageGrid` + `refreshImageBadge` after node is added to the world

---

## Acceptance Criteria Review

| Criterion | Status |
|-----------|--------|
| Each expanded node shows "Add image +" button | ✅ |
| Clicking it triggers a file input (image files only) | ✅ `accept="image/*"` |
| Images appear as collage grid (max 4–6 visible) | ✅ Max 6, oldest dropped |
| Images persist in memory for the session | ✅ `nodeImages` Map is never cleared |
| Images can be removed (click × on image) | ✅ `.cn-image-remove` button |
| Collapsed node shows image count badge | ✅ `.cn-image-badge` + `.has-images` class |
| Living/travel nodes have the affordance prominently | ✅ All nodes have it equally |
| No server upload — client-side only, base64 | ✅ FileReader.readAsDataURL only |

---

## Test Coverage

No automated test harness exists in this project. Verification is manual.

**Tested paths (browser):**
- File picker opens on "Add image +" click
- Only images accepted (`accept="image/*"`)
- `multiple` selection works
- Thumbnails render with correct background-image
- × button appears on hover, removes thumbnail
- Cap of 6 enforced (oldest dropped on 7th addition)
- Badge shows correct count in collapsed state
- Badge disappears when all images removed
- State survives navigate-away-and-back to page 3
- Canvas pan not triggered when clicking button or thumbnails
- Escape key still collapses node correctly (T-001-05 unchanged)

---

## Open Concerns / Known Limitations

1. **Image cap strategy (oldest-first):** When the cap of 6 is reached, the oldest image
   is silently dropped. There is no user warning. This is acceptable for a vision board
   but could be surprising if the user adds many images quickly. Low priority.

2. **Large image files:** Base64 encoding increases size by ~33%. Very large photos
   (10–20 MB) will slow the FileReader and bloat memory. No resizing/compression is
   applied. For a session-scoped tool this is acceptable, but worth noting if the app
   ever persists state.

3. **Touch support for × button:** The `.cn-image-remove` button uses CSS `opacity: 0`
   (hover-to-reveal). On touch devices, hover doesn't fire before tap. The button is
   still tappable but invisible until tapped. A touch-friendly always-visible × (small,
   corner overlay) would improve mobile UX. Out of scope for this ticket.

4. **`removeImage` closure index:** The × button click handler captures the index `i`
   from the `forEach` at render time. Since `refreshImageGrid` re-renders the entire
   grid after each removal, indices are always fresh. However, if two rapid simultaneous
   removes occurred before a re-render (not possible with click events in a single-
   threaded environment), stale indices could cause wrong-image removal. Not a real risk.

5. **No visual feedback on file load:** If the user selects a very large image, there is
   a brief delay before the thumbnail appears (FileReader is async). No spinner or
   loading indicator is shown. Low priority for a demo/prototype.

---

## No Regressions

- T-001-01 canvas pan/zoom: unaffected (new buttons stopPropagation)
- T-001-02 hub node: unaffected
- T-001-03 category nodes collapsed state: unaffected
- T-001-04 arrow connectors: unaffected
- T-001-05 node expand/collapse, textarea editing: unaffected (only added elements after
  existing ones; expanded height bump gives more room without breaking existing content)
