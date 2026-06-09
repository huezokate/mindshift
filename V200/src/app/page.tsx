'use client'
import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { getSupabase } from '@/lib/supabase'

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL ?? ''
const TRY_URL = `${APP_BASE}/app/theme-select`
const WAITLIST_CONTACT = 'hello@minds-shift.com'
const BUSINESS_CONTACT = 'kate@minds-shift.com'

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      <Hero />
      <FigureDemo />
      <Waitlist />
      <WhoIsItFor />
      <OriginStory />
      <Investors />
    </div>
  )
}

function Section({
  children,
  maxWidth = 720,
  paddingY = '96px',
}: {
  children: React.ReactNode
  maxWidth?: number
  paddingY?: string
}) {
  return (
    <section style={{ padding: `${paddingY} 24px` }}>
      <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase"
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 1.4,
        lineHeight: '14px',
        color: 'var(--violet)',
      }}
    >
      {children}
    </p>
  )
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="uppercase"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'clamp(40px, 8vw, 72px)',
        letterSpacing: 4,
        color: 'var(--cyan)',
        lineHeight: 1,
      }}
    >
      {children}
    </h1>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'clamp(28px, 4vw, 40px)',
        letterSpacing: 3,
        color: 'var(--cyan)',
        lineHeight: 1.1,
      }}
    >
      {children}
    </h2>
  )
}

function Body({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: size,
        letterSpacing: 0.4,
        lineHeight: 1.6,
        color: 'var(--text-body)',
      }}
    >
      {children}
    </p>
  )
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-block text-center uppercase transition-opacity hover:opacity-80 active:scale-95"
      style={{
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: 'var(--btn-letter-spacing, 3px)',
        color: 'var(--btn-color)',
        background: 'var(--btn-bg)',
        borderTop: 'var(--btn-bt)',
        borderLeft: 'var(--btn-bl)',
        borderRight: 'var(--btn-br)',
        borderBottom: 'var(--btn-bb)',
        borderRadius: 'var(--btn-radius)',
        padding: '14px 32px',
        boxShadow: 'var(--btn-shadow)',
        filter: 'var(--btn-filter, none)',
      }}
    >
      {children}
    </a>
  )
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="uppercase transition-opacity hover:opacity-70"
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: 2,
        color: 'var(--violet)',
        textDecoration: 'underline',
        textUnderlineOffset: 4,
      }}
    >
      {children}
    </a>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        padding: 32,
        boxShadow: 'var(--card-shadow)',
        filter: 'var(--card-filter, none)',
      }}
    >
      {children}
    </div>
  )
}

const DEMO_VENT = "I feel like a failure today. I try so hard and nothing's going my way."

type Vignette = { id: string; name: string; era: string; img: string; response: string; quote: string }

// Curated, fact-checked vignettes for the landing demo (not a live API call, so the
// marketing page never hallucinates). Responses are in each figure's voice; quotes are documented.
const VIGNETTES: Vignette[] = [
  {
    id: 'a-lincoln',
    name: 'Abraham Lincoln',
    era: '16th U.S. President · 1809–1865',
    img: '/portraits/cyberpunk/a-lincoln.png',
    response:
      "I lost my first run for office. Years later I lost two races for the Senate — the second to a man the papers swore I'd never beat. Two years after that, I was elected President, and we brought slavery to its end. I carried a melancholy most of my life, so I know the weight you're under. A day of defeat isn't a verdict — it's the part of the story right before it turns.",
    quote: 'Always bear in mind that your own resolution to succeed is more important than any other one thing.',
  },
  {
    id: 'frida-kahlo',
    name: 'Frida Kahlo',
    era: 'Painter · 1907–1954',
    img: '/portraits/cyberpunk/frida-kahlo.png',
    response:
      "A streetcar nearly killed me at eighteen — it shattered my spine and my pelvis. I learned to paint flat on my back, a mirror rigged above the bed, because the alternative was to disappear. What you are calling failure, I called material. Today is not proof that you are broken. It is the raw paint. Use it.",
    quote: 'I never painted dreams. I painted my own reality.',
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    era: 'Emperor of the French · 1769–1821',
    img: '/portraits/cyberpunk/napoleon.png',
    response:
      "You feel ruined by a single day? I was exiled to an island — and when they sent soldiers to keep me there, I walked out to meet them and they joined me instead. Stop tallying today's losses. Find the one place the enemy is weak — your own hesitation — and strike there. Decide, and move. Momentum is everything.",
    quote: 'Impossible is a word found only in the dictionary of fools.',
  },
]

