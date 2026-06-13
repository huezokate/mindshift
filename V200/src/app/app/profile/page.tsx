'use client'
import { useEffect } from 'react'
import { useTheme } from '@/lib/theme'
import { BottomNav, BottomNavSpacer } from '@/components/app/BottomNav'

// DRAFT — pro-user profile. Nickname + the three tiers (current = Pro) + the
// usual account rows. Sample data; Clerk/Billing wiring comes later.
const TIERS = [
  { key: 'free',  name: 'Free',      price: '$0',         blurb: '3 quotes/day · save to your journal.' },
  { key: 'pro',   name: 'Pro',       price: '$8.99/mo',   blurb: 'Unlimited lenses, mind-maps & weekly emails.' },
]
const CURRENT = 'pro'

export default function ProfilePage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '48px 24px 24px' }}>
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 440, gap: 22 }}>
        {/* Identity */}
        <div className="flex flex-col items-center" style={{ gap: 10 }}>
          <div
            style={{
              width: 84, height: 84, borderRadius: '50%', background: 'var(--card-bg)',
              border: '1.5px solid var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'var(--card-filter, none)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, color: 'var(--pink)' }}>K</span>
          </div>
          <div className="flex flex-col items-center" style={{ gap: 2 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.4px', color: 'var(--text-h1)', margin: 0 }}>
              quiet_kate
            </p>
            <span
              style={{
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
                color: 'var(--green)', border: '1px solid var(--green)', borderRadius: 999, padding: '2px 10px',
              }}
            >
              Pro member
            </span>
          </div>
        </div>

        {/* Tiers */}
        <div className="w-full flex flex-col" style={{ gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--cyan)', margin: 0 }}>
            Your plan
          </p>
          {TIERS.map(t => {
            const current = t.key === CURRENT
            return (
              <div
                key={t.key}
                style={{
                  background: current ? '#eef3ec' : 'var(--card-bg)',
                  border: `1.5px solid ${current ? 'var(--green)' : 'var(--pink)'}`,
                  borderRadius: 'var(--card-radius)', padding: '14px 16px', filter: 'var(--card-filter, none)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}
              >
                <div>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-h1)' }}>{t.name}</span>
                    {current && (
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: 'var(--green)', borderRadius: 999, padding: '2px 7px' }}>
                        Current
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: '17px', color: 'var(--text-sub)', margin: '3px 0 0' }}>{t.blurb}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: current ? 'var(--green)' : 'var(--text-sub)', whiteSpace: 'nowrap' }}>{t.price}</span>
              </div>
            )
          })}
        </div>

        {/* Account rows */}
        <div className="w-full flex flex-col" style={{ gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--cyan)', margin: 0 }}>
            Account
          </p>
          {['Manage subscription', 'Change your space (UI)', 'Email preferences', 'Sign out'].map(row => (
            <div
              key={row}
              style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--pink)', borderRadius: 'var(--card-radius)',
                padding: '14px 16px', filter: 'var(--card-filter, none)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: row === 'Sign out' ? 'var(--pink)' : 'var(--text-body)',
              }}
            >
              {row}<span style={{ color: 'var(--text-meta)' }}>›</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSpacer />
      <BottomNav />
    </div>
  )
}
