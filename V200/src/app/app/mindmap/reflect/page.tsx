'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme'

// ─── Sample data ───────────────────────────────────────────────────────────

const SAMPLE_GOAL = {
  category: 'Career',
  identity: 'a product thinker who learns by shipping and talking to users',
  currentMilestone: {
    month: 'June',
    headline: 'Become someone who runs informal user research',
    outcome: 'Have a real conversation with 6 working PMs by month 6.',
  },
}

const SAMPLE_STREAK = {
  currentWeeks: 7,
  longestWeeks: 11,
  restWeeksLeft: 2,
  // Milestone pace: months elapsed vs. milestones done — 0..1
  pace: 0.62,
}

const SAMPLE_PAST_REFLECTION = {
  date: 'May 26',
  evidence: 'Sent the LinkedIn DM I had been avoiding for three weeks. The PM I messaged responded the next day and we scheduled a 20-minute call.',
  friction: 'I keep rewriting messages instead of sending them. Adjustment: hit send within ten minutes of opening the doc.',
  meaning: 'Because the version of me who waits to feel ready is the same version who has been waiting for two years.',
}

const PROMPTS = {
  evidence: {
    label: 'Evidence',
    question: 'What\'s one concrete thing you did this week that moved you toward your goal?',
    helper: 'Even a small thing counts. Tiny is real.',
  },
  friction: {
    label: 'Friction',
    question: 'What got in the way, and what\'s one tiny adjustment for next week?',
    helper: 'Name the obstacle. Then name one change you can actually keep.',
  },
  meaning: {
    label: 'Meaning',
    question: 'Why does this goal still matter to you today?',
    helper: 'This question is the one that keeps the plan alive.',
  },
} as const

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ReflectPage() {
  const { setTheme } = useTheme()

  useEffect(() => { setTheme('notepad') }, [setTheme])

  const [evidence, setEvidence] = useState('')
  const [friction, setFriction] = useState('')
  const [meaning, setMeaning] = useState('')
  const [saved, setSaved] = useState(false)

  const ready = evidence.trim().length >= 6 && friction.trim().length >= 6 && meaning.trim().length >= 6

  function handleSave() {
    if (!ready) return
    setSaved(true)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '24px 20px 48px', gap: 20 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between" style={{ width: '100%', maxWidth: 480 }}>
        <a
          href="/app/mindmap"
          style={{
            color: 'var(--text-sub)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          ← Back
        </a>
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
          Sunday Reflection
        </p>
        <div style={{ width: 60 }} aria-hidden />
      </div>

      {/* Streak rings + max + rest weeks */}
      <div className="w-full" style={{ maxWidth: 480 }}>
        <StreakBlock />
      </div>

      {/* Identity reminder */}
      <div className="w-full" style={{ maxWidth: 480 }}>
        <IdentityCard />
      </div>

      {/* Reflection prompts */}
      {!saved ? (
        <>
          <div className="w-full flex flex-col" style={{ maxWidth: 480, gap: 16 }}>
            <SectionHeading
              eyebrow="This week"
              title="Three questions."
              sub="Take your time. Four to seven minutes is normal."
            />

            <PromptCard
              prompt={PROMPTS.evidence}
              value={evidence}
              onChange={setEvidence}
            />
            <PromptCard
              prompt={PROMPTS.friction}
              value={friction}
              onChange={setFriction}
            />
            <PromptCard
              prompt={PROMPTS.meaning}
              value={meaning}
              onChange={setMeaning}
            />

            <PrimaryButton disabled={!ready} onClick={handleSave}>
              Save this reflection
            </PrimaryButton>
          </div>

          <div className="w-full" style={{ maxWidth: 480 }}>
            <PastReflectionCard />
          </div>
        </>
      ) : (
        <SavedState />
      )}
    </div>
  )
}

// ─── Streak block ──────────────────────────────────────────────────────────

function StreakBlock() {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        padding: '16px 20px',
        filter: 'var(--card-filter, none)',
        display: 'flex',
        gap: 18,
        alignItems: 'center',
      }}
    >
      <StreakRings />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--cyan)',
            margin: 0,
          }}
        >
          {SAMPLE_GOAL.category} · Year 1
        </p>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '-0.3px',
            lineHeight: '24px',
            color: 'var(--text-h1)',
            margin: '2px 0',
          }}
        >
          {SAMPLE_STREAK.currentWeeks} week streak
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            lineHeight: '16px',
            color: 'var(--text-sub)',
            margin: 0,
          }}
        >
          Longest: {SAMPLE_STREAK.longestWeeks} weeks · {SAMPLE_STREAK.restWeeksLeft} rest weeks available
        </p>
      </div>
    </div>
  )
}

