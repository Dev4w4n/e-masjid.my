import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, '../../vitest.setup.ts')],
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 60000, // Longer timeout for database integration tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Database tests should run sequentially
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
