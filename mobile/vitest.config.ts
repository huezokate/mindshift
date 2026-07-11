import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // node-side stand-ins so theme logic (Platform.select, SecureStore) is testable
      'react-native': fileURLToPath(new URL('./src/test/stubs/react-native.ts', import.meta.url)),
      'expo-secure-store': fileURLToPath(
        new URL('./src/test/stubs/expo-secure-store.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
