import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

// Entry point: signed-in users land on the hub, everyone else starts the
// anon-friendly vent flow — mirroring the web's entry behavior.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return <Redirect href={isSignedIn ? '/home' : '/onboarding'} />;
}
