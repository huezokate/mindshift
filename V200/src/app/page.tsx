'use client'
import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { getSupabase } from '@/lib/supabase'

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL ?? ''
const TRY_URL = `${APP_BASE}/app/choose-ui`
const WAITLIST_CONTACT = 'hello@minds-shift.com'
const BUSINESS_CONTACT = 'kate@minds-shift.com'

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      <Hero />
      <Testimonials />
      <Waitlist />
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

function Hero() {
  return (
    <Section maxWidth={880} paddingY="clamp(80px, 12vh, 140px)">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
        style={{ gap: 32 }}
      >
        <motion.div variants={fade} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <H1>MindShift</H1>
          <Eyebrow>The app for shifting perspective</Eyebrow>
        </motion.div>

        <motion.div variants={fade} style={{ maxWidth: 640 }}>
          <Body size={20}>
            15 of history&apos;s greatest thinkers. Ready to weigh in on your worst Tuesday.
          </Body>
          <div style={{ height: 16 }} />
          <Body>
            MindShift is journaling — but make it fun. Vent your spiral, pick a lens (Socrates? Napoleon? Tesla?), and get a perspective that actually moves you. Share it, save it, or just feel less alone in your own head.
          </Body>
        </motion.div>

        <motion.div variants={fade} style={{ maxWidth: 640 }}>
          <Body>
            Whether you&apos;re venting to decompress, journaling to grow, or planning your next chapter — MindShift meets you where you are. It&apos;s the thinking tool you&apos;ll actually want to open.
          </Body>
        </motion.div>

        <motion.ul
          variants={fade}
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 640,
            textAlign: 'left',
          }}
        >
          <UserLine label="For the venter">Vent it. Get a wild, brilliant take back. Screenshot it. Send it to your group chat.</UserLine>
          <UserLine label="For the journaler">Save your perspectives, track how your thinking shifts over time.</UserLine>
          <UserLine label="For the planner">Mind mapping is coming — a full visual map of your life, your goals, your thinking. Soon.</UserLine>
        </motion.ul>

        <motion.div variants={fade}>
          <PrimaryButton href={TRY_URL || '/app/choose-ui'}>Try MindShift Free →</PrimaryButton>
        </motion.div>
      </motion.div>
    </Section>
  )
}

function UserLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
    </li>
  )
}

// Beta-tester testimonials, styled as the user's vent card — a little on-brand
// UI moment: name in the header, quote in the body, role where the char-count sits.
const TESTIMONIALS = [
  {
    name: 'Many',
    role: 'Beta tester',
    quote: 'I really like the historical approach — it’s not only fun, it’s educational. Such a clever touch!',
  },
  {
    name: 'Al',
    role: 'Early tester',
    quote: 'Wow, these interfaces are so different — I can shift the whole mood of the app to match my own.',
  },
  {
    name: 'Natalie',
    role: 'Beta tester & mental-health provider',
    quote: 'This is fantastic — easy and lighthearted in a way that would genuinely make it effective with users. Bonus points for staying honest about its intentions: it never pretends to be a therapy tool.',
  },
]

function Testimonials() {
  return (
    <Section maxWidth={1000}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, marginBottom: 36 }}>
        <Eyebrow>From the people testing it</Eyebrow>
        <H2>Vented, approved.</H2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
          alignItems: 'start',
        }}
      >
        {TESTIMONIALS.map(t => (
          <TestimonialCard key={t.name} name={t.name} role={t.role} quote={t.quote} />
        ))}
      </div>
    </Section>
  )
}

function TestimonialCard({ name, role, quote }: { name: string; role: string; quote: string }) {
  return (
    <div
      style={{
        background: 'var(--input-bg)',
        borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)',
        borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)',
        borderRadius: 'var(--input-radius)', filter: 'var(--card-filter, none)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
      }}
    >
      {/* Header — name (like the vent card's title bar) */}
      <div style={{ padding: '10px 16px', background: 'var(--input-header-bg)', borderBottom: '1px solid var(--input-divider)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--cyan)' }}>
          {name}
        </span>
      </div>

      {/* Body — the quote */}
      <div style={{ padding: '16px', flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.55, color: 'var(--text-body)', margin: 0 }}>
          “{quote}”
        </p>
      </div>

      {/* Footer — role, where the character count lives on a real vent card */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--input-divider)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text-meta)' }}>
          {role}
        </span>
      </div>
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
    <Section maxWidth={680}>
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
    <Section maxWidth={720}>
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

        <div>
          <SecondaryLink href={`mailto:${BUSINESS_CONTACT}`}>Let&apos;s talk →</SecondaryLink>
        </div>
      </div>
    </Section>
  )
}
