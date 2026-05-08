'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Redirect /app → /app/onboarding (or /app/mindmap if returning user)
export default function AppRoot() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/onboarding') }, [router])
  return null
}
