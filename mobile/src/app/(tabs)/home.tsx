import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/home — the signed-in hub (3 action cards in T-030-04).
export default function Home() {
  return (
    <PlaceholderScreen title="Home">
      <NavLink href="/onboarding" label="Start a vent" />
      <NavLink href="/theme-select" label="Theme select" />
    </PlaceholderScreen>
  );
}
