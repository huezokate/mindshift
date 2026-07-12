import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBanner } from '@/components/journal/auth-banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModeSwitcher } from '@/components/ui/mode-switcher';
import { useJournalLock } from '@/lib/journal-lock';
import { getPushPref, PushUnavailableError, registerForWeeklyNudge, unregisterWeeklyNudge } from '@/lib/push';
import { useApi } from '@/lib/use-api';
import { useTheme } from '@/theme';

/**
 * Profile — themed RN port of /app/profile: account card, plan card, theme
 * switcher (native extra), sign out. Replaces the Phase-0 smoke-test screen.
 */
export default function ProfileTab() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const { isSignedIn, signOut, has } = useAuth();
  const { user } = useUser();
  const lock = useJournalLock();
  const { api } = useApi();
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  useEffect(() => {
    getPushPref().then(setPushOn);
  }, []);

  async function togglePush(next: boolean) {
    if (pushBusy) return;
    setPushBusy(true);
    setPushMsg(null);
    try {
      if (next) {
        await registerForWeeklyNudge(api);
        setPushOn(true);
      } else {
        await unregisterWeeklyNudge(api);
        setPushOn(false);
      }
    } catch (e) {
      setPushOn(false);
      setPushMsg(
        e instanceof PushUnavailableError
          ? e.message
          : 'Could not update the weekly nudge. Please try again.',
      );
    } finally {
      setPushBusy(false);
    }
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
        <View style={{ padding: 24, gap: 16 }}>
          <AuthBanner />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" fullWidth onPress={() => router.push('/(auth)/sign-in')}>
                Log in
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="secondary2" fullWidth onPress={() => router.push('/(auth)/sign-up')}>
                Sign up
              </Button>
            </View>
          </View>
          <ModeSwitcher />
        </View>
      </SafeAreaView>
    );
  }

  // Same plan key the web checks (user-tier.ts). Comp users resolve server-
  // side only, so a comped account may read "Free" here — cosmetic only.
  const isPro = Boolean(has?.({ plan: 'unlock_all_lenses_monthly' }));
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;

  const label = (text: string) => (
    <Text
      style={{
        fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: t.palette.cyan,
      }}
    >
      {text}
    </Text>
  );

  const line = (text: string, sub = false) => (
    <Text
      style={{
        fontFamily: t.fonts.body.regular,
        fontSize: sub ? 12 : 15,
        lineHeight: sub ? 17 : 21,
        color: sub ? t.text.sub : t.text.body,
      }}
    >
      {text}
    </Text>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <Text
          style={{
            fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
            fontWeight: '700',
            fontSize: 28,
            letterSpacing: -0.4,
            color: t.text.h1,
          }}
        >
          Profile
        </Text>

        <Card style={{ padding: 18, gap: 6 }}>
          {label('Account')}
          {line(user?.username ? `@${user.username}` : (user?.fullName ?? 'Your account'))}
          {user?.primaryEmailAddress ? line(user.primaryEmailAddress.emailAddress, true) : null}
          {memberSince ? line(`Member since ${memberSince}`, true) : null}
        </Card>

        <Card style={{ padding: 18, gap: 6 }}>
          {label('Plan')}
          {line(isPro ? 'Pro — unlimited lenses' : 'Free')}
          {line(
            isPro
              ? 'Unlimited quotes and lenses, every figure unlocked.'
              : '3 quotes a day, 5 lenses per quote. Pro unlocks everything — manage your plan on the web.',
            true,
          )}
        </Card>

        <Card style={{ padding: 18, gap: 12 }}>
          {label('Theme')}
          <ModeSwitcher />
        </Card>

        <Card style={{ padding: 18, gap: 6 }}>
          {label('Notifications')}
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexShrink: 1, paddingRight: 12 }}>
              {line('Weekly nudge')}
              {line('One push on Mondays with your week’s plan from the mindmap.', true)}
            </View>
            <Switch
              value={pushOn}
              disabled={pushBusy}
              onValueChange={(v) => void togglePush(v)}
              trackColor={{ true: t.palette.cyan }}
              accessibilityLabel="Weekly nudge push notifications"
            />
          </View>
          {pushMsg ? line(pushMsg, true) : null}
        </Card>

        {lock.available ? (
          <Card style={{ padding: 18, gap: 6 }}>
            {label('Privacy')}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View style={{ flexShrink: 1, paddingRight: 12 }}>
                {line('Lock journal with Face ID')}
                {line('Ask for Face ID before opening your journal, entries, or chats.', true)}
              </View>
              <Switch
                value={lock.enabled}
                onValueChange={(v) => void lock.setEnabled(v)}
                trackColor={{ true: t.palette.cyan }}
                accessibilityLabel="Lock journal with Face ID"
              />
            </View>
          </Card>
        ) : null}

        <Card style={{ padding: 18, gap: 6 }}>
          {label('A note on care')}
          {line(
            "Minds Shift offers perspective, not professional care. If you're in crisis or thinking about harming yourself, in the US call or text 988 (Suicide & Crisis Lifeline); elsewhere, find local lines at findahelpline.com.",
            true,
          )}
        </Card>

        <Button variant="secondary2" fullWidth onPress={() => void signOut()}>
          Log out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
