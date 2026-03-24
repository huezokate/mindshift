# Plan: T-001-07 wire-into-app-flow

## Implementation Steps

### Step 1 — Remove dead CSS (`.mindmap`, `.node`, `.connector`)
**File:** `mindshift.html` lines ~128–158
**Change:** Delete the `.mindmap { }`, `.node { }`, `.node h4 { }`, `.node-content { }`,
`.connector { }` CSS rule blocks.
**Verify:** HTML page still renders; no visible change (these classes have no HTML).

### Step 2 — Remove dead JS functions
**File:** `mindshift.html` lines ~780–847
**Change:** Delete `generateGaps()`, `generateLevers()`, `generateMoves()`.
**Verify:** No JS errors on page load or navigation; these functions are never called.

### Step 3 — Add CSS for canvas nav buttons
**File:** `mindshift.html` — CSS section, after `/* === Node Expand Detail (T-001-05) === */`
**Change:** Add `/* === Canvas Nav Buttons (T-001-07) === */` section with rules for
`#canvas-lens-btn` and `#canvas-back-btn` as specified in structure.md.
**Verify:** Classes exist in stylesheet (browser DevTools); no visual change yet (HTML not added).

### Step 4 — Add HTML buttons inside `#canvas-root`
**File:** `mindshift.html` — inside `#page3 > #canvas-root`, after `#canvas-controls` div
**Change:**
```html
<button id="canvas-back-btn" onclick="onCanvasBackClick()" title="Back to form">← Back</button>
<button id="canvas-lens-btn" onclick="navigateToPage(4)">Choose Your Lens →</button>
```
**Verify:** Open page3 (via ?page=3 URL param); two buttons visible at correct positions.

### Step 5 — Add `onCanvasBackClick()` function
**File:** `mindshift.html` — JS section, before the `navigateToPage` patch
**Change:**
```js
function onCanvasBackClick() {
    if (!confirm('Going back will reset your mind map. Continue?')) return;
    collapseNode();
    nodeEdits.clear();
    userData = {};
    _canvasCentred = false;
    CanvasTransform.reset();
    applyTransform();
    navigateToPage(2);
}
```
**Verify:** On canvas, click "← Back"; confirm dialog appears; confirm → lands on page2 with
empty form state; cancel → stays on canvas.

### Step 6 — Fix navigateToPage patch (preserve CanvasTransform on page4/5)
**File:** `mindshift.html` — navigateToPage patch `else if` branch (~line 1421)
**Change:** Remove `CanvasTransform.reset(); applyTransform();` from the else branch.
Keep `document.body.classList.remove('canvas-mode')`.
**Verify:** Navigate canvas → page4 → Back to Map; canvas pan position is preserved.

### Step 7 — Add `deriveNodeContent(cat, userData)` function
**File:** `mindshift.html` — before `renderCategoryNodes` in the Category Nodes section
**Change:** Implement the derivation helper (see structure.md). Key logic:
```js
function deriveNodeContent(cat, userData) {
    let header = cat.header;
    let goals = cat.goals.slice();

    if (!userData || !userData.area) return { header, goals };

    // Area-matched node gets dynamic header + future-snippet goal
    if (cat.areaKey && cat.areaKey === userData.area) {
        // Career node (q1 → header, q4 confirms area)
        if (cat.id === 'career' && userData.now && userData.now.trim()) {
            const snippet = userData.now.trim().slice(0, 50);
            header = 'From: ' + snippet + (userData.now.trim().length > 50 ? '…' : '');
        }
        // Future snippet prepended to goals (all area-matched nodes)
        if (userData.future && userData.future.trim()) {
            const futureSnippet = userData.future.trim().slice(0, 60);
            goals.unshift(futureSnippet + (userData.future.trim().length > 60 ? '…' : ''));
        }
    }

    return { header, goals };
}
```

### Step 8 — Update `renderCategoryNodes` to call `deriveNodeContent`
**File:** `mindshift.html` — inside `renderCategoryNodes` forEach
**Change:** Replace current inline goals derivation and `cat.header` usage with:
```js
const derived = deriveNodeContent(cat, userData);
const goals = derived.goals;
const header = derived.header;
// then use `header` instead of `cat.header` in innerHTML
```
Remove the old 4-line block (lines 1224–1227) that did the future-snippet prepend.
**Verify:** Navigate to page3; career node shows "From: [q1 text]" header when area=career;
future snippet in goals for matched area.

---

## Testing Strategy

No automated test harness (vanilla single-file). Manual verification per AC:

### AC1: Onboarding → canvas
- [ ] Fill page2 form; click "Create My Map →"; see loading; land on canvas (page3)
- [ ] Hub `.hub-body` shows q2 (future) text

### AC2: Onboarding data populates canvas
- [ ] With area=career: career node header shows "From: [q1 snippet]"; goals include q2 snippet
- [ ] With area=health: health node goals include q2 snippet; other nodes unchanged
- [ ] Hub subtitle still shows category labels

### AC3: "Choose Your Lens →" button
- [ ] Button visible at bottom-left of canvas
- [ ] Click → lands on page4

### AC4: "← Back to Map" from persona screen
- [ ] page4 "← Back to Map" → returns to page3
- [ ] Nodes still rendered; nodeEdits textarea values still present
- [ ] Canvas pan/zoom position is the same as when left (fix Step 6 verified)
- [ ] page5 "Back to Map" → same result

### AC5: Old page3 removed
- [ ] No old `.mindmap` / `.node` / `.connector` HTML present in page3
- [ ] No JS errors from removed functions

### AC6: Back to form with warning
- [ ] "← Back" button visible at top-left of canvas
- [ ] Click → confirm dialog: "Going back will reset your mind map. Continue?"
- [ ] Cancel → stays on canvas, state intact
- [ ] Confirm → lands on page2; hub/nodes reset on next visit; re-fill and re-submit → fresh canvas

### AC7: Single file, no server
- [ ] Open mindshift.html directly in browser (file:// protocol); all pages functional

---

## Commit Plan

One commit covering all steps (all changes are interdependent; individual steps are
small enough that a single commit at the end is clean).

Commit message: `T-001-07: wire canvas into app flow — nav buttons, state preservation, dynamic node content, dead code removal`
