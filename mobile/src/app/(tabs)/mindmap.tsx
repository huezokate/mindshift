import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/mindmap (landing gate).
export default function Mindmap() {
  return (
    <PlaceholderScreen title="Mindmap">
      <NavLink href="/mindmap/new" label="New map (WOOP wizard)" />
      <NavLink href="/mindmap/map" label="Map view" />
      <NavLink href="/mindmap/browse" label="Browse goals" />
      <NavLink href="/mindmap/reflect" label="Reflect" />
    </PlaceholderScreen>
  );
}
