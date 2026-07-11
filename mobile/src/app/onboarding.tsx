import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/onboarding — the vent input (anon-friendly entry point).
export default function Onboarding() {
  return (
    <PlaceholderScreen title="Vent">
      <NavLink href="/lens" label="Pick a lens" />
    </PlaceholderScreen>
  );
}
