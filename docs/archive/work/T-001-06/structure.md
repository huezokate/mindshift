# T-001-06 Structure: mood-image-upload

## Files Changed

| File | Change |
|------|--------|
| `mindshift.html` | Modified — CSS additions, JS additions, minor DOM change |

Single-file app; all changes are in-place.

---

## CSS Additions (inside existing `<style>` block, after `.cn-expanded .cn-close-btn`)

### `.cn-image-badge`
Collapsed-state pill showing image count. Hidden by default; shown when node has images.

```
.cn-image-badge {
    display: none;          /* shown by JS via .has-images class or inline style */
    position: absolute;
    bottom: 6px;
    right: 8px;
    background: rgba(0,0,0,0.22);
    color: #fff;
    font-size: 0.58em;
    font-weight: 700;
    border-radius: 8px;
    padding: 1px 5px;
    line-height: 1.4;
    pointer-events: none;
    z-index: 2;
}
.canvas-node.has-images .cn-image-badge {
    display: block;
}
```

The `.has-images` class is added/removed on the node element by `refreshImageBadge()`.

### `.cn-image-grid`
Thumbnail grid inside expanded node. Hidden in collapsed state.

```
.cn-image-grid {
    display: none;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    margin-top: 6px;
    flex-shrink: 0;
}
.cn-expanded .cn-image-grid {
    display: flex;
}
```

### `.cn-image-thumb`
Individual image thumbnail.

```
.cn-image-thumb {
    position: relative;
    width: 64px;
    height: 58px;
    border-radius: 6px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    overflow: hidden;
}
```

### `.cn-image-remove`
× overlay on each thumbnail.

```
.cn-image-remove {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    border: none;
    border-radius: 50%;
    font-size: 0.55em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.15s;
}
.cn-image-thumb:hover .cn-image-remove {
    opacity: 1;
}
```

### `.cn-add-img-btn`
"Add image +" button visible only in expanded state.

```
.cn-add-img-btn {
    display: none;
    margin-top: 6px;
    background: rgba(0,0,0,0.10);
    border: 1.5px dashed rgba(0,0,0,0.25);
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 0.66em;
    font-weight: 600;
    cursor: pointer;
    color: inherit;
    width: 100%;
    text-align: center;
    flex-shrink: 0;
}
.cn-expanded .cn-add-img-btn {
    display: block;
}
.cn-add-img-btn:hover {
    background: rgba(0,0,0,0.18);
    transform: none;
    box-shadow: none;
}
```

### `.cn-expanded` height bump

Change `height: 340px !important` → `height: 460px !important`.

---

## JS Additions (module-level, after existing T-001-05 block)

### State

```js
const nodeImages = new Map();  // categoryId → string[] (data URLs, max 6)
```

### `addImages(categoryId, files)`

Iterates `FileList`, reads each via `FileReader.readAsDataURL`, pushes to
`nodeImages.get(categoryId)`. Caps array at 6 (oldest removed). Calls
`refreshImageGrid(categoryId)` and `refreshImageBadge(categoryId)` after each load.

### `removeImage(categoryId, index)`

Splices the array at `index`. Calls `refreshImageGrid` + `refreshImageBadge`.

### `refreshImageGrid(categoryId)`

Finds `#cn-{categoryId} .cn-image-grid`. Clears its children. Re-renders one
`.cn-image-thumb` per URL in `nodeImages.get(categoryId)`, each with a `.cn-image-remove`
button that calls `removeImage(categoryId, i)`.

### `refreshImageBadge(categoryId)`

Finds `#cn-{categoryId}`. Toggles `.has-images` class. Updates `.cn-image-badge` text
content to the image count.

### `openImagePicker(categoryId)`

Creates a detached `<input type="file" accept="image/*" multiple>`, attaches a `change`
listener that calls `addImages(categoryId, this.files)`, then calls `.click()`.

---

## Changes to `renderCategoryNodes()`

Inside the per-node build loop, after the close button is appended, add:

1. **Image grid div** — `<div class="cn-image-grid"></div>` appended to `el`
2. **Add image button** — `<button class="cn-add-img-btn">📷 Add image +</button>` appended
   after the grid; click handler calls `openImagePicker(cat.id)` with
   `e.stopPropagation()`; `mousedown` also `stopPropagation()`
3. **Image badge** — `<span class="cn-image-badge"></span>` appended to `el`
4. After appending to `world`: call `refreshImageGrid(cat.id)` and
   `refreshImageBadge(cat.id)` to re-populate from saved state

---

## Changes to `expandNode()` / `collapseNode()`

No functional changes needed — the CSS `.cn-expanded` selector already controls visibility
of `.cn-image-grid` and `.cn-add-img-btn`. The badge is positioned absolutely and always
in the DOM; `.has-images` class gates its visibility.

---

## Ordering of DOM Elements in Expanded Node

```
.cn-label           (flex child)
.cn-header          (flex child)
.cn-goals           (flex child)
.cn-edit-area       (flex child, T-001-05)
.cn-image-grid      (flex child, new)
.cn-add-img-btn     (flex child, new)
.cn-close-btn       (absolute, T-001-05)
.cn-image-badge     (absolute, new)
```

`flex-direction: column` (inherited from `.canvas-node`). `.cn-close-btn` and
`.cn-image-badge` are absolute-positioned, so they don't participate in flex flow.

---

## Public Interface Summary

| Symbol | Type | Description |
|--------|------|-------------|
| `nodeImages` | `Map<string, string[]>` | Module-level image store |
| `addImages(id, files)` | function | Handle FileList, store base64 |
| `removeImage(id, idx)` | function | Splice image at index |
| `refreshImageGrid(id)` | function | Re-render thumbnail grid DOM |
| `refreshImageBadge(id)` | function | Update collapsed badge |
| `openImagePicker(id)` | function | Show file picker |

All are module-scoped (inside the `<script>` block), no export needed.
