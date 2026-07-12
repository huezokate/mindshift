import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useJournalLock } from '@/lib/journal-lock';
import { useTheme } from '@/theme';

/** Presentational lock card (stories/tests drive it directly). */
export function LockGateView({ onUnlock }: { onUnlock: () => void }) {
  const { tokens: t } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Card style={{ padding: 24, gap: 12, alignItems: 'center' }}>
        <Icon name="lock" size={36} color={t.palette.cyan} />
        <Text
          style={{
            fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
            fontWeight: '700',
            fontSize: 21,
            letterSpacing: -0.3,
            textAlign: 'center',
            color: t.text.h1,
          }}
        >
          Your journal is locked
        </Text>
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            color: t.text.sub,
            marginBottom: 8,
          }}
        >
          Face ID keeps what you wrote for your eyes only.
        </Text>
        <Button variant="primary" fullWidth icon="lock_open" onPress={onUnlock}>
          Unlock
        </Button>
      </Card>
    </View>
  );
}

/**
 * Wraps the journal surfaces (list, entry detail, chat). When the journal
 * lock preference is on and this session hasn't authenticated yet, renders
 * the lock card instead of children (design D8: one unlock per session,
 * re-locked on background).
 */
export function LockGate({ children }: { children: ReactNode }) {
  const { locked, requestUnlock } = useJournalLock();
  if (!locked) return <>{children}</>;
  return <LockGateView onUnlock={() => void requestUnlock()} />;
}
