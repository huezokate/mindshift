import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/response — the AI reframe + save.
export default function Response() {
  return (
    <PlaceholderScreen title="Response">
      <NavLink href="/lens" label="Try another lens" />
      <NavLink href="/home" label="Done — go home" />
    </PlaceholderScreen>
  );
}
