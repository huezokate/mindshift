'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/lib/theme'

// ─── Sample data ───────────────────────────────────────────────────────────

const CATEGORIES: { id: string; label: string; tagline: string; mark: string }[] = [
  { id: 'career',        label: 'Career',               tagline: 'Direction, craft, impact',         mark: '✎' },
  { id: 'health',        label: 'Health & Wellness',    tagline: 'Body, mind, energy',               mark: '⌇' },
  { id: 'creativity',    label: 'Creativity',           tagline: 'Make, play, express',              mark: '✶' },
  { id: 'personal',      label: 'Personal Development', tagline: 'Know yourself, grow',              mark: '◯' },
  { id: 'relationships', label: 'Relationships',        tagline: 'Connect, deepen, repair',          mark: '✦' },
  { id: 'travel',        label: 'Travel',               tagline: 'Explore, wander, return',          mark: '✈' },
  { id: 'finances',      label: 'Finances',             tagline: 'Security, freedom, generosity',    mark: '$' },
]

type Candidate = {
  id: string
  headline: string
  outcome: string
  firstAction: string
  ifThen: string
}

// Stubbed Gemini pass-1 output for category="career" (12 candidates).
// In iteration 2 this comes from POST /api/mindmap/generate-candidates.
const SAMPLE_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    headline: 'Become someone who maps systems they touch',
    outcome: 'Sketch one product workflow each week to build PM-style thinking.',
    firstAction: 'Open a blank doc and sketch one workflow you touched today (3 min).',
    ifThen: 'If a project meeting ends, then I sketch the workflow we discussed.',
  },
  {
    id: 'c2',
    headline: 'Become someone who studies one PM thinker per month',
    outcome: 'Finish 12 PM books, essays, or interviews this year and write one takeaway each.',
    firstAction: 'Pick one PM newsletter and subscribe today (2 min).',
    ifThen: 'If it is Sunday morning, then I read for 20 minutes before email.',
  },
  {
    id: 'c3',
    headline: 'Become someone who talks to users every week',
    outcome: 'Run 30+ user interviews this year — even informal ones with friends.',
    firstAction: 'DM one user or customer this week with one open question.',
    ifThen: 'If I notice friction in a product I use, then I message a real user about it.',
  },
  {
    id: 'c4',
    headline: 'Become someone who writes product memos',
    outcome: 'Publish one memo a month on a product or decision you find interesting.',
    firstAction: 'Write 200 words on a product you love and why it works.',
    ifThen: 'If it is the first Saturday of the month, then I draft a memo.',
  },
  {
    id: 'c5',
    headline: 'Become someone who learns from real PMs',
    outcome: 'Have a real conversation with 6 working PMs by month 6.',
    firstAction: 'Ask one PM to a 20-minute coffee chat.',
    ifThen: 'If I see a thoughtful PM post online, then I send a kind note + ask one question.',
  },
  {
    id: 'c6',
    headline: 'Become someone who builds in public',
    outcome: 'Ship one small experiment or write-up monthly so the work is visible.',
    firstAction: 'Open a doc and write your week-1 PM thesis.',
    ifThen: 'If I finish a memo, then I post a 3-sentence summary somewhere public.',
  },
  {
    id: 'c7',
    headline: 'Become someone who runs prioritization frameworks fluently',
    outcome: 'Apply RICE or ICE to three real decisions and write what changed.',
    firstAction: 'Read one short article on RICE today.',
    ifThen: 'If I have a list of >5 things to do, then I score them with RICE.',
  },
  {
    id: 'c8',
    headline: 'Become someone who runs tiny experiments',
    outcome: 'Design and report on 4 tiny experiments at work or on a side project.',
    firstAction: 'Pick one assumption you hold and write the test that would prove it wrong.',
    ifThen: 'If I make a claim about users, then I write the experiment that would disprove it.',
  },
  {
    id: 'c9',
    headline: 'Become someone who tells crisp product stories',
    outcome: 'Practice the 2-sentence pitch on every project you touch.',
    firstAction: 'Pitch your current project in 2 sentences — to yourself, out loud.',
    ifThen: 'If someone asks what I am working on, then I answer in 2 sentences.',
  },
  {
    id: 'c10',
    headline: 'Become someone who interviews for PM roles',
    outcome: 'Take 6 real PM interviews this year — practice is the point.',
    firstAction: 'Update LinkedIn headline to reflect where you are heading.',
    ifThen: 'If a recruiter messages me, then I reply within 24 hours.',
  },
  {
    id: 'c11',
    headline: 'Become someone who keeps a portfolio',
    outcome: 'Document 4 case studies showing how you think about product.',
    firstAction: 'Start a Notion doc titled "PM Case Studies."',
    ifThen: 'If I ship something at work, then I add a note to the portfolio that week.',
  },
  {
    id: 'c12',
    headline: 'Become someone who networks with intention',
    outcome: 'Send 5 thoughtful notes a month to people whose work you admire.',
    firstAction: 'Send one LinkedIn note today to a PM you respect.',
    ifThen: 'If someone helps me, then I send a thank-you note within a week.',
  },
]

