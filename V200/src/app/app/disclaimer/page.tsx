'use client'
// The not-therapy checkmark screen (Kate 2026-07-16) — split out of
// theme-select so the welcome screen is purely "select your vibe". Shown to:
//   • anon visitors, until they ack once on this device (localStorage), and
//   • a signed-in profile on its very first login — the ack persists to Clerk
//     unsafeMetadata, so existing users never see it again (any device).
// The page also offers Log in for existing users ("log in and start venting"):
// after auth their metadata ack (if any) skips this screen on the next pass.
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import Icon from '@/components/ui/Icon'
import TextLink from '@/components/ui/TextLink'
import EntryAuthRow from '@/components/nav/EntryAuthRow'

const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',
  borderTop: 'var(--card-bt)',
  borderLeft: 'var(--card-bl)',
  borderRight: 'var(--card-br)',
  borderBottom: 'var(--card-bb)',
  borderRadius: 'var(--card-radius)',
  boxShadow: 'var(--card-shadow)',
  filter: 'var(--card-filter, none)',
}

export default function DisclaimerPage() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  // The checkbox itself always starts UNCHECKED (Kate, 14 June board) — the
  // ack only decides whether this screen appears at all.
  const [acknowledged, setAcknowledged] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  // Already acked (metadata or this device) → this screen isn't for you.
  useEffect(() => {
    const acked =
      user?.unsafeMetadata?.ntAck === true ||
      localStorage.getItem('ms_nt_ack') === '1'
    if (acked) router.replace('/app/onboarding')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleContinue() {
    if (!acknowledged || saving) return
    setSaving(true)
    localStorage.setItem('ms_nt_ack', '1')
    if (isSignedIn && user) {
      // First login of an existing profile: persist so no device asks again.
      try {
        await user.update({ unsafeMetadata: { ...user.unsafeMetadata, ntAck: true } })
      } catch {
        // localStorage already covers this device; metadata retries next pass.
      }
    }
    router.push('/app/onboarding')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)', padding: '32px 24px', gap: 20 }}>
      {/* AUTH ROW — "they could just go to log in and start venting after" */}
      <EntryAuthRow maxWidth={376} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center"
        style={{ ...cardStyle, maxWidth: 376, padding: '28px 24px', gap: 16, marginTop: 24 }}
      >
        <p
          className="uppercase text-center"
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24,
            letterSpacing: 2.5, lineHeight: '28px', color: 'var(--violet)', margin: 0,
          }}
        >
          One thing, real quick
        </p>
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: 0.4,
            lineHeight: '19px', color: 'var(--text-body)', margin: 0,
          }}
        >
          Minds Shift is for perspective and reflection — venting, journaling, and seeing your thoughts through new eyes.
        </p>

        {/* The checkmark. Custom Material Symbol checkbox (native controls read
            pre-ticked on the dark themes). */}
        <div
          role="checkbox"
          tabIndex={0}
          aria-checked={acknowledged}
          onClick={() => setAcknowledged(v => !v)}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              setAcknowledged(v => !v)
            }
          }}
          className="flex items-start gap-3 cursor-pointer select-none w-full"
          style={{
            padding: '12px 14px',
            border: '1px solid var(--input-divider, rgba(0,0,0,0.12))',
            borderRadius: 'var(--card-radius, 8px)',
          }}
        >
          <Icon
            name={acknowledged ? 'check_box' : 'check_box_outline_blank'}
            fill={acknowledged ? 1 : 0}
            size={20}
            style={{ flexShrink: 0, marginTop: 1, color: acknowledged ? 'var(--cyan)' : 'var(--text-sub)' }}
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '18px', letterSpacing: 0.3, color: 'var(--text-body)' }}>
            I understand Minds Shift is a space for reflection, not therapy or clinical advice.{' '}
            <button
              type="button"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setExpanded(v => !v)
              }}
              aria-expanded={expanded}
              className="underline transition-opacity hover:opacity-70"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cyan)',
                fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', padding: 0,
              }}
            >
              {expanded ? 'Show less' : 'Learn more'}
            </button>
          </span>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="disclaimer-detail"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', width: '100%' }}
            >
              <div className="flex flex-col gap-2" style={{ padding: '10px 14px', borderLeft: '2px solid var(--cyan)' }}>
                <p
                  className="uppercase"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 0.5, lineHeight: '14px', color: 'var(--cyan)', margin: 0 }}
                >
                  A few things before we begin
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '18px', letterSpacing: 0.3, color: 'var(--text-body)', margin: 0 }}>
                  Minds Shift is a space for reflection, not a substitute for professional mental health support. The lenses are creative re-framings, not therapy. If you&apos;re in crisis, please reach out to a qualified professional or a crisis line.
                </p>
                <p
                  className="uppercase"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 0.5, lineHeight: '14px', color: 'var(--violet)', margin: 0 }}
                >
                  Nothing here is clinical advice.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA — same solid-fill treatment as theme-select's Enter */}
        <button
          onClick={handleContinue}
          disabled={!acknowledged || saving}
          className="w-full uppercase transition-colors active:scale-95"
          style={{
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
            letterSpacing: 'var(--btn-letter-spacing, 3px)',
            color: acknowledged ? 'var(--violet)' : 'var(--text-sub)',
            backgroundColor: acknowledged ? 'var(--cta-solid-bg)' : 'var(--cta-solid-bg-disabled)',
            borderTop: 'var(--card-bt)', borderLeft: 'var(--card-bl)',
            borderRight: 'var(--card-br)', borderBottom: 'var(--card-bb)',
            borderRadius: 'var(--btn-radius, 32px)', padding: '17px 12px',
            boxShadow: 'var(--card-shadow)',
            cursor: acknowledged && !saving ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? 'One sec…' : 'Start venting'}
        </button>

        <TextLink href="/app/theme-select">← Back to vibe select</TextLink>
      </motion.div>
    </div>
  )
}
