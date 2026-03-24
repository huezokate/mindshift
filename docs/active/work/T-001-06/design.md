# T-001-06 Design: mood-image-upload

## Problem

When a category node is expanded, the user should be able to add mood-board images from
their device. Images are stored client-side (base64), displayed as a thumbnail collage,
and removable individually. Collapsed nodes display an image-count badge.

---

## Option A — Hidden File Input, Programmatic Click

**Approach:** Render an `<input type="file" accept="image/*" multiple hidden>` inside
each expanded node. The "Add image +" button calls `.click()` on it. `FileReader` converts
selected files to data URLs and appends them to a module-level `Map<string, string[]>`.

**Pros:**
- Dead simple, no DOM attachment trick needed (hidden input inside expanded div)
- Natural `multiple` file selection in one dialog
- Follows existing patterns (textarea inside node, events scoped to the element)

**Cons:**
- Hidden input inside a clipped/overflow-hidden div might receive click events
  inconsistently in some browsers — mitigated by always expanding clip-path first (which
  T-001-05 already does)

---

## Option B — Detached File Input, Body-level

**Approach:** Create the `<input type="file">` dynamically (not attached to DOM), call
`.click()` immediately, read files in `change` handler, discard element.

**Pros:**
- Zero impact on node DOM structure
- Works cross-browser reliably
- Exactly the pattern used by most image-upload UI without a server

**Cons:**
- Must pass the `categoryId` via closure — slightly more indirection
- No persistent input element, so `accept` and `multiple` must be set on each call

---

## Option C — Drag-and-Drop onto expanded node

**Approach:** Listen for `dragover`/`drop` events on the expanded node in addition to a
file input button.

**Pros:**
- Richer UX

**Cons:**
- Significantly more code; not mentioned in acceptance criteria; expanded nodes are
  inside a pan canvas, so drag events conflict with canvas pan. Out of scope.

---

## Decision: Option B (detached file input, programmatic click)

**Rationale:**
- Most reliable cross-browser behaviour for file picker
- No structural dependency on the input being inside the expanded node's clipped/scrollable
  region
- Keeps node DOM clean — only adds the thumbnail grid and the "Add image +" button as
  visible elements
- Pattern is idiomatic vanilla JS

---

## Image Storage

```js
const nodeImages = new Map();  // categoryId → string[] (base64 data URLs, max 6 stored)
```

Stored at module level, same lifecycle as `nodeEdits`. On `renderCategoryNodes()` re-run
the badge and thumbnail grid are re-populated from this Map.

Maximum stored per node: 6 (newest images replace oldest once cap is reached). The
acceptance criteria says "max 4–6 visible, rest hidden" — storing only 6 simplifies
implementation: no "hidden" images, no +N counter needed.

---

## Image Count Badge (collapsed state)

A `<span class="cn-image-badge">` is rendered unconditionally inside each node but
`display: none` when imageCount === 0 and visible (small pill) when count > 0. Badge is
updated by a `refreshImageBadge(categoryId)` helper. It re-checks `nodeImages.get(id)`.

---

## Thumbnail Grid (expanded state)

A `<div class="cn-image-grid">` child rendered inside each node. In collapsed state it
is hidden. In expanded state (via `.cn-expanded .cn-image-grid`) it becomes visible.

Grid layout: 3-column, compact thumbnails ~60 × 60 px. Each thumbnail is a `<div>`
with `background-image` set to the data URL, with an `×` overlay button.

---

## Expanded Node Height

Current: 340 px. With images visible, 340 px is insufficient to show label + header +
goals + textarea + image grid + "Add image +" button without crowding.

Decision: increase expanded height to **460 px**. This fits:
- Label + header (~40 px)
- Goals list (~60 px)
- Edit textarea (72 px min)
- Image grid (2 rows × 3 cols = ~130 px)
- "Add image +" button (~32 px)
- Padding (~40 px)

Total: ~374 px content + padding = ~410 px. 460 px gives breathing room.

The CSS `!important` in `.cn-expanded` means only the single rule needs changing — no
JS height override required.

---

## Add Image Button Placement

Rendered as a sibling to the image grid, just below it:

```
[label]
[header]
[goals list]
[edit textarea]
[image grid]
[Add image + button]
[close ×]
```

Both `.cn-image-grid` and `.cn-add-img-btn` are hidden in collapsed state (CSS: only
shown under `.cn-expanded`), shown in expanded state.

---

## Remove Image UX

Each thumbnail `<div>` has an absolutely-positioned `×` button overlay. Clicking it
calls `removeImage(categoryId, index)`, which splices the array, and calls
`refreshImageGrid(categoryId)` + `refreshImageBadge(categoryId)`.

---

## Event Propagation

- `mousedown` on the "Add image +" button and thumbnail × button must call
  `e.stopPropagation()` to prevent canvas pan.
- `click` on those buttons must also `stopPropagation()` to prevent `onNodeClick` from
  firing (which would collapse the node).

---

## CSS Strategy

New CSS classes added to the `<style>` block:

| Class | Purpose |
|-------|---------|
| `.cn-image-badge` | Collapsed-state image count pill |
| `.cn-image-grid` | Thumbnail grid container |
| `.cn-image-thumb` | Individual thumbnail |
| `.cn-image-remove` | × button on thumbnail |
| `.cn-add-img-btn` | "Add image +" button |

Hidden in base node, shown under `.cn-expanded` parent.

---

## Rejected Approaches

- **Drag-and-drop:** Conflicts with canvas pan, out of scope.
- **localStorage persistence:** Ticket explicitly says "session" — no persistence needed.
- **Storing >6 images with overflow pagination:** Adds UI complexity; capping at 6 is
  simpler and fits the collage aesthetic.
- **Attached hidden input inside the clipped node:** Works but fragile under clip-path
  overflow-hidden scenarios; detached input is more reliable.