type Step = 'category' | 'woop' | 'gen1' | 'curate' | 'gen2' | 'review'

// ─── Page ──────────────────────────────────────────────────────────────────

export default function NewGoalPage() {
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => { setTheme('notepad') }, [setTheme])

  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<string>('')
  const [wish, setWish] = useState(
    'I want to transition into a product management role this year — I keep telling myself I am "not quite ready" but I think the truth is I have been avoiding starting.'
  )
  const [bestOutcome, setBestOutcome] = useState(
    'By next December I have interviewed for at least a few PM roles, even if I haven\'t taken one yet. I feel like I have stopped pretending and started doing.'
  )
  const [obstacle, setObstacle] = useState(
    'I tell myself I need to know more before I start. Reading replaces doing. I get scared of being seen as a beginner.'
  )
  const [identity, setIdentity] = useState(
    'a product thinker who learns by shipping and talking to users'
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggleSelected(id: string) {
    setSelectedIds(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  }

  const selectedCandidates = SAMPLE_CANDIDATES.filter(c => selectedIds.includes(c.id))

  return (
    <div className="min-h-dvh flex flex-col" style={{ padding: '24px 20px 32px' }}>
      {/* Top bar — back + step indicator */}
      <TopBar step={step} onBack={() => goBack(step, setStep, router)} />

      <div className="flex-1 flex flex-col items-center" style={{ paddingTop: 16 }}>
        <AnimatePresence mode="wait">
          {step === 'category' && (
            <StepWrap key="category">
              <CategoryStep
                category={category}
                onPick={setCategory}
                onNext={() => setStep('woop')}
              />
            </StepWrap>
          )}

          {step === 'woop' && (
            <StepWrap key="woop">
              <WoopStep
                wish={wish}
                setWish={setWish}
                bestOutcome={bestOutcome}
                setBestOutcome={setBestOutcome}
                obstacle={obstacle}
                setObstacle={setObstacle}
                identity={identity}
                setIdentity={setIdentity}
                onNext={() => {
                  setStep('gen1')
                  setTimeout(() => setStep('curate'), 1800)
                }}
              />
            </StepWrap>
          )}

          {step === 'gen1' && (
            <StepWrap key="gen1">
              <LoadingStep label="Drafting your year…" />
            </StepWrap>
          )}

          {step === 'curate' && (
            <StepWrap key="curate">
              <CurateStep
                candidates={SAMPLE_CANDIDATES}
                selectedIds={selectedIds}
                onToggle={toggleSelected}
                onNext={() => {
                  setStep('gen2')
                  setTimeout(() => setStep('review'), 1600)
                }}
              />
            </StepWrap>
          )}

          {step === 'gen2' && (
            <StepWrap key="gen2">
              <LoadingStep label="Weaving your timeline…" />
            </StepWrap>
          )}

          {step === 'review' && (
            <StepWrap key="review">
              <ReviewStep
                category={CATEGORIES.find(c => c.id === category) ?? CATEGORIES[0]}
                identity={identity}
                milestones={selectedCandidates.length ? selectedCandidates : SAMPLE_CANDIDATES.slice(0, 8)}
                onSave={() => router.push('/app/mindmap/reflect')}
              />
            </StepWrap>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StepWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="w-full flex flex-col items-center"
      style={{ maxWidth: 480 }}
    >
      {children}
    </motion.div>
  )
}

const STEPS_ORDER: Step[] = ['category', 'woop', 'gen1', 'curate', 'gen2', 'review']
const STEPS_LABELS: Record<Step, string> = {
  category: '1 of 4 · Choose',
  woop:     '2 of 4 · Tell us',
  gen1:     '· · ·',
  curate:   '3 of 4 · Curate',
  gen2:     '· · ·',
  review:   '4 of 4 · Review',
}

function goBack(step: Step, setStep: (s: Step) => void, router: ReturnType<typeof useRouter>) {
  const i = STEPS_ORDER.indexOf(step)
  if (i <= 0) router.push('/app/mindmap')
  else if (step === 'gen1' || step === 'gen2') router.push('/app/mindmap')
  else setStep(STEPS_ORDER[i - 1])
}

function TopBar({ step, onBack }: { step: Step; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between" style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-sub)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          padding: 4,
        }}
        aria-label="Back"
      >
        ← Back
      </button>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--text-sub)',
          margin: 0,
        }}
      >
        {STEPS_LABELS[step]}
      </p>
      <div style={{ width: 60 }} aria-hidden />
    </div>
  )
}

