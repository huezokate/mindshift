import { defineConfig } from 'vitest/config'

// Minimal, isolated test-runner config (T-025-02). The modules under test are pure
// TS string-shaping helpers, so no jsdom and no plugins are needed — `node`
// environment only. Kept separate from `.storybook/main.ts` (which owns its own
// Vite/`viteFinal` pipeline) so the two never interact. CI (S-026) invokes
// `npm test`, which runs `vitest run` against this config.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
})
