import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { MODES, ThemeProvider, themes } from '@/theme';

/**
 * The RN twin of the web Storybook "Compare all 3" toolbar view: renders the
 * children once per mode inside a pinned ThemeProvider, labeled and painted
 * on that mode's own background. Use for the semantic-swap surfaces where
 * side-by-side comparison is the point (Button pair, tokens board).
 */
export function TriModes({ children }: { children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      {MODES.map((m) => {
        const t = themes[m.value];
        return (
          <ThemeProvider key={m.value} fixedMode={m.value}>
            <View
              style={{
                backgroundColor: t.palette.bg,
                borderRadius: t.radii.md,
                padding: 16,
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: t.fonts.body.regular,
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: t.text.meta,
                }}
              >
                {m.label}
              </Text>
              {children}
            </View>
          </ThemeProvider>
        );
      })}
    </View>
  );
}