// ─── Step 1: Category ──────────────────────────────────────────────────────

function CategoryStep({
  category,
  onPick,
  onNext,
}: {
  category: string
  onPick: (id: string) => void
  onNext: () => void
}) {
  return (
    <div className="w-full flex flex-col" style={{ gap: 20 }}>
      <Heading
        eyebrow="Step 1"
        title="What part of your life are you focusing on this year?"
        sub="One area at a time. You can plan the next one when this one feels rooted."
      />

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CATEGORIES.map(c => {
          const active = category === c.id
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                background: active ? '#fef5f5' : 'var(--card-bg)',
                borderTop: 'var(--card-bt)',
                borderLeft: active ? '4px solid var(--cyan)' : 'var(--card-bl)',
                borderRight: 'var(--card-br)',
                borderBottom: 'var(--card-bb)',
                borderRadius: 'var(--card-radius)',
                padding: '14px 16px',
                filter: 'var(--card-filter, none)',
              }}
            >
              <div className="flex items-center" style={{ gap: 10, marginBottom: 4 }}>
                <span
                  aria-hidden
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    lineHeight: 1,
                    color: 'var(--pink)',
                  }}
                >
                  {c.mark}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: '-0.2px',
                    color: 'var(--text-h1)',
                  }}
                >
                  {c.label}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  lineHeight: '16px',
                  color: 'var(--text-sub)',
                  margin: 0,
                }}
              >
                {c.tagline}
              </p>
            </button>
          )
        })}
      </div>

      <PrimaryButton disabled={!category} onClick={onNext}>
        Continue →
      </PrimaryButton>
    </div>
  )
}

// ─── Step 2: WOOP input ────────────────────────────────────────────────────

function WoopStep({
  wish, setWish,
  bestOutcome, setBestOutcome,
  obstacle, setObstacle,
  identity, setIdentity,
  onNext,
}: {
  wish: string; setWish: (s: string) => void
  bestOutcome: string; setBestOutcome: (s: string) => void
  obstacle: string; setObstacle: (s: string) => void
  identity: string; setIdentity: (s: string) => void
  onNext: () => void
}) {
  const ready = wish.trim().length > 20 && obstacle.trim().length > 5 && identity.trim().length > 5

  return (
    <div className="w-full flex flex-col" style={{ gap: 18 }}>
      <Heading
        eyebrow="Step 2"
        title="Tell us about it."
        sub="We'll use this to draft milestones. Be honest — vague goals make vague plans."
      />

      <Field
        label="Your wish"
        helper="What's the goal? Describe it freely."
        value={wish}
        onChange={setWish}
        minRows={3}
      />
      <Field
        label="Best outcome"
        helper="If this goes well, what would that look like one year from now?"
        value={bestOutcome}
        onChange={setBestOutcome}
        minRows={3}
      />
      <Field
        label="Main obstacle"
        helper="What's most likely to get in the way? (This is the most important question.)"
        value={obstacle}
        onChange={setObstacle}
        minRows={2}
      />
      <Field
        label="I want to become…"
        helper="Finish the sentence: someone who…"
        prefix="someone who"
        value={identity}
        onChange={setIdentity}
        minRows={1}
      />

      <PrimaryButton disabled={!ready} onClick={onNext}>
        Generate milestones →
      </PrimaryButton>
    </div>
  )
}

