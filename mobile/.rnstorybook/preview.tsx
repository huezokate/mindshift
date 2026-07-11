import type { Preview } from '@storybook/react-native';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { ModeSwitcher } from '../src/components/ui/mode-switcher';
import { ThemeProvider, useTheme } from '../src/theme';

/**
 * The RN twin of the web Storybook "Mode" toolbar (V200/.storybook/preview.tsx).
 * RN Storybook has no toolbar, so every story is wrapped in the real
 * ThemeProvider with the shared ModeSwitcher pinned above it — same three
 * modes, same labels, and the choice persists like the app's (SecureStore).
 */
function ThemeFrame({ children }: { children: ReactNode }) {
  const { tokens: t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.palette.bg }}>
      <View style={{ paddingTop: 8 }}>
        <ModeSwitcher compact />
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
