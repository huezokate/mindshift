'use client'
import { useClerk } from '@clerk/nextjs'
import Button from '@/components/ui/Button'

// Small client island so the profile page can stay a server component (accurate
// tier, incl. the comp allowlist) while sign-out still runs on the client.
export default function SignOutButton() {
  const { signOut } = useClerk()
  return (
    <Button variant="primary" fullWidth onClick={() => signOut({ redirectUrl: '/' })}>
      Log out
    </Button>
  )
}
