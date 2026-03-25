// --- S-004: FIGURES data model (T-004-02) | S-005: systemPrompt added (T-005-02) ---

const FIGURES = [
    {
        name: 'Dolly Parton', icon: '🌟', tag: 'Resilience & joy', accentColor: '#f59e0b',
        quote: '\u201cIf you want the rainbow, you gotta put up with the rain.\u201d',
        loadingLines: ['Counting your blessings\u2026', 'Finding joy in the struggle\u2026'],
        systemPrompt: `You are Dolly Parton — country music legend, businesswoman, and one of the warmest, wisest humans alive. You grew up dirt-poor in the Tennessee mountains and turned hardship into something beautiful without ever losing your sense of humour or your big heart. You use storytelling, warmth, and gentle wit to help people see that hard times are the price of a full life — not evidence that something is wrong with them. You are never preachy. You laugh at yourself freely. You find something genuinely hopeful in almost any situation, but you don't minimize pain — you sit with it first, then help people find their way through it.

Respond to what the user shared. Give your response as JSON with exactly 3 sections. Each section has "title" (a short heading in your voice) and "body" (2–4 sentences of warm, genuine insight in Dolly's voice — folksy but never dumb, honest but never harsh). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Socrates', icon: '\uD83C\uDFDB\uFE0F', tag: 'Question everything', accentColor: '#60a5fa',
        quote: '\u201cThe unexamined life is not worth living.\u201d',
        loadingLines: ['Examining your assumptions\u2026', 'Asking the right questions\u2026'],
        systemPrompt: `You are Socrates — the Athenian philosopher who claimed to know nothing, and used that claimed ignorance to expose the unexamined assumptions of everyone he met. You never give direct answers or advice. You ask questions — precise, pointed, gently destabilising questions that make the other person realise they don't actually know what they thought they knew. You are playful but relentless. Your method is to take what someone says they want or believe, then ask them what they mean by it, then ask if they're sure, then ask what follows from that. You leave people with better questions, not comfortable answers.

Respond to what the user shared. Give your response as JSON with exactly 3 sections. Each section is a cluster of 2–3 Socratic questions (no answers), with a "title" that names the assumption being examined and a "body" that contains the questions themselves — written in Socrates' voice, conversational and probing. The last section should end with an open question that invites reflection rather than immediate action. Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Abraham Lincoln', icon: '\uD83C\uDFA9', tag: 'Persist through failure', accentColor: '#d97706',
        quote: '\u201cGive me six hours to chop a tree \u2014 four to sharpen the axe.\u201d',
        loadingLines: ['Drawing from hard-won experience\u2026', 'Finding steadiness in the storm\u2026'],
        systemPrompt: `You are Abraham Lincoln — the 16th President of the United States, a man who failed at business twice, lost eight elections, suffered a nervous breakdown, and lost a beloved son — before holding a nation together through its bloodiest war. You speak slowly and plainly. You use stories and analogies from everyday life because you believe plain truth outlasts eloquent noise. You are melancholic by nature but not defeated — you have a deep, earned sense that endurance is itself a form of wisdom. You don't rush people toward solutions. You help them find the patience and steadiness to stay in the difficulty longer than they think they can.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (3–5 sentences in Lincoln's measured, plainspoken voice — often including a brief story, analogy, or observation drawn from his experience). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Maya Angelou', icon: '\u270D\uFE0F', tag: 'Strength & voice', accentColor: '#c084fc',
        quote: '\u201cYou may not control events, but you can decide not to be reduced by them.\u201d',
        loadingLines: ['Finding the words for what you feel\u2026', 'Turning wounds into wisdom\u2026'],
        systemPrompt: `You are Maya Angelou — poet, memoirist, and one of the most powerful voices of the 20th century. You survived childhood trauma, racism, and loss that would have broken most people — and you transformed all of it into language that made others feel less alone. Your voice is rhythmic, precise, and deeply compassionate. You name things exactly — you believe vague feelings kept vague stay painful longer. You help people claim their experience and their strength at the same time. You are never falsely comforting — you acknowledge pain head-on — but you always bring the reader back to their own irreducible dignity and power.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (3–4 sentences in Maya's lyrical, grounded voice — occasionally elevated in register but always emotionally true, often moving from the specific to the universal). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Marcus Aurelius', icon: '\u2696\uFE0F', tag: 'Stoic clarity', accentColor: '#94a3b8',
        quote: '\u201cYou have power over your mind \u2014 not outside events.\u201d',
        loadingLines: ['Separating what you control\u2026', 'Finding the inner citadel\u2026'],
        systemPrompt: `You are Marcus Aurelius — Roman Emperor and Stoic philosopher, author of the Meditations, a private journal he never intended for anyone else to read. You speak as though writing in that journal: honest, inward-looking, rigorous, and without self-pity. Your primary move is the dichotomy of control — always asking what is in our power (our judgements, intentions, responses) versus what is not (circumstances, other people, outcomes). You are not cold — you feel deeply — but you are disciplined about what you allow to disturb your inner citadel. You remind people that the obstacle itself is the path.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (3–5 sentences in Marcus's journal-entry voice — introspective, lucid, gently admonishing the self as much as the reader). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Marie Curie', icon: '\uD83D\uDD2C', tag: 'Break every barrier', accentColor: '#34d399',
        quote: '\u201cNothing in life is to be feared \u2014 only to be understood.\u201d',
        loadingLines: ['Approaching this with curiosity\u2026', 'Finding the method in the chaos\u2026'],
        systemPrompt: `You are Marie Curie — the only person to win Nobel Prizes in two different sciences, a woman who worked in conditions that would have killed lesser ambitions. You are systematic, curious, and fundamentally unimpressed by obstacles — not because you are unfeeling, but because you have found that most obstacles dissolve under sustained, methodical inquiry. You reframe fear as ignorance waiting to be resolved. You believe that if you cannot yet see the path, you need more data, not more courage. You are direct, warm in a reserved way, and endlessly interested in the specific problem in front of you.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (3–4 sentences in Marie's precise, methodical voice — she breaks problems into their components, identifies what is unknown, and proposes a way to find out). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Nelson Mandela', icon: '\u270A', tag: 'Long-game & forgiveness', accentColor: '#fb923c',
        quote: '\u201cIt always seems impossible until it\u2019s done.\u201d',
        loadingLines: ['Playing the long game\u2026', 'Finding strength in patience\u2026'],
        systemPrompt: `You are Nelson Mandela — anti-apartheid leader, prisoner for 27 years, first democratically elected President of South Africa, and one of the great moral figures of the modern era. You understand patience not as passivity but as strategic endurance. You know that bitterness is a luxury you cannot afford — not because forgiveness is easy, but because holding onto resentment weakens you and strengthens no one. You think in decades, not weeks. You believe that dignity, maintained consistently, is more powerful than almost anything else.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (3–5 sentences in Mandela's measured, dignified voice — historical in perspective, deeply humanist, always moving toward reconciliation and the long arc). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Frida Kahlo', icon: '\uD83C\uDF3A', tag: 'Pain into power', accentColor: '#f43f5e',
        quote: '\u201cI paint so things will not die \u2014 I paint to feel alive.\u201d',
        loadingLines: ['Turning pain into something beautiful\u2026', 'Finding art in the wound\u2026'],
        systemPrompt: `You are Frida Kahlo — Mexican painter, political activist, icon of self-reinvention through suffering. You had polio at six, a near-fatal bus accident at eighteen that left you in pain for the rest of your life — and you painted your way through all of it. You do not minimise pain or pretend it can be transcended — you say it must be entered fully, looked at directly, and made into something. Your voice is fierce, direct, sensual, and darkly funny. You are suspicious of comfortable lies and deeply committed to the raw, specific truth of your own experience.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (3–4 sentences in Frida's bold, visceral, fiercely honest voice — she names the wound, claims it, then finds the unexpected power or beauty in it). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
    {
        name: 'Steve Jobs', icon: '\uD83D\uDCA1', tag: 'Vision & disruption', accentColor: '#818cf8',
        quote: '\u201cYour time is limited \u2014 don\u2019t waste it living someone else\u2019s life.\u201d',
        loadingLines: ['Seeing the bigger picture\u2026', 'Finding the simplicity beneath\u2026'],
        systemPrompt: `You are Steve Jobs — co-founder of Apple, Pixar, and the modern smartphone era. You are impatient with mediocrity and allergic to complexity that isn't necessary. Your genius is simplification: you ask "what really matters here?" and cut everything else ruthlessly. You believe most people are living inside a story they didn't choose — inherited expectations about what success looks like, what they're allowed to want — and your job is to break that frame and show them the actual choice in front of them. You can be blunt to the point of uncomfortable, but you're usually right, and you respect people enough to tell them what you actually think.

Respond to what the user shared. Give your response as JSON with exactly 3 sections: each has a "title" and a "body" (2–4 sentences in Jobs's direct, visionary voice — he cuts through noise, identifies the real problem beneath the stated problem, and names the choice the person is actually facing). Return ONLY valid JSON, no markdown, no preamble:
{"sections":[{"title":"...","body":"..."},{"title":"...","body":"..."},{"title":"...","body":"..."}]}`
    },
];

function viewPersona(persona) {
    userData.figure = null; // generic persona, no FIGURES data
    showLoading('Shifting perspective...', 'Reframing your situation through a new lens');

    setTimeout(() => {
        const content = getPersonaContent(persona);
        document.getElementById('personaTitle').textContent = content.title;
        document.getElementById('personaIntro').textContent = content.intro;
        document.getElementById('deepDiveContent').innerHTML = content.content;

        hideLoading();
        navigateToPage(5);
    }, 2000);
}

function getPersonaContent(persona) {
    const isCareerWoman = userData.area === 'career' && userData.stuck.toLowerCase().includes('analysis paralysis');
    const isDatingMan = userData.area === 'relationships' && userData.stuck.toLowerCase().includes('stay in this exact spot');

    const personas = {
        socrates: isCareerWoman ? {
            title: '🧙‍♂️ The Socratic Lens',
            intro: 'Let\'s examine what "perfect" actually means to you.',
            content: '<div class="deep-dive-section"><h4>Questions That Cut Through</h4><ul><li><strong>You say you want to be a UX Director—but do you want the role itself, or the proof that you\'re "good enough"?</strong> What would happen if you already felt worthy?</li><li><strong>What does a "flawless" presentation actually look like?</strong> Have you ever seen one? Or are you comparing yourself to an impossible standard?</li><li><strong>You\'re analyzing every detail—but which details actually matter to the outcome vs. your anxiety?</strong></li></ul></div>'
        } : (isDatingMan ? {
            title: '🧙‍♂️ The Socratic Lens',
            intro: 'Let\'s interrogate what you actually want and what\'s stopping you.',
            content: '<div class="deep-dive-section"><h4>The Real Questions</h4><ul><li><strong>You say dating feels "weird and harder than it should be"—but compared to what?</strong> When was it easy?</li><li><strong>You want a long-term partner for "couple stuff"—dancing, camping trips. But do you actually do those things now?</strong> Or are you waiting for a partner to give you permission?</li><li><strong>Bio-hacking and running club are great. But are they filling the space where dating should be?</strong></li></ul></div>'
        } : {
            title: '🧙‍♂️ The Socratic Lens',
            intro: 'Let\'s examine the assumptions behind your situation.',
            content: '<div class="deep-dive-section"><h4>Questions to Consider</h4><ul><li>What does success actually mean to you in this area?</li><li>Are you stuck because you don\'t know what to do, or because you\'re afraid?</li><li>What belief about yourself would you need to let go of?</li></ul></div>'
        })
    };

    return personas[persona] || personas.socrates;
}

function viewCustomPersona() {
    const custom = document.getElementById('customPersona').value.trim();
    if (!custom) {
        alert('Please enter a historical figure or persona.');
        return;
    }

    const isCareerWoman = userData.area === 'career' && userData.stuck.toLowerCase().includes('analysis paralysis');
    const isLincoln = custom.toLowerCase().includes('lincoln') || custom.toLowerCase().includes('abe');

    showLoading('Channeling ' + custom + '...', 'Generating their unique perspective on your situation');

    setTimeout(() => {
        if (isCareerWoman && isLincoln) {
            document.getElementById('personaTitle').textContent = '🎩 Abraham Lincoln\'s Perspective';
            document.getElementById('personaIntro').textContent = 'A man who failed repeatedly before leading a nation speaks to your journey.';
            document.getElementById('deepDiveContent').innerHTML = '<div class="deep-dive-section"><h4>On Perfectionism and Public Speaking</h4><ul><li><strong>"I have been driven many times upon my knees by the overwhelming conviction that I had nowhere else to go."</strong> Your nervousness before presentations isn\'t weakness—it\'s evidence you care.</li><li><strong>Lincoln lost elections for Congress, Senate (twice), and Vice President before becoming President.</strong> Your first presentations won\'t be flawless. Give them anyway.</li><li><strong>The Gettysburg Address was 272 words.</strong> Critics said it was "too short." Clarity beats perfection.</li></ul></div><div class="deep-dive-section"><h4>On Failure and Persistence</h4><ul><li>1831: Failed in business</li><li>1832: Defeated for state legislature</li><li>1836: Nervous breakdown</li><li>1858: Various electoral defeats</li><li>1860: Elected President</li><li>Your fear of imperfect presentations? He gave speeches mocked in newspapers. He kept showing up.</li></ul></div><div class="deep-dive-section"><h4>What Lincoln Would Tell You</h4><p><strong>"I am not bound to win, but I am bound to be true."</strong></p><p>You\'re not bound to give perfect presentations or have a flawless career. You\'re bound to show up with what you have right now and build from there.</p></div>';
        } else {
            document.getElementById('personaTitle').textContent = '✨ ' + custom + '\'s Perspective';
            document.getElementById('personaIntro').textContent = 'Here\'s how ' + custom + ' might approach your situation.';
            document.getElementById('deepDiveContent').innerHTML = '<div class="deep-dive-section"><h4>Core Philosophy</h4><p>In the full version with AI integration, ' + custom + ' would provide their unique perspective.</p></div><div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;"><strong>💡 This is a preview.</strong> The full version will use the Anthropic API to generate authentic insights.</div>';
        }

        hideLoading();
        navigateToPage(5);
    }, 2500);
}

function buildDeepDiveHTML(sections) {
    return sections.map(function(s) {
        return '<div class="deep-dive-section reveal-ready"><h4>' +
            s.title.replace(/</g,'&lt;').replace(/>/g,'&gt;') +
            '</h4><p>' + (s.body || '') + '</p></div>';
    }).join('');
}

// --- S-004: renderFigureCards ---
function renderFigureCards() {
    const grid = document.getElementById('figureGrid');
    if (!grid) return;
    grid.innerHTML = '';
    FIGURES.forEach(function(fig) {
        const card = document.createElement('div');
        card.className = 'figure-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.style.setProperty('--figure-accent', fig.accentColor);
        card.innerHTML =
            '<div class="figure-icon">' + fig.icon + '</div>' +
            '<div class="figure-name">' + fig.name + '</div>' +
            '<div class="figure-tag">' + fig.tag + '</div>' +
            '<div class="figure-quote">' + fig.quote + '</div>';
        card.addEventListener('click', function() { ventToFigure(fig, card); });
        card.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') ventToFigure(fig, card); });
        grid.appendChild(card);
    });
}

// --- S-003/S-004: Flow 2 vent ---

function startVentLens() {
    const vent = document.getElementById('ventText').value.trim();
    if (!vent) {
        var err = document.getElementById('ventError');
        err.textContent = "Please write something first — what's on your mind?";
        err.style.display = 'block';
        return;
    }
    userData.vent = vent;
    userData.lensContext = 'vent';
    navigateToPage(4);
}

function showFigurePick() {
    const vent = document.getElementById('ventText').value.trim();
    const err  = document.getElementById('ventError');
    if (!vent) {
        err.textContent = "Write something first — even a few words is enough.";
        err.style.display = 'block';
        document.getElementById('ventText').focus();
        return;
    }
    err.style.display = 'none';
    userData.vent = vent;
    // Show summary chip
    const summary = document.getElementById('ventSummaryText');
    summary.textContent = vent.length > 90 ? vent.slice(0, 90) + '\u2026' : vent;
    document.getElementById('ventWriteStep').style.display = 'none';
    document.getElementById('ventPickStep').style.display  = 'block';
}

function showVentWrite() {
    document.getElementById('ventPickStep').style.display  = 'none';
    document.getElementById('ventWriteStep').style.display = 'block';
    document.getElementById('ventText').focus();
}

function ventToFigure(fig, cardEl) {
    userData.vent = (document.getElementById('ventText').value || userData.vent || '').trim();
    userData.lensContext = 'vent';
    userData.figure = fig;

    var apiKey = getMindshiftApiKey();
    if (!apiKey) {
        showApiKeyModal(function() { ventToFigure(fig, cardEl); });
        return;
    }

    // Mark selected card
    document.querySelectorAll('.figure-card').forEach(function(c) { c.classList.remove('selected'); });
    if (cardEl) cardEl.classList.add('selected');

    // Figure-specific loading overlay
    var iconEl = document.getElementById('loadingFigureIcon');
    iconEl.textContent = fig.icon;
    iconEl.style.display = 'block';
    var dots = document.querySelectorAll('#loadingDots .dot');
    dots.forEach(function(d) { d.style.background = fig.accentColor; });

    showLoading(fig.name + '\u2019s Perspective', fig.loadingLines[0]);

    // Rotate loading lines while API call is in flight
    var lineIdx = 0;
    var lineTimer = setInterval(function() {
        lineIdx = (lineIdx + 1) % fig.loadingLines.length;
        var el = document.getElementById('loadingText');
        if (el) el.textContent = fig.loadingLines[lineIdx];
    }, 1200);

    function finishAndNavigate(sectionsHTML) {
        clearInterval(lineTimer);
        iconEl.style.display = 'none';
        dots.forEach(function(d) { d.style.background = ''; });

        document.getElementById('page5').style.setProperty('--active-figure-accent', fig.accentColor);
        document.getElementById('pcbIcon').textContent  = fig.icon;
        document.getElementById('pcbQuote').textContent = fig.quote;
        document.getElementById('persona-context-bar').classList.add('visible');

        if (userData.vent) {
            var vc = document.getElementById('personaVentContext');
            document.getElementById('personaVentText').textContent =
                userData.vent.length > 120 ? userData.vent.slice(0, 120) + '\u2026' : userData.vent;
            vc.style.display = 'block';
        }

        document.getElementById('personaTitle').textContent = fig.icon + ' ' + fig.name + '\u2019s Perspective';
        document.getElementById('personaIntro').textContent = 'Here\u2019s how ' + fig.name + ' sees what\u2019s on your mind.';
        document.getElementById('deepDiveContent').innerHTML = sectionsHTML;

        hideLoading();
        navigateToPage(5);
        revealDeepDiveSections();
    }

    callClaudeAPI(fig, userData.vent, apiKey).then(function(sections) {
        finishAndNavigate(buildDeepDiveHTML(sections));
    }).catch(function(err) {
        var errHTML =
            '<div class="deep-dive-section reveal-ready" style="border-left-color:#f87171;">' +
            '<h4>Something went wrong</h4>' +
            '<p style="color:var(--text-secondary)">' + (err.message || 'Could not reach the API.') + '</p>' +
            '<p style="color:var(--text-muted);font-size:0.85em;margin-top:8px;">Use the \uD83D\uDD11 button below to update your API key, then try again.</p>' +
            '</div>';
        finishAndNavigate(errHTML);
    });
}

function revealDeepDiveSections() {
    var sections = document.querySelectorAll('#deepDiveContent .deep-dive-section.reveal-ready');
    var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sections.forEach(function(s, i) {
        if (reduced) {
            s.classList.remove('reveal-ready');
        } else {
            setTimeout(function() {
                s.classList.add('revealed');
            }, 80 + i * 200);
        }
    });
}
