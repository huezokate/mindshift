import { Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/theme';

export type LimitKind = 'lenses' | 'vents';

const COPY: Record<LimitKind, { title: string; body: string }> = {
  lenses: {
    title: 'Lens limit reached',
    body: "You've applied 3 lenses to this vent. Create a free account for 5 lenses per vent.",
  },
  vents: {
    title: 'Daily limit reached',
    body: "You've used your free vent for today. Create a free account for 3 vents per day.",
  },
};

/**
 * Anon/free limit state on the lens screen — RN port of the web's inline
 * limit card (V200 lens page). The server's 'quotes' limitType maps onto the
 * 'vents' copy bucket, same as web.
 */
export function LimitCard({
  kind,
  onCreateAccount,
}: {
  kind: LimitKind;
  onCreateAccount: () => void;
}) {
  const { tokens: t } = useTheme();
  return (
    <Card style={{ padding: 16, gap: 4 }}>
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontWeight: '700',
          fontSize: 13,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: t.palette.pink,
        }}
      >
        {COPY[kind].title}
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 13,
          lineHeight: 18,
          color: t.text.sub,
          marginBottom: 12,
        }}
      >
        {COPY[kind].body}
      </Text>
      <Button variant="primary" fullWidth onPress={onCreateAccount}>
        Create free account →
      </Button>
    </Card>
  );
}
