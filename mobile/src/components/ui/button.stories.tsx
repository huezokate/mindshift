import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { TriModes } from '@/stories/tri-modes';

import { Button } from './button';

/**
 * RN port of V200 UI/Button. Port source: V200/src/components/ui/Button.tsx +
 * Button.stories.tsx. Check every story in all three modes via the mode bar.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Enter Minds Shift' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Journal' },
};

export const Secondary2: Story = {
  args: { variant: 'secondary2', children: 'Mind Map' },
};

export const WithIcon: Story = {
  args: { variant: 'secondary', icon: 'add', children: 'Lens' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Saved' },
};

export const WithSubtext: Story = {
  args: { children: 'Welcome back', subtext: '@kate' },
};

export const WithSubtextAndIcon: Story = {
  args: { icon: 'person', children: 'Profile', subtext: '@kate' },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Continue' },
};

/** Icon-only squares — the replacement for the old CircleArrow/CircularArrow
    (the LensPicker carousel chevrons). */
export const IconOnly: Story = {
  args: { icon: 'chevron_right' },
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
      <Button variant="secondary" icon="chevron_left" accessibilityLabel="Previous" />
      <Button variant="secondary" icon="chevron_right" accessibilityLabel="Next" />
      <Button variant="primary" icon="bookmark" accessibilityLabel="Save" />
      <Button variant="secondary2" icon="close" accessibilityLabel="Close" />
    </View>
  ),
};

/** The semantic accent-swap (Kate's rule): Journal → secondary (positive/blue
    slot), Mind Map → secondary2 (negative/red slot). Which palette each family
    gets flips per mode — verify the pair in all three modes. */
export const SemanticPair: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Button variant="secondary" fullWidth icon="book_2">
          Journal
        </Button>
      </View>
      <View style={{ flex: 1 }}>
        <Button variant="secondary2" fullWidth icon="graph_3">
          Mind Map
        </Button>
      </View>
    </View>
  ),
};

/** The pair pinned in all three modes at once — the side-by-side proof that
    the swap never collapses (AC #2). */
export const SemanticPairAllModes: Story = {
  render: () => (
    <TriModes>
      <View style={{ flexDirection: 'row', gap: 12 }}>
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
    </TriModes>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondary2">Secondary2</Button>
      <Button disabled>Primary disabled</Button>
      <Button variant="secondary" disabled icon="add">
        Disabled icon
      </Button>
      <Button icon="bookmark">Save</Button>
      <Button subtext="@kate">Welcome back</Button>
    </View>
  ),
};
