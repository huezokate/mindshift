'use client'
import { Suspense } from 'react'
import { SignIn } from '@clerk/nextjs'
import AuthBanner from '@/components/AuthBanner'

export default function SignInPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: 'var(--bg)', padding: '24px' }}>
      <Suspense>
        <AuthBanner />
      </Suspense>
      <SignIn />
    </div>
  )
}
