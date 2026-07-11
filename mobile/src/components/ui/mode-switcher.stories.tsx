import type { Meta, StoryObj } from '@storybook/react-native';

import { ModeSwitcher } from './mode-switcher';

/** Port source: the web ThemeSwitcher (--sw-* family). Switching a chip here
    re-themes the whole Storybook frame — it drives the same provider. */
const meta = {
  title: 'UI/ModeSwitcher',
  component: ModeSwitcher,
} satisfies Meta<typeof ModeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = { args: { compact: true } };
