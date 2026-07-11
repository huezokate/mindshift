import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/theme';

import { TriModes } from './tri-modes';

/**
 * Themes/Tokens reference board — the RN twin of the web TokenBoard
 * (V200/src/stories/TokenBoard.tsx, the T-030-02 contract page): palette,
 * text roles, fonts, the three Button families, radii — everything read live
 * from the token layer.
 */
function Board() {
  const { tokens: t } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      <Section t={t} title="Palette">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(
            [
              ['bg', t.palette.bg],
              ['bgCard', t.palette.bgCard],
              ['cyan', t.palette.cyan],
              ['green', t.palette.green],
              ['pink', t.palette.pink],
              ['violet', t.palette.violet],
              ['amber', t.palette.amber],
            ] as const
          ).map(([name, color]) => (
            <View key={name} style={{ alignItems: 'center', gap: 2 }}>
              <View
                style={{
                  width: 44,
                  height: 32,
                  backgroundColor: color,
                  borderRadius: t.radii.sm,
                  borderWidth: 1,
                  borderColor: t.text.meta,
                }}
              />
              <Text style={{ color: t.text.meta, fontSize: 8, fontFamily: t.fonts.body.regular }}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section t={t} title="Text roles">
        <Text style={{ color: t.text.h1, fontFamily: t.fonts.display.bold ?? t.fonts.display.regular, fontSize: 22 }}>
          h1 · display font
        </Text>
        <Text style={{ color: t.text.body, fontFamily: t.fonts.body.regular, fontSize: 14 }}>
          body · the theme voice
        </Text>
        <Text style={{ color: t.text.sub, fontFamily: t.fonts.body.regular, fontSize: 13 }}>
          sub · secondary
        </Text>
        <Text style={{ color: t.text.meta, fontFamily: t.fonts.body.regular, fontSize: 11 }}>
          meta · smallest voice
        </Text>
      </Section>

      <Section t={t} title="Button families (semantic swap surface)">
        <Button>Primary / CTA</Button>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" fullWidth>
              Journal
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="secondary2" fullWidth>
              Mind Map
            </Button>
          </View>
        </View>
      </Section>

      <Section t={t} title="Radii">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(
            [
              ['sm', t.radii.sm],
              ['md', t.radii.md],
              ['lg', t.radii.lg],
              ['card', t.card.radius],
              ['btn', t.btn.radius],
              ['input', t.input.radius],
            ] as const
          ).map(([name, r]) => (
            <View key={name} style={{ alignItems: 'center', gap: 2 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: r,
                  borderWidth: 1.5,
                  borderColor: t.palette.cyan,
                }}
              />
              <Text style={{ color: t.text.meta, fontSize: 8, fontFamily: t.fonts.body.regular }}>
                {name} {r}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </View>
  );
}

function Section({ t, title, children }: { t: Theme; title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: t.card.bg,
        borderRadius: t.card.radius,
        padding: 14,
        gap: 8,
      }}
    >
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: t.text.meta,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

const meta = {
  title: 'Themes/Tokens',
  component: Board,
} satisfies Meta<typeof Board>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live board — follows the mode bar. */
export const Tokens: Story = {};

/** All three modes side by side (the web "Compare all 3" view). */
export const AllThreeModes: Story = {
  render: () => (
    <TriModes>
      <Board />
    </TriModes>
  ),
};
