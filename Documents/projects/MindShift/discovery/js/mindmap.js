// --- Canvas Infrastructure (T-001-01) ---

const CanvasTransform = {
    x: 0,
    y: 0,
    scale: 1,
    MIN_SCALE: 0.3,
    MAX_SCALE: 2.0,

    toScreen(wx, wy) {
        return {
            x: wx * this.scale + this.x,
            y: wy * this.scale + this.y
        };
    },

    toWorld(sx, sy) {
        return {
            x: (sx - this.x) / this.scale,
            y: (sy - this.y) / this.scale
        };
    },

    toCSSTransform() {
        return `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    },

    reset() {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
    }
};

function applyTransform() {
    const world = document.getElementById('canvas-world');
    if (world) world.style.transform = CanvasTransform.toCSSTransform();
}

let _canvasInitialized = false;

function initCanvas() {
    if (_canvasInitialized) {
        applyTransform();
        return;
    }
    _canvasInitialized = true;

    const root = document.getElementById('canvas-root');

    // --- Pan ---
    let dragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;

    root.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        panStartX = CanvasTransform.x;
        panStartY = CanvasTransform.y;
        root.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        CanvasTransform.x = panStartX + (e.clientX - dragStartX);
        CanvasTransform.y = panStartY + (e.clientY - dragStartY);
        applyTransform();
    });

    document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('dragging');
    });

    // --- Scroll Zoom ---
    root.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.min(Math.max(
            CanvasTransform.scale * factor,
            CanvasTransform.MIN_SCALE
        ), CanvasTransform.MAX_SCALE);

        const rect = root.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        CanvasTransform.x = mouseX - (mouseX - CanvasTransform.x) * (newScale / CanvasTransform.scale);
        CanvasTransform.y = mouseY - (mouseY - CanvasTransform.y) * (newScale / CanvasTransform.scale);
        CanvasTransform.scale = newScale;
        applyTransform();
    }, { passive: false });

    // --- Touch: single-finger pan + two-finger pinch zoom ---
    let lastTouches = null;

    root.addEventListener('touchstart', (e) => {
        lastTouches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
        e.preventDefault();
    }, { passive: false });

    root.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));

        if (touches.length === 1 && lastTouches && lastTouches.length === 1) {
            CanvasTransform.x += touches[0].x - lastTouches[0].x;
            CanvasTransform.y += touches[0].y - lastTouches[0].y;
        } else if (touches.length === 2 && lastTouches && lastTouches.length === 2) {
            const prevDist = Math.hypot(
                lastTouches[1].x - lastTouches[0].x,
                lastTouches[1].y - lastTouches[0].y
            );
            const newDist = Math.hypot(
                touches[1].x - touches[0].x,
                touches[1].y - touches[0].y
            );
            const factor = newDist / prevDist;
            const newScale = Math.min(Math.max(
                CanvasTransform.scale * factor,
                CanvasTransform.MIN_SCALE
            ), CanvasTransform.MAX_SCALE);

            const rect = root.getBoundingClientRect();
            const midX = (touches[0].x + touches[1].x) / 2 - rect.left;
            const midY = (touches[0].y + touches[1].y) / 2 - rect.top;

            CanvasTransform.x = midX - (midX - CanvasTransform.x) * (newScale / CanvasTransform.scale);
            CanvasTransform.y = midY - (midY - CanvasTransform.y) * (newScale / CanvasTransform.scale);
            CanvasTransform.scale = newScale;

            const prevMidX = (lastTouches[0].x + lastTouches[1].x) / 2;
            const prevMidY = (lastTouches[0].y + lastTouches[1].y) / 2;
            CanvasTransform.x += (touches[0].x + touches[1].x) / 2 - prevMidX;
            CanvasTransform.y += (touches[0].y + touches[1].y) / 2 - prevMidY;
        }

        lastTouches = touches;
        applyTransform();
    }, { passive: false });

    root.addEventListener('touchend', (e) => {
        lastTouches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
    });

    // --- Zoom Buttons ---
    document.getElementById('zoom-in-btn').addEventListener('click', () => {
        const rect = root.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const newScale = Math.min(CanvasTransform.scale * 1.2, CanvasTransform.MAX_SCALE);
        CanvasTransform.x = cx - (cx - CanvasTransform.x) * (newScale / CanvasTransform.scale);
        CanvasTransform.y = cy - (cy - CanvasTransform.y) * (newScale / CanvasTransform.scale);
        CanvasTransform.scale = newScale;
        applyTransform();
    });

    document.getElementById('zoom-out-btn').addEventListener('click', () => {
        const rect = root.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const newScale = Math.max(CanvasTransform.scale / 1.2, CanvasTransform.MIN_SCALE);
        CanvasTransform.x = cx - (cx - CanvasTransform.x) * (newScale / CanvasTransform.scale);
        CanvasTransform.y = cy - (cy - CanvasTransform.y) * (newScale / CanvasTransform.scale);
        CanvasTransform.scale = newScale;
        applyTransform();
    });

    document.getElementById('zoom-reset-btn').addEventListener('click', () => {
        CanvasTransform.reset();
        applyTransform();
    });

    applyTransform();
}

// --- Hub Node (T-001-02) ---

const HUB_CATEGORIES = [
    'career', 'personal development', 'relationships',
    'health & wellness', 'travel', 'finances', 'creativity'
];

function renderHubNode() {
    const world = document.getElementById('canvas-world');
    let hub = document.getElementById('hub-node');
    if (!hub) {
        hub = document.createElement('div');
        hub.id = 'hub-node';
        hub.innerHTML =
            '<div class="hub-label">In 5 years\u2026</div>' +
            '<div class="hub-body"></div>' +
            '<div class="hub-subtitle"></div>';
        world.appendChild(hub);
    }

    const body = hub.querySelector('.hub-body');
    const subtitle = hub.querySelector('.hub-subtitle');
    const text = (userData && userData.future && userData.future.trim()) || '';

    if (text) {
        body.textContent = text;
        body.classList.remove('placeholder');
    } else {
        body.textContent = 'Your 5-year vision will appear here.';
        body.classList.add('placeholder');
    }

    subtitle.textContent = HUB_CATEGORIES.join(' \u00b7 ');
}

// --- Category Nodes (T-001-03) ---

const CATEGORY_NODES = [
    {
        id: 'career',
        label: 'career',
        colorClass: 'cn-career',
        shapeClass: 'cn-shape-ellipse',
        width: 180, height: 150,
        wx: 0,    wy: -260,
        header: 'I work at a company I love',
        goals: ['Senior IC or lead role', 'Work I\'m proud of', 'Strong team relationships'],
        areaKey: 'career',
    },
    {
        id: 'creativity',
        label: 'creativity',
        colorClass: 'cn-creativity',
        shapeClass: 'cn-shape-triangle',
        width: 175, height: 175,
        wx: 240,  wy: -160,
        header: 'I publish my novel',
        goals: ['Write 500 words daily', 'Finish first draft', 'Find a writing group'],
        areaKey: null,
    },
    {
        id: 'health',
        label: 'health & wellness',
        colorClass: 'cn-health',
        shapeClass: 'cn-shape-diamond',
        width: 175, height: 175,
        wx: 290,  wy: 60,
        header: 'I feel strong & energized',
        goals: ['Run 3× per week', 'Sleep 7–8 hrs', 'Consistent nutrition'],
        areaKey: 'health',
    },
    {
        id: 'relationships',
        label: 'relationships',
        colorClass: 'cn-relationships',
        shapeClass: 'cn-shape-blob',
        width: 180, height: 170,
        wx: 165,  wy: 270,
        header: 'I have deep connections',
        goals: ['Weekly quality time', 'Honest communication', 'New friendships'],
        areaKey: 'relationships',
    },
    {
        id: 'travel',
        label: 'travel',
        colorClass: 'cn-travel',
        shapeClass: 'cn-shape-pentagon',
        width: 180, height: 170,
        wx: -165, wy: 270,
        header: 'I explore the world',
        goals: ['2 international trips/yr', 'Learn a new language', 'Live abroad 3 mo'],
        areaKey: null,
    },
    {
        id: 'finances',
        label: 'finances',
        colorClass: 'cn-finances',
        shapeClass: 'cn-shape-rect',
        width: 168, height: 135,
        wx: -290, wy: 60,
        header: 'I am financially free',
        goals: ['6-month emergency fund', 'Consistent investing', 'Debt-free'],
        areaKey: 'money',
    },
    {
        id: 'living',
        label: 'living situation',
        colorClass: 'cn-living',
        shapeClass: 'cn-shape-rect-tall',
        width: 158, height: 195,
        wx: -240, wy: -160,
        header: 'I live where I thrive',
        goals: ['Own or rent a space I love', 'Intentional neighbourhood', 'Home that feels like me'],
        areaKey: null,
    },
];

function renderCategoryNodes(userData) {
    const world = document.getElementById('canvas-world');
    if (!world) return;
    // Idempotent: remove existing nodes
    world.querySelectorAll('.canvas-node').forEach(el => el.remove());

    CATEGORY_NODES.forEach(function(cat) {
        const el = document.createElement('div');
        el.className = 'canvas-node ' + cat.colorClass + ' ' + cat.shapeClass;
        el.id = 'cn-' + cat.id;
        el.style.width  = cat.width  + 'px';
        el.style.height = cat.height + 'px';
        el.style.left   = (cat.wx - cat.width  / 2) + 'px';
        el.style.top    = (cat.wy - cat.height / 2) + 'px';

        // Derive node header + goals from user answers (T-001-07)
        const derived = deriveNodeContent(cat, userData);
        const goals = derived.goals;
        const header = derived.header;

        el.innerHTML =
            '<span class="cn-label">' + cat.label + '</span>' +
            '<span class="cn-header">' + header + '</span>' +
            '<ul class="cn-goals">' +
            goals.map(function(g) { return '<li>' + g + '</li>'; }).join('') +
            '</ul>';

        // Textarea for goal editing (T-001-05)
        const ta = document.createElement('textarea');
        ta.className = 'cn-edit-area';
        ta.placeholder = 'Add or refine your goals\u2026';
        if (nodeEdits.has(cat.id)) ta.value = nodeEdits.get(cat.id);
        ta.addEventListener('input', function() { nodeEdits.set(cat.id, ta.value); });
        ta.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        ta.addEventListener('wheel',     function(e) { e.stopPropagation(); });
        el.appendChild(ta);

        // Close button (T-001-05)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'cn-close-btn';
        closeBtn.textContent = '\u2715';
        closeBtn.title = 'Collapse';
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            collapseNode();
        });
        el.appendChild(closeBtn);

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

        // T-003-04: apply-a-lens button (expanded state only)
        const lensBtn = document.createElement('button');
        lensBtn.className = 'cn-lens-btn';
        lensBtn.textContent = '🔮 Apply a Lens';
        lensBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            applyNodeLens(cat.id);
        });
        lensBtn.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        el.appendChild(lensBtn);

        // T-001-06: image count badge (collapsed state)
        const imgBadge = document.createElement('span');
        imgBadge.className = 'cn-image-badge';
        el.appendChild(imgBadge);

        // Stop canvas pan when interacting with expanded node (T-001-05)
        el.addEventListener('mousedown', function(e) {
            if (_expandedId === cat.id) e.stopPropagation();
        });

        el.addEventListener('click', function() { onNodeClick(cat.id); });
        world.appendChild(el);

        // T-001-06: restore image state on re-render
        refreshImageGrid(cat.id);
        refreshImageBadge(cat.id);
    });
}

// T-001-05: expand state
const nodeEdits = new Map();   // categoryId → textarea value (session persistence)
let _expandedId = null;
let _collapseListenerAdded = false;

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
            if (imgs.length >= 6) imgs.shift();
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

function collapseNode() {
    if (!_expandedId) return;
    const el = document.getElementById('cn-' + _expandedId);
    const cat = CATEGORY_NODES.find(function(c) { return c.id === _expandedId; });
    if (el && cat) {
        el.classList.remove('cn-expanded');
        el.style.width  = cat.width  + 'px';
        el.style.height = cat.height + 'px';
    }
    _expandedId = null;
}

function expandNode(categoryId) {
    const el = document.getElementById('cn-' + categoryId);
    if (!el) return;
    el.classList.add('cn-expanded');
    const ta = el.querySelector('.cn-edit-area');
    if (ta && nodeEdits.has(categoryId)) {
        ta.value = nodeEdits.get(categoryId);
    }
    _expandedId = categoryId;
}

function onNodeClick(categoryId) {
    if (_expandedId === categoryId) {
        collapseNode();
        return;
    }
    collapseNode();
    expandNode(categoryId);
}

// T-001-05: global Escape key — collapse expanded node
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _expandedId) collapseNode();
});

// --- Arrow Connectors (T-001-04) ---

const ARROW_OFFSETS = [35, -30, 40, -25, 30, -40, 28];

function ellipseEdge(cx, cy, rx, ry, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: cx, y: cy };
    const ux = dx / len, uy = dy / len;
    const t = 1 / Math.sqrt((ux / rx) * (ux / rx) + (uy / ry) * (uy / ry));
    return { x: cx + ux * t, y: cy + uy * t };
}

function renderArrows() {
    const world = document.getElementById('canvas-world');
    if (!world) return;
    const hub = document.getElementById('hub-node');
    if (!hub) return;

    const hubRx = hub.offsetWidth  / 2;
    const hubRy = hub.offsetHeight / 2;

    const existing = document.getElementById('canvas-arrows');
    if (existing) existing.remove();

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'canvas-arrows';

    const defs = document.createElementNS(NS, 'defs');
    const marker = document.createElementNS(NS, 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('refX', '7');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    const arrowPoly = document.createElementNS(NS, 'polygon');
    arrowPoly.setAttribute('points', '0 0, 8 3, 0 6');
    arrowPoly.setAttribute('fill', '#2d2d2d');
    arrowPoly.setAttribute('opacity', '0.7');
    marker.appendChild(arrowPoly);
    defs.appendChild(marker);
    svg.appendChild(defs);

    CATEGORY_NODES.forEach(function(cat, i) {
        const nx = cat.wx, ny = cat.wy;
        const nrx = cat.width / 2, nry = cat.height / 2;

        const start = ellipseEdge(nx, ny, nrx, nry, 0, 0);
        const end   = ellipseEdge(0, 0, hubRx, hubRy, nx, ny);

        const edx = end.x - start.x, edy = end.y - start.y;
        const elen = Math.sqrt(edx * edx + edy * edy) || 1;
        const pux = -edy / elen, puy = edx / elen;
        const off = ARROW_OFFSETS[i];

        const cp1x = start.x * 0.65 + end.x * 0.35 + pux * off;
        const cp1y = start.y * 0.65 + end.y * 0.35 + puy * off;
        const cp2x = start.x * 0.35 + end.x * 0.65 + pux * off;
        const cp2y = start.y * 0.35 + end.y * 0.65 + puy * off;

        const d = 'M ' + start.x + ' ' + start.y +
                  ' C ' + cp1x + ' ' + cp1y +
                  ' '   + cp2x + ' ' + cp2y +
                  ' '   + end.x + ' ' + end.y;

        const path = document.createElementNS(NS, 'path');
        path.setAttribute('id', 'arrow-' + cat.id);
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#2d2d2d');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('opacity', '0.65');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(path);
    });

    world.insertBefore(svg, world.firstChild);
}

// --- Canvas Flow Wiring (T-001-07) ---

function onCanvasBackClick() {
    if (!confirm('Going back will reset your mind map. Continue?')) return;
    collapseNode();
    nodeEdits.clear();
    userData = {};
    _canvasCentred = false;
    CanvasTransform.reset();
    applyTransform();
    navigateToPage(1);
}

function deriveNodeContent(cat, ud) {
    let header = cat.header;
    let goals = cat.goals.slice();

    if (!ud || !ud.area) return { header: header, goals: goals };

    if (cat.areaKey && cat.areaKey === ud.area) {
        // Career node: use q1 (current situation) for header context
        if (cat.id === 'career' && ud.now && ud.now.trim()) {
            const snippet = ud.now.trim().slice(0, 50);
            header = 'From: ' + snippet + (ud.now.trim().length > 50 ? '\u2026' : '');
        }
        // Prepend future-vision snippet to goals for the area-matched node
        if (ud.future && ud.future.trim()) {
            const futureSnippet = ud.future.trim().slice(0, 60);
            goals.unshift(futureSnippet + (ud.future.trim().length > 60 ? '\u2026' : ''));
        }
    }

    return { header: header, goals: goals };
}