function StreakRings() {
  // Outer = pace (milestone progress vs. months elapsed)
  // Inner = "this week reflected" — binary, filled if streak is alive
  const outerSize = 64
  const r = 26
  const stroke = 4
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - SAMPLE_STREAK.pace)

  return (
    <div style={{ position: 'relative', width: outerSize, height: outerSize, flexShrink: 0 }}>
      <svg width={outerSize} height={outerSize}>
        {/* Outer pace ring — bg */}
        <circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={r}
          stroke="var(--text-meta)"
          strokeWidth={stroke}
          fill="none"
          opacity={0.3}
        />
        {/* Outer pace ring — fg */}
        <circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={r}
          stroke="var(--cyan)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${outerSize / 2} ${outerSize / 2})`}
        />
        {/* Inner reflection dot */}
        <circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={12}
          fill="var(--pink)"
        />
      </svg>
      <p
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '-0.3px',
          color: '#ffffff',
        }}
      >
        ✓
      </p>
    </div>
  )
}

// ─── Identity card ─────────────────────────────────────────────────────────

function IdentityCard() {
  return (
    <div
      style={{
        background: '#fef5f5',
        borderTop: '1.5px solid var(--cyan)',
        borderLeft: '4px solid var(--cyan)',
        borderRight: '1.5px solid var(--cyan)',
        borderBottom: '1.5px solid var(--cyan)',
        borderRadius: 'var(--card-radius)',
        padding: '14px 18px',
        filter: 'var(--card-filter, none)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--cyan)',
          margin: 0,
        }}
      >
        Right now
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: '22px',
          letterSpacing: '-0.2px',
          color: 'var(--text-h1)',
          margin: '4px 0 8px',
        }}
      >
        You are becoming {SAMPLE_GOAL.identity}.
      </p>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          lineHeight: '17px',
          color: 'var(--text-body)',
          margin: 0,
        }}
      >
        <strong style={{ fontWeight: 700, color: 'var(--pink)' }}>{SAMPLE_GOAL.currentMilestone.month}:</strong>{' '}
        {SAMPLE_GOAL.currentMilestone.headline.replace(/^Become someone who /, '')}
      </p>
    </div>
  )
}

// ─── Prompt card ───────────────────────────────────────────────────────────

function PromptCard({
  prompt,
  value,
  onChange,
}: {
  prompt: { label: string; question: string; helper: string }
  value: string
  onChange: (s: string) => void
}) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        padding: '14px 16px',
        filter: 'var(--card-filter, none)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--pink)',
          margin: 0,
        }}
      >
        {prompt.label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '22px',
          letterSpacing: '-0.2px',
          color: 'var(--text-h1)',
          margin: '4px 0 4px',
        }}
      >
        {prompt.question}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: 12,
          lineHeight: '16px',
          color: 'var(--text-sub)',
          margin: '0 0 10px',
        }}
      >
        {prompt.helper}
      </p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="…"
        rows={3}
        style={{
          width: '100%',
          background: 'var(--input-bg)',
          borderTop: 'var(--input-bt)',
          borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)',
          borderBottom: 'var(--input-bb)',
          borderRadius: 'var(--input-radius)',
          padding: '10px 12px',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          lineHeight: '20px',
          color: 'var(--text-body)',
          caretColor: 'var(--cyan)',
          outline: 'none',
          resize: 'vertical',
          minHeight: 64,
        }}
      />
    </div>
  )
}

// ─── Past reflection card ──────────────────────────────────────────────────

function PastReflectionCard() {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderTop: '1.5px solid var(--text-meta)',
        borderLeft: '4px solid var(--text-meta)',
        borderRight: '1.5px solid var(--text-meta)',
        borderBottom: '1.5px solid var(--text-meta)',
        borderRadius: 'var(--card-radius)',
        padding: '14px 18px',
        filter: 'var(--card-filter, none)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--text-sub)',
            margin: 0,
          }}
        >
          Last Sunday · {SAMPLE_PAST_REFLECTION.date}
        </p>
      </div>

      <PastLine label="Evidence" text={SAMPLE_PAST_REFLECTION.evidence} />
      <PastLine label="Friction" text={SAMPLE_PAST_REFLECTION.friction} />
      <PastLine label="Meaning" text={SAMPLE_PAST_REFLECTION.meaning} />
    </div>
  )
}

function PastLine({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--pink)',
          margin: '0 0 2px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: 12,
          lineHeight: '17px',
          color: 'var(--text-body)',
          margin: 0,
        }}
      >
        “{text}”
      </p>
    </div>
  )
}

// ─── Saved state ───────────────────────────────────────────────────────────

function SavedState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center"
      style={{ maxWidth: 480, gap: 16, marginTop: 24, textAlign: 'center' }}
    >
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 28,
          lineHeight: '34px',
          letterSpacing: '-0.5px',
          color: 'var(--text-h1)',
          margin: 0,
        }}
      >
        That&rsquo;s 8 weeks in a row.
      </p>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: '22px',
          color: 'var(--text-sub)',
          margin: 0,
        }}
      >
        Eight weeks of showing up for the version of you that you&rsquo;re becoming.
        We&rsquo;ll see you next Sunday.
      </p>
      <a
        href="/app/mindmap"
        style={{
          marginTop: 8,
          color: 'var(--cyan)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 1,
          textTransform: 'uppercase',
          textDecoration: 'underline',
        }}
      >
        Back to your year →
      </a>
    </motion.div>
  )
}

// ─── Reusable primitives ───────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
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
          fontSize: 24,
          lineHeight: '28px',
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