// ─── Loading state (used between Gemini passes) ────────────────────────────

function LoadingStep({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 360, gap: 16 }}
    >
      <div className="flex items-center" style={{ gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--pink)',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          letterSpacing: 0.5,
          color: 'var(--text-sub)',
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  )
}

// ─── Step 4: Curate ────────────────────────────────────────────────────────

function CurateStep({
  candidates,
  selectedIds,
  onToggle,
  onNext,
}: {
  candidates: Candidate[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onNext: () => void
}) {
  const count = selectedIds.length
  const ready = count >= 4
  return (
    <div className="w-full flex flex-col" style={{ gap: 20 }}>
      <Heading
        eyebrow="Step 3"
        title="Pick the milestones that resonate."
        sub="Choose any that feel like real shifts. Six to ten usually works best for a year."
      />

      <div className="flex flex-col" style={{ gap: 12 }}>
        {candidates.map(c => (
          <CandidateCard
            key={c.id}
            candidate={c}
            selected={selectedIds.includes(c.id)}
            onToggle={() => onToggle(c.id)}
          />
        ))}
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          marginTop: 4,
          padding: '10px 14px',
          background: 'var(--card-bg)',
          borderTop: 'var(--card-bt)',
          borderLeft: 'var(--card-bl)',
          borderRight: 'var(--card-br)',
          borderBottom: 'var(--card-bb)',
          borderRadius: 'var(--card-radius)',
          filter: 'var(--card-filter, none)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: count >= 4 ? 'var(--cyan)' : 'var(--text-sub)',
            margin: 0,
          }}
        >
          {count} of {candidates.length} chosen
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-sub)',
            margin: 0,
          }}
        >
          {ready ? 'Looks good' : 'Pick at least 4'}
        </p>
      </div>

      <PrimaryButton disabled={!ready} onClick={onNext}>
        Build my year →
      </PrimaryButton>
    </div>
  )
}

function CandidateCard({
  candidate,
  selected,
  onToggle,
}: {
  candidate: Candidate
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        background: selected ? '#fef5f5' : 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: selected ? '4px solid var(--cyan)' : 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        padding: '14px 16px',
        filter: 'var(--card-filter, none)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <Checkbox checked={selected} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '-0.2px',
            lineHeight: '20px',
            color: 'var(--text-h1)',
            margin: '0 0 6px',
          }}
        >
          {candidate.headline}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: '18px',
            color: 'var(--text-body)',
            margin: '0 0 8px',
          }}
        >
          {candidate.outcome}
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            background: 'var(--bg)',
            border: '1px solid var(--input-divider)',
            borderRadius: 4,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              lineHeight: '14px',
              color: 'var(--text-sub)',
              margin: 0,
            }}
          >
            <span style={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--cyan)', fontWeight: 700 }}>
              First action ·{' '}
            </span>
            {candidate.firstAction}
          </p>
        </div>
      </div>
    </button>
  )
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: 4,
        border: '1.5px solid var(--text-body)',
        background: checked ? 'var(--cyan)' : 'var(--card-bg)',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        boxShadow: '1.5px 2px 0 var(--text-meta)',
        color: '#ffffff',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      {checked ? '✓' : ''}
    </span>
  )
}

// ─── Step 6: Review ────────────────────────────────────────────────────────