function FigureDemo() {
  const [active, setActive] = useState(0)
  const f = VIGNETTES[active]
  return (
    <Section maxWidth={1120}>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-col items-center"
        style={{ gap: 28 }}
      >
        <motion.div variants={fade} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
          <Eyebrow>See it in action</Eyebrow>
          <H2>One bad day. Fifteen perspectives.</H2>
        </motion.div>

        {/* demo: vent | lens picker | response — row on desktop, stacked vertically on mobile */}
        <motion.div variants={fade} className="w-full">
          <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-stretch md:items-start w-full">
            {/* the vent */}
            <div className="w-full md:flex-1">
              <div
                style={{
                  background: 'var(--input-bg, transparent)',
                  border: '1px solid var(--violet)',
                  borderRadius: 'var(--card-radius, 8px)',
                  padding: '18px 20px',
                }}
              >
                <span
                  className="uppercase"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.4, color: 'var(--violet)' }}
                >
                  You vented
                </span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.5, color: 'var(--text-body)', marginTop: 6 }}>
                  &ldquo;{DEMO_VENT}&rdquo;
                </p>
              </div>
            </div>

            {/* lens picker — vertical column on desktop, horizontal row on mobile */}
            <div className="flex flex-row md:flex-col gap-3.5 justify-center md:justify-start md:shrink-0 md:pt-1">
              {VIGNETTES.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActive(i)}
                  aria-label={`See ${v.name}'s perspective`}
                  aria-pressed={i === active}
                  className="transition-transform active:scale-95"
                  style={{
                    padding: 0,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: i === active ? '2.5px solid var(--cyan)' : '2.5px solid transparent',
                    outline: 'none',
                    lineHeight: 0,
                    opacity: i === active ? 1 : 0.55,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.img}
                    alt={v.name}
                    width={64}
                    height={64}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
            </div>

            {/* the response */}
            <div className="w-full md:flex-1">
              <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Card>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.img}
                        alt={f.name}
                        width={72}
                        height={72}
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--cyan)', flexShrink: 0 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: 1, color: 'var(--cyan)' }}>
                          {f.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: 0.6, color: 'var(--violet)' }}>
                          {f.era}
                        </span>
                      </div>
                    </div>
                    <Body>{f.response}</Body>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontStyle: 'italic',
                        fontSize: 18,
                        lineHeight: 1.45,
                        color: 'var(--text-body)',
                        borderLeft: '3px solid var(--cyan)',
                        paddingLeft: 16,
                      }}
                    >
                      &ldquo;{f.quote}&rdquo;
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fade} style={{ maxWidth: 780, textAlign: 'center' }}>
          <Body size={18}>
            15 of history&apos;s greatest thinkers. Ready to weigh in on your worst Tuesday.
          </Body>
        </motion.div>

        <motion.div variants={fade}>
          <PrimaryButton href={TRY_URL || '/app/theme-select'}>Shift your worst Tuesday →</PrimaryButton>
        </motion.div>
      </motion.div>
    </Section>
  )
}

function Hero() {
  return (
    <Section maxWidth={1000} paddingY="clamp(72px, 12vh, 132px)">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
        style={{ gap: 24 }}
      >
        <motion.div variants={fade} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <H1>MindShift</H1>
          <Eyebrow>The app for shifting perspective</Eyebrow>
        </motion.div>

        <motion.div variants={fade} style={{ maxWidth: 900 }}>
          <Body size={22}>
            MindShift is journaling — but make it fun. Vent your spiral, pick a lens — Lincoln, Dolly Parton, Socrates — and get back a perspective that actually moves you. Share it, save it, or just feel less alone in your own head.
          </Body>
        </motion.div>

        <motion.div variants={fade} style={{ maxWidth: 760 }}>
          <Body>
            Whether you&apos;re venting to decompress, journaling to grow, or planning your next chapter — it&apos;s the thinking tool you&apos;ll actually want to open.
          </Body>
        </motion.div>
      </motion.div>
    </Section>
  )
}

function WhoIsItFor() {
  return (
    <Section maxWidth={1120}>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-col items-center"
        style={{ gap: 36 }}
      >
        <motion.div variants={fade}>
          <Eyebrow>Who is it for?</Eyebrow>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full">
          <motion.div variants={fade} className="md:flex-1">
            <UserLine label="For the venter">Vent it. Get a wild, brilliant take back. Screenshot it. Send it to your group chat.</UserLine>
          </motion.div>
          <motion.div variants={fade} className="md:flex-1">
            <UserLine label="For the journaler">Save your perspectives, track how your thinking shifts over time.</UserLine>
          </motion.div>
          <motion.div variants={fade} className="md:flex-1">
            <UserLine label="For the planner">Mind mapping is coming — a full visual map of your life, your goals, your thinking. Soon.</UserLine>
          </motion.div>
        </div>
        <motion.div variants={fade}>
          <PrimaryButton href={TRY_URL || '/app/theme-select'}>Try MindShift Free →</PrimaryButton>
        </motion.div>
      </motion.div>
    </Section>
  )
}

function UserLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
      <span
        className="uppercase"
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 1.4,
          color: 'var(--violet)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          lineHeight: 1.55,
          color: 'var(--text-body)',
        }}
      >
        {children}
      </span>
    </div>
  )
}

function Waitlist() {
  return (
    <Section maxWidth={640}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center', alignItems: 'center' }}>
        <Eyebrow>Don&apos;t miss what&apos;s next</Eyebrow>
        <H2>Be first in line</H2>
        <Body>
          We ship improvements every week. The mind mapping tool is coming — visual life planning across every category that matters to you. Drop your email and we&apos;ll keep you in the loop.
        </Body>
        <WaitlistForm />
        <div style={{ marginTop: 8 }}>
          <SecondaryLink href={`mailto:${WAITLIST_CONTACT}`}>Let&apos;s talk →</SecondaryLink>
        </div>
      </div>
    </Section>
  )
}

type WaitlistStatus = 'idle' | 'loading' | 'success' | 'already' | 'error'

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<WaitlistStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')

    const supabase = getSupabase()
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim(), source: 'landing' })

    if (error) {
      // Postgres unique_violation = 23505
      if (error.code === '23505') {
        setStatus('already')
      } else {
        setStatus('error')
        setErrorMsg(error.message)
      }
      return
    }

    setStatus('success')
    setEmail('')
  }

  const isDone = status === 'success' || status === 'already'

  return (
    <Card>
      {isDone ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
          <Eyebrow>
            {status === 'success' ? "You're on the list" : "You're already on the list"}
          </Eyebrow>
          <Body>
            {status === 'success'
              ? "We'll be in touch when there's something worth your inbox."
              : 'Good taste. Sit tight — updates are coming.'}
          </Body>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label htmlFor="waitlist-email" style={{ display: 'none' }}>
            Email
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '14px 16px',
              background: 'var(--input-bg, transparent)',
              border: '1px solid var(--violet)',
              borderRadius: 'var(--card-radius, 6px)',
              color: 'var(--text-body)',
              outline: 'none',
              width: '100%',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="uppercase transition-opacity hover:opacity-80 active:scale-95 disabled:opacity-50"
            style={{
              fontFamily: 'var(--font-btn)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 'var(--btn-letter-spacing, 3px)',
              color: 'var(--btn-color)',
              background: 'var(--btn-bg)',
              borderTop: 'var(--btn-bt)',
              borderLeft: 'var(--btn-bl)',
              borderRight: 'var(--btn-br)',
              borderBottom: 'var(--btn-bb)',
              borderRadius: 'var(--btn-radius)',
              padding: '14px 24px',
              boxShadow: 'var(--btn-shadow)',
              filter: 'var(--btn-filter, none)',
              cursor: status === 'loading' ? 'wait' : 'pointer',
            }}
          >
            {status === 'loading' ? 'Sending…' : 'Notify me'}
          </button>
          {status === 'error' && (
            <p
              role="alert"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--violet)',
                marginTop: 4,
              }}
            >
              Something went wrong: {errorMsg}. Try again?
            </p>
          )}
        </form>
      )}
    </Card>
  )
}

function OriginStory() {
  return (
    <Section maxWidth={880}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Eyebrow>Origin story</Eyebrow>
        <H2>Why I built this</H2>
        <Body>
          I made a mind map of my own struggles and goals — and someone close to me, a practitioner, said: <em>&ldquo;I wish all my clients did this.&rdquo;</em> That stuck.
        </Body>
        <Body>
          MindShift started as a personal tool for thinking differently, and grew into something I wanted everyone to have. History&apos;s greatest minds shouldn&apos;t be locked in textbooks. They should be in your pocket on a bad day.
        </Body>
      </div>
    </Section>
  )
}

function Investors() {
  return (
    <Section maxWidth={1040}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Eyebrow>For investors and partners</Eyebrow>
        <H2>We&apos;re building the thinking layer of the internet.</H2>
        <Body>
          MindShift starts with AI-powered perspective shifts and expands into a visual mind-mapping platform for self-reflection, life planning, and professional growth. We believe the next frontier isn&apos;t more information — it&apos;s better thinking.
        </Body>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            letterSpacing: 1,
            color: 'var(--violet)',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          <li>15 lenses available</li>
          <li>·</li>
          <li>Shipping weekly</li>
          <li>·</li>
          <li>Three themes</li>
        </ul>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <SecondaryLink href={`mailto:${BUSINESS_CONTACT}`}>Let&apos;s talk →</SecondaryLink>
          <SecondaryLink
            href={`mailto:${BUSINESS_CONTACT}?subject=${encodeURIComponent('MindShift pitch deck request')}`}
          >
            Request the pitch deck →
          </SecondaryLink>
        </div>
      </div>
    </Section>
  )
}
