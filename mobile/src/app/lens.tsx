import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/lens — figure selection.
export default function Lens() {
  return (
    <PlaceholderScreen title="Pick a lens">
      <NavLink href="/response" label="See the response" />
    </PlaceholderScreen>
  );
}
