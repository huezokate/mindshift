import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// /app entry split: signed-in (existing) users land on the welcome-back hub;
// everyone else runs the entry flow (pick UI + ack disclaimer → onboarding).
export default async function AppRoot() {
  const { userId } = await auth()
  redirect(userId ? '/app/home' : '/app/theme-select')
}
