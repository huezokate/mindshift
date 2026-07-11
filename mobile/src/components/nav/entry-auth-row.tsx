import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../ui/button';

/**
 * Inline auth affordance for the entry screens — RN port of
 * V200/src/components/nav/EntryAuthRow.tsx. Signed out → equal "Log in"
 * (secondary/positive) + "Sign up" (secondary2/negative); signed in → the
 * primary greeting card with the @handle subtext.
 *
 * The View variant is presentational (stories/tests drive both auth states);
 * the default export wires Clerk + the router.
 */
export function EntryAuthRowView({
  signedIn,
  subtext,
  onEnter,
  onLogin,
  onSignUp,
}: {
  signedIn: boolean;
  subtext?: string;
  onEnter?: () => void;
  onLogin?: () => void;
  onSignUp?: () => void;
}) {
  if (signedIn) {
    return (
      <Button variant="primary" fullWidth subtext={subtext} onPress={onEnter}>
        Welcome back
      </Button>
    );
  }
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Button variant="secondary" fullWidth onPress={onLogin}>
          Log in
        </Button>
      </View>
      <View style={{ flex: 1 }}>
        <Button variant="secondary2" fullWidth onPress={onSignUp}>
          Sign up
        </Button>
      </View>
    </View>
  );
}

export function EntryAuthRow() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  // Figma shows an @handle; fall back through the friendliest identifiers.
  // Emails stay un-prefixed (no "@kate@…").
  const subtext = user?.username
    ? `@${user.username}`
    : (user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? undefined);
  return (
    <EntryAuthRowView
      signedIn={Boolean(isSignedIn)}
      subtext={subtext}
      onEnter={() => router.push('/(tabs)/home')}
      onLogin={() => router.push('/(auth)/sign-in')}
      onSignUp={() => router.push('/(auth)/sign-up')}
    />
  );
}
