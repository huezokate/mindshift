'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Redirect /app → /app/choose-ui (entry flow: pick UI + ack disclaimer → onboarding)
export default function AppRoot() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/choose-ui') }, [router])
  return null
}
