import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

// Entry point: signed-in users land on the hub; anon starts at theme-select
// (pick a reality + disclaimer ack) — mirroring the web's /app redirect.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return <Redirect href={isSignedIn ? '/home' : '/theme-select'} />;
}
