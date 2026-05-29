'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Redirect /app → /app/theme-select (entry flow: pick UI + ack disclaimer → onboarding)
export default function AppRoot() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/theme-select') }, [router])
  return null
}
