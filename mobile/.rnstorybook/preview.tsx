import type { Preview } from '@storybook/react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { MODES, ThemeProvider, useTheme } from '../src/theme';

/**
 * The RN twin of the web Storybook "Mode" toolbar (V200/.storybook/preview.tsx).
 * RN Storybook has no toolbar, so every story is wrapped in the real
 * ThemeProvider with a persistent mode bar pinned above it — same three modes,
 * same labels, and the choice persists like the app's (SecureStore).
 */
function ThemeFrame({ children }: { children: ReactNode }) {
  const { mode, setMode, tokens: t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.palette.bg }}>
      <View style={{ flexDirection: 'row', gap: 6, padding: 8, justifyContent: 'center' }}>
        {MODES.map((m) => (
          <Pressable
            key={m.value}
            onPress={() => setMode(m.value)}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: t.sw.btnRadius,
              backgroundColor: t.sw.bg,
              opacity: mode === m.value ? 1 : 0.5,
            }}
          >
            <Text style={{ color: t.sw.text, fontSize: 11 }}>{m.label}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, flexGrow: 1 }}>
        {children}
      </ScrollView>
    </View>
  );
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ThemeFrame>
          <Story />
        </ThemeFrame>
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
