# T-001-06 Plan: mood-image-upload

## Approach

All changes in `mindshift.html`. Steps are ordered by dependency. Each step is small
enough to verify independently before moving to the next.

---

## Step 1 — CSS: expanded node height bump

**Change:** In `.cn-expanded`, change `height: 340px !important` → `height: 460px !important`.

**Verify:** Open page 3 in a browser, click any node, confirm expanded height is ~460 px.

**Rationale:** Height must be bumped before adding new content so we can see all elements
without overflow issues. This step has no JS dependency.

---

## Step 2 — CSS: add new classes

**Change:** Append the following CSS rules to the `<style>` block (after `.cn-expanded .cn-close-btn`):

- `.cn-image-badge` + `.canvas-node.has-images .cn-image-badge`
- `.cn-image-grid` + `.cn-expanded .cn-image-grid`
- `.cn-image-thumb`
- `.cn-image-remove` + `.cn-image-thumb:hover .cn-image-remove`
- `.cn-add-img-btn` + `.cn-expanded .cn-add-img-btn` + `.cn-add-img-btn:hover`

**Verify:** No visual change yet (no elements in DOM); no browser errors.

---

## Step 3 — JS: `nodeImages` Map and image management functions

**Change:** After the `// T-001-05: expand state` block (around line 1269), add:

```js
// T-001-06: image state
const nodeImages = new Map();  // categoryId → string[] (data URLs, max 6)

function refreshImageBadge(categoryId) {
    const el = document.getElementById('cn-' + categoryId);
    if (!el) return;
    const imgs = nodeImages.get(categoryId) || [];
    const badge = el.querySelector('.cn-image-badge');
    if (badge) badge.textContent = imgs.length + (imgs.length === 1 ? ' img' : ' imgs');
    el.classList.toggle('has-images', imgs.length > 0);
}

function refreshImageGrid(categoryId) {
    const el = document.getElementById('cn-' + categoryId);
    if (!el) return;
    const grid = el.querySelector('.cn-image-grid');
    if (!grid) return;
    const imgs = nodeImages.get(categoryId) || [];
    grid.innerHTML = '';
    imgs.forEach(function(url, i) {
        const thumb = document.createElement('div');
        thumb.className = 'cn-image-thumb';
        thumb.style.backgroundImage = 'url(' + url + ')';
        const rmBtn = document.createElement('button');
        rmBtn.className = 'cn-image-remove';
        rmBtn.textContent = '\u00d7';
        rmBtn.title = 'Remove image';
        rmBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeImage(categoryId, i);
        });
        rmBtn.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        thumb.appendChild(rmBtn);
        grid.appendChild(thumb);
    });
}

function removeImage(categoryId, index) {
    const imgs = nodeImages.get(categoryId);
    if (!imgs) return;
    imgs.splice(index, 1);
    refreshImageGrid(categoryId);
    refreshImageBadge(categoryId);
}

function addImages(categoryId, files) {
    if (!files || !files.length) return;
    if (!nodeImages.has(categoryId)) nodeImages.set(categoryId, []);
    const imgs = nodeImages.get(categoryId);
    Array.from(files).forEach(function(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            if (imgs.length >= 6) imgs.shift();  // drop oldest if at cap
            imgs.push(e.target.result);
            refreshImageGrid(categoryId);
            refreshImageBadge(categoryId);
        };
        reader.readAsDataURL(file);
    });
}

function openImagePicker(categoryId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.addEventListener('change', function() {
        addImages(categoryId, this.files);
    });
    input.click();
}
```

**Verify:** No errors in console; functions exist on window scope.

---

## Step 4 — DOM: add grid, button, badge in `renderCategoryNodes()`

**Change:** After the `el.appendChild(closeBtn)` line (line 1256), append three new
elements before `el.addEventListener('click', ...)`:

```js
// T-001-06: image grid
const imgGrid = document.createElement('div');
imgGrid.className = 'cn-image-grid';
el.appendChild(imgGrid);

// T-001-06: add image button
const addImgBtn = document.createElement('button');
addImgBtn.className = 'cn-add-img-btn';
addImgBtn.textContent = '\uD83D\uDCF7 Add image +';
addImgBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    openImagePicker(cat.id);
});
addImgBtn.addEventListener('mousedown', function(e) { e.stopPropagation(); });
el.appendChild(addImgBtn);

// T-001-06: image count badge (collapsed state)
const badge = document.createElement('span');
badge.className = 'cn-image-badge';
el.appendChild(badge);
```

**Verify:** Expand a node — see "📷 Add image +" button below the textarea. Collapsed node
has no badge yet (no images). The grid is present but empty.

---

## Step 5 — DOM: restore image state on re-render

**Change:** After `world.appendChild(el)` in `renderCategoryNodes()`, add:

```js
// T-001-06: restore image state
refreshImageGrid(cat.id);
refreshImageBadge(cat.id);
```

**Verify:** Add an image, navigate away from page 3 and back — image is still present.

---

## Step 6 — Manual end-to-end verification

1. Load app, complete page 2, navigate to page 3 (mind map canvas)
2. Click any node to expand it — see "📷 Add image +" button
3. Click "Add image +" — file picker opens, accept only images
4. Select 1–2 images — thumbnails appear in grid
5. Hover thumbnail — × button appears; click × — thumbnail removed
6. Add 6 images — 6 thumbnails shown
7. Add a 7th image — oldest is dropped (still 6 total)
8. Collapse node — badge shows "6 imgs" in bottom-right of node
9. Expand again — thumbnails still present
10. Navigate to page 4 and back to page 3 — badge and thumbnails survive

---

## Testing Strategy

No automated test harness exists. All verification is manual browser testing following the
acceptance criteria checklist in step 6.

**Critical paths to test manually:**
- File picker opens on click
- Only image files accepted (try uploading a .txt — should be filtered by `accept`)
- Multiple file selection works
- Max 6 cap enforced (add 7+, confirm oldest dropped)
- Remove (×) works
- State survives page navigation within the session
- Collapsed badge reflects correct count
- Canvas pan does not trigger on interaction with grid/button

---

## Commit Plan

Single atomic commit after step 5 passes manual verification:

```
T-001-06: add mood image upload to category nodes
```

Changes: `mindshift.html` only.
