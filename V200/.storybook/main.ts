import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  // Tailwind v4 is CSS-first (`@import "tailwindcss"` in globals.css). The Vite
  // builder needs the first-party @tailwindcss/vite plugin to expand it — the
  // app's @tailwindcss/postcss pipeline does NOT flow into Storybook (T-022-02).
  viteFinal: async (cfg) => {
    cfg.plugins = cfg.plugins ?? [];
    cfg.plugins.push(tailwindcss());
    return cfg;
  },
};
export default config;
