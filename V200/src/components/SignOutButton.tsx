'use client'
import { useClerk } from '@clerk/nextjs'
import { useTheme } from '@/lib/theme'
import Button from '@/components/ui/Button'

// Small client island so the profile page can stay a server component (accurate
// tier, incl. the comp allowlist) while sign-out still runs on the client.
export default function SignOutButton() {
  const { signOut } = useClerk()
  const { theme } = useTheme()
  return (
    <Button variant="primary" theme={theme} fullWidth onClick={() => signOut({ redirectUrl: '/' })}>
      Log out
    </Button>
  )
}
