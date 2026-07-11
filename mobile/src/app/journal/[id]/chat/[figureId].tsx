import { Stack, useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';

// Mirrors /app/journal-v2/[id]/chat/[figureId] — chat with the lens.
export default function LensChat() {
  const { id, figureId } = useLocalSearchParams<{ id: string; figureId: string }>();
  return (
    <PlaceholderScreen title={`Chat · ${figureId} · entry ${id}`}>
      <Stack.Screen options={{ title: 'Chat' }} />
    </PlaceholderScreen>
  );
}
