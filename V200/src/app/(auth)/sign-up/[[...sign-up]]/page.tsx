'use client'
import { Suspense } from 'react'
import { SignUp } from '@clerk/nextjs'
import AuthBanner from '@/components/AuthBanner'

export default function SignUpPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: 'var(--bg)', padding: '24px' }}>
      <Suspense>
        <AuthBanner />
      </Suspense>
      <SignUp />
    </div>
  )
}
