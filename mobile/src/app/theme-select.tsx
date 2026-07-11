import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/theme-select. Real theme switching arrives with T-030-02 tokens.
export default function ThemeSelect() {
  return (
    <PlaceholderScreen title="Choose a theme">
      <NavLink href="/onboarding" label="Cyberpunk → start venting" />
      <NavLink href="/onboarding" label="Kawaii → start venting" />
      <NavLink href="/onboarding" label="Notepad → start venting" />
    </PlaceholderScreen>
  );
}
