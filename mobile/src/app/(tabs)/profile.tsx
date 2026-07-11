import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/profile. Step 7 turns this into the auth + API smoke-test screen.
export default function Profile() {
  return (
    <PlaceholderScreen title="Profile">
      <NavLink href="/sign-in" label="Sign in" />
      <NavLink href="/sign-up" label="Sign up" />
    </PlaceholderScreen>
  );
}
