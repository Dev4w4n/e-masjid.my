/**
 * T007: E2E Test Setup and Configuration
 *
 * Sets up Playwright E2E testing environment for content management.
 * These tests will retrieve real IDs from database during beforeEach.
 */
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 2,

  // Reporter to use
  reporter: 'html',

  // Shared settings for all tests
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:5173', // Vite dev server

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Extra HTTP headers
    extraHTTPHeaders: {
      // Add any required headers for Supabase auth
      'Accept-Language': 'en-US,en;q=0.9,ms;q=0.8',
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Global setup and teardown
  globalSetup: path.resolve(__dirname, './tests/e2e/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, './tests/e2e/global-teardown.ts'),

  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm -F hub dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Test timeout
  timeout: 30 * 1000,

  // Expect timeout
  expect: {
    timeout: 5 * 1000,
  },

  // Output directory
  outputDir: 'test-results/',

  // Test match patterns
  testMatch: '**/*.e2e.ts',
});