function ReviewStep({
  category,
  identity,
  milestones,
  onSave,
}: {
  category: { id: string; label: string; mark: string }
  identity: string
  milestones: Candidate[]
  onSave: () => void
}) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  // Distribute selected milestones across 12 months (roughly evenly)
  const placed = milestones.map((m, i) => ({
    ...m,
    month: months[Math.min(11, Math.floor((i / milestones.length) * 12))],
    index: i + 1,
  }))

  return (
    <div className="w-full flex flex-col" style={{ gap: 20 }}>
      <Heading
        eyebrow={`Step 4 · ${category.label}`}
        title={`Your year of ${category.label.toLowerCase()}.`}
        sub={`You are becoming someone who ${identity}.`}
      />

      <div className="flex flex-col" style={{ position: 'relative' }}>
        {/* Spine */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 27,
            top: 8,
            bottom: 8,
            width: 2,
            background:
              'repeating-linear-gradient(to bottom, var(--pink) 0 6px, transparent 6px 12px)',
          }}
        />

        {placed.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: 16, marginBottom: 14, position: 'relative' }}>
            {/* Month marker */}
            <div
              style={{
                width: 56,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 12,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--card-bg)',
                  border: '1.5px solid var(--pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: 'var(--card-filter, none)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 0.5,
                    color: 'var(--pink)',
                    margin: 0,
                  }}
                >
                  {m.month}
                </p>
              </div>
            </div>

            {/* Card */}
            <div
              style={{
                flex: 1,
                background: 'var(--card-bg)',
                borderTop: 'var(--card-bt)',
                borderLeft: 'var(--card-bl)',
                borderRight: 'var(--card-br)',
                borderBottom: 'var(--card-bb)',
                borderRadius: 'var(--card-radius)',
                padding: '12px 14px',
                filter: 'var(--card-filter, none)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '-0.2px',
                  lineHeight: '18px',
                  color: 'var(--text-h1)',
                  margin: '0 0 6px',
                }}
              >
                {m.headline}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  lineHeight: '16px',
                  color: 'var(--text-body)',
                  margin: '0 0 8px',
                }}
              >
                {m.outcome}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  fontSize: 11,
                  lineHeight: '14px',
                  color: 'var(--text-sub)',
                  margin: 0,
                }}
              >
                {m.ifThen}
              </p>
            </div>
          </div>
        ))}
      </div>

      <PrimaryButton onClick={onSave}>Save my year →</PrimaryButton>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          letterSpacing: 0.4,
          color: 'var(--text-meta)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        You can edit milestones any time. We&rsquo;ll nudge you for a Sunday reflection each week.
      </p>
    </div>
  )
}

// ─── Reusable primitives ───────────────────────────────────────────────────

function Heading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--pink)',
          margin: 0,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 26,
          lineHeight: '30px',
          letterSpacing: '-0.5px',
          color: 'var(--text-h1)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: '20px',
            color: 'var(--text-sub)',
            margin: '4px 0 0',
          }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  helper,
  value,
  onChange,
  prefix,
  minRows = 2,
}: {
  label: string
  helper?: string
  value: string
  onChange: (s: string) => void
  prefix?: string
  minRows?: number
}) {
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--cyan)',
          margin: 0,
        }}
      >
        {label}
      </p>
      {helper && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            lineHeight: '15px',
            color: 'var(--text-sub)',
            margin: '0 0 4px',
          }}
        >
          {helper}
        </p>
      )}
      <div
        style={{
          background: 'var(--input-bg)',
          borderTop: 'var(--input-bt)',
          borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)',
          borderBottom: 'var(--input-bb)',
          borderRadius: 'var(--input-radius)',
          padding: '10px 12px',
          display: 'flex',
          gap: 6,
          alignItems: 'flex-start',
        }}
      >
        {prefix && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: 13,
              lineHeight: '20px',
              color: 'var(--text-sub)',
              whiteSpace: 'nowrap',
            }}
          >
            {prefix}
          </span>
        )}
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={minRows}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: '20px',
            color: 'var(--text-body)',
            caretColor: 'var(--cyan)',
            minHeight: minRows * 20,
          }}
        />
      </div>
    </div>
  )
}

function PrimaryButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: 4,
        background: disabled ? '#ebe6dc' : 'var(--btn-bg)',
        color: disabled ? 'var(--btn-dis-color)' : 'var(--btn-color)',
        borderTop: 'var(--btn-bt)',
        borderLeft: 'var(--btn-bl)',
        borderRight: 'var(--btn-br)',
        borderBottom: 'var(--btn-bb)',
        borderRadius: 'var(--btn-radius)',
        padding: '14px 12px',
        fontFamily: 'var(--font-btn)',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: 'var(--btn-letter-spacing, -0.5px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        filter: disabled ? 'none' : 'var(--btn-filter, none)',
        width: '100%',
      }}
    >
      {children}
    </button>
  )
}
