import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/journal-v2 (list). API paths keep the journal-v2 name.
export default function Journal() {
  return (
    <PlaceholderScreen title="Journal">
      <NavLink href="/journal/demo-entry" label="Open a demo entry" />
    </PlaceholderScreen>
  );
}
