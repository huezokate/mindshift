// --- Global state ---
let userData = {};

// --- Page switching ---
function navigateToPage(pageNum) {
    document.querySelectorAll('.container').forEach(c => c.classList.remove('active'));
    document.getElementById('page' + pageNum).classList.add('active');
    document.body.classList.toggle('page5-active', pageNum === 5);
}

// URL param: ?page=N&persona=NAME to jump to a specific page for capture
(function() {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('page'), 10);
    const persona = params.get('persona');
    if (p >= 1 && p <= 6) {
        if (p === 5 && persona) {
            document.getElementById('personaTitle').textContent = '✨ ' + persona + '\'s Perspective';
            document.getElementById('personaIntro').textContent = 'Here\'s how ' + persona + ' might approach your situation.';
            document.getElementById('deepDiveContent').innerHTML = '<div class="deep-dive-section"><h4>Core Philosophy</h4><p>In the full version with AI integration, ' + persona + ' would provide their unique perspective.</p></div><div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;"><strong>💡 This is a preview.</strong> The full version will use the Anthropic API to generate authentic insights.</div>';
        }
        navigateToPage(p);
    }
})();

function showLoading(title, text) {
    document.getElementById('loadingTitle').textContent = title;
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function createMindMap() {
    userData = {
        now: document.getElementById('q1').value,
        future: document.getElementById('q2').value,
        stuck: document.getElementById('q3').value,
        area: document.getElementById('q4').value
    };

    if (!userData.now || !userData.future || !userData.stuck || !userData.area) {
        alert('Please answer all questions to create your map.');
        return;
    }

    showLoading('Generating your mind map...', 'Analyzing your current state and future vision');

    setTimeout(() => {
        hideLoading();
        navigateToPage(3);
    }, 2500);
}

// --- S-003: Flow routing (T-003-01) ---

function startFlow1() {
    userData.flow = 1;
    wizardStep = 0;
    wizardAnswers = {};
    showWizardStep(0);
    navigateToPage(2);
}

function startFlow2() {
    userData.flow = 2;
    userData.vent = '';
    userData.figure = null;
    // Reset to write step
    document.getElementById('ventWriteStep').style.display = 'block';
    document.getElementById('ventPickStep').style.display  = 'none';
    document.getElementById('ventText').value = '';
    document.getElementById('ventError').style.display = 'none';
    renderFigureCards();
    navigateToPage(6);
}

// --- S-003: Aspect Wizard (T-003-02) ---

const WIZARD_STEPS = [
    { key: 'career',        label: 'Career',           icon: '💼', question: 'In 5 years, where are you professionally?',                     placeholder: 'Your role, company, projects, level of impact…' },
    { key: 'creativity',    label: 'Creativity',        icon: '🎨', question: 'In 5 years, what creative work is part of your life?',           placeholder: 'Music, writing, art, design, building things…' },
    { key: 'health',        label: 'Health & Wellness', icon: '🌿', question: 'In 5 years, what does your health and energy feel like?',        placeholder: 'Physical fitness, mental clarity, routines, rest…' },
    { key: 'relationships', label: 'Relationships',     icon: '❤️', question: 'In 5 years, how do your closest relationships look?',            placeholder: 'Partner, friends, family, community…' },
    { key: 'travel',        label: 'Travel',            icon: '✈️', question: 'In 5 years, where have you been or where are you living?',       placeholder: 'Places visited, living abroad, home base…' },
    { key: 'finances',      label: 'Finances',          icon: '💰', question: 'In 5 years, what does your financial situation feel like?',      placeholder: 'Income, savings, freedom, security, investments…' },
    { key: 'living',        label: 'Living Situation',  icon: '🏡', question: 'In 5 years, where do you live and what does home feel like?',   placeholder: 'City, neighbourhood, apartment, house, vibe…' },
    { key: 'synthesis',     label: 'Your Vision',       icon: '✨', question: 'In one sentence: what does your ideal life look like in 5 years?', placeholder: 'A single sentence that captures the feeling of it all…' },
];
let wizardStep = 0;
let wizardAnswers = {};

function showWizardStep(step) {
    const s = WIZARD_STEPS[step];
    document.getElementById('wizard-icon').textContent = s.icon;
    document.getElementById('wizard-step-label').textContent = s.label;
    document.getElementById('wizard-question').textContent = s.question;
    const ta = document.getElementById('wizard-answer');
    ta.placeholder = s.placeholder;
    ta.value = wizardAnswers[s.key] || '';
    ta.focus();

    const prog = document.getElementById('wizard-progress');
    prog.innerHTML = WIZARD_STEPS.map(function(_, i) {
        const cls = i < step ? ' done' : i === step ? ' active' : '';
        return '<div class="wizard-dot' + cls + '"></div>';
    }).join('');

    document.getElementById('wizard-back-btn').style.display = step > 0 ? 'inline-block' : 'none';
    document.getElementById('wizard-next-btn').textContent =
        step === WIZARD_STEPS.length - 1 ? 'Build My Map →' : 'Next →';
}

function advanceWizard() {
    const s = WIZARD_STEPS[wizardStep];
    const val = document.getElementById('wizard-answer').value.trim();
    if (!val) { alert('Share something — even a few words is enough.'); return; }
    wizardAnswers[s.key] = val;
    wizardStep++;
    if (wizardStep >= WIZARD_STEPS.length) {
        userData.aspects = wizardAnswers;
        userData.future = wizardAnswers.synthesis;
        launchCanvas();
    } else {
        showWizardStep(wizardStep);
    }
}

function wizardBack() {
    const cur = WIZARD_STEPS[wizardStep];
    wizardAnswers[cur.key] = document.getElementById('wizard-answer').value.trim();
    wizardStep--;
    showWizardStep(wizardStep);
}

function launchCanvas() {
    showLoading('Building your mind map…', 'Visualising your 5-year vision');
    setTimeout(function() {
        hideLoading();
        navigateToPage(3);
    }, 2200);
}

// --- Back navigation ---

function backFromPage4() {
    if (userData.lensContext === 'vent') {
        navigateToPage(6);
        showFigurePickIfVented();
    } else {
        navigateToPage(3);
    }
}

function backFromPage5() {
    if (userData.lensContext === 'vent') {
        navigateToPage(6);
        showFigurePickIfVented();
    } else {
        navigateToPage(4);
    }
}

function backFromPage5ToHome() {
    if (userData.lensContext === 'vent') {
        navigateToPage(6);
        showFigurePickIfVented();
    } else {
        navigateToPage(3);
    }
}

function showFigurePickIfVented() {
    // If user already wrote a vent, restore pick step
    if (userData.vent) {
        setTimeout(function() {
            var summary = document.getElementById('ventSummaryText');
            if (summary) summary.textContent = userData.vent.length > 90 ? userData.vent.slice(0, 90) + '\u2026' : userData.vent;
            document.getElementById('ventWriteStep').style.display = 'none';
            document.getElementById('ventPickStep').style.display  = 'block';
            document.querySelectorAll('.figure-card').forEach(function(c) { c.classList.remove('selected'); });
        }, 50);
    }
}

// --- S-003: Per-node lens (T-003-04) ---

function applyNodeLens(catId) {
    userData.lensContext = catId;
    navigateToPage(4);
}

// Patch navigateToPage to toggle canvas-mode, centre view, and render nodes (T-001-01, T-001-02)
let _canvasCentred = false;

const _navigateToPage_orig = navigateToPage;
navigateToPage = function(n) {
    if (n === 3) {
        document.body.classList.add('canvas-mode');
        if (!_canvasCentred) {
            const root = document.getElementById('canvas-root');
            CanvasTransform.x = (root.offsetWidth  || window.innerWidth)  / 2;
            CanvasTransform.y = (root.offsetHeight || window.innerHeight) / 2;
            CanvasTransform.scale = 1;
            _canvasCentred = true;
        }
        initCanvas();
        renderHubNode();
        renderCategoryNodes(userData);
        renderArrows();
        // T-001-05: click-outside to collapse expanded node (register once)
        if (!_collapseListenerAdded) {
            document.getElementById('canvas-root').addEventListener('click', function(e) {
                if (!_expandedId) return;
                const expandedEl = document.getElementById('cn-' + _expandedId);
                if (expandedEl && !expandedEl.contains(e.target)) {
                    collapseNode();
                }
            });
            _collapseListenerAdded = true;
        }
    } else {
        // Remove canvas-mode when navigating away; preserve CanvasTransform for return trip
        document.body.classList.remove('canvas-mode');
    }
    // Page 5 — set labels + reset context bar when not from figure
    if (n === 5) {
        var isVent = userData.lensContext === 'vent';
        var backBtn = document.getElementById('page5BackBtn');
        var homeBtn = document.getElementById('page5HomeBtn');
        if (backBtn) backBtn.textContent = isVent ? '\u2190 Try Another Figure' : '\u2190 Try Another Lens';
        if (homeBtn) homeBtn.textContent = isVent ? 'Start Over' : 'Back to Map';
        // Context bar only for figure picks
        if (!userData.figure) {
            document.getElementById('persona-context-bar').classList.remove('visible');
            document.getElementById('personaVentContext').style.display = 'none';
        }
    }
    _navigateToPage_orig(n);
};
