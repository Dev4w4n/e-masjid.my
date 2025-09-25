import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, '../../vitest.setup.ts')],
    include: ['tests/contract/**/*.test.ts'],
    testTimeout: 30000, // Longer timeout for API contract tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
