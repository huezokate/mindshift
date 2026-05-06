'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <SignUp />
    </div>
  )
}
