import { Stack, useLocalSearchParams } from 'expo-router';

import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/journal-v2/[id] — entry detail.
export default function JournalEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PlaceholderScreen title={`Entry ${id}`}>
      <Stack.Screen options={{ title: 'Entry' }} />
      <NavLink href={`/journal/${id}/chat/socrates`} label="Chat with Socrates" />
    </PlaceholderScreen>
  );
}
