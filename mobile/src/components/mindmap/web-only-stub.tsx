import { Stack, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/theme';

/**
 * Token-styled stub for the mindmap surfaces that stay web-only in this
 * ticket (design D7): the WOOP wizard, the React Flow canvas, and weekly
 * reflect. Honest copy, no fake UI.
 */
export function WebOnlyStub({ title, body }: { title: string; body: string }) {
  const router = useRouter();
  const { tokens: t } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <Stack.Screen options={{ title }} />
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Card style={{ padding: 20, gap: 8 }}>
          <Text
            style={{
              fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
              fontWeight: '700',
              fontSize: 21,
              letterSpacing: -0.3,
              color: t.text.h1,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 14,
              lineHeight: 20,
              color: t.text.body,
              marginBottom: 12,
            }}
          >
            {body}
          </Text>
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 12,
              lineHeight: 17,
              color: t.text.sub,
              marginBottom: 12,
            }}
          >
            For now this lives on the web — open app.minds-shift.com on any browser and pick up
            right where you left off.
          </Text>
          <Button variant="secondary2" fullWidth onPress={() => router.back()}>
            Back
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  );
}
