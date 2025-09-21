import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
<<<<<<< HEAD
  workers: process.env.CI ? 1 : 2,
=======
  workers: process.env.CI ? 1 : undefined,
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and TV display scenarios */
  projects: [
    {
      name: 'Chrome TV Display',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Full HD TV
        deviceScaleFactor: 1,
      },
    },
    
    {
      name: '4K TV Display', 
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 3840, height: 2160 }, // 4K TV
        deviceScaleFactor: 1,
      },
    },
    
    {
      name: 'TV Kiosk Mode',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--kiosk',
            '--no-first-run',
            '--disable-infobars',
            '--disable-extensions',
            '--autoplay-policy=no-user-gesture-required',
          ],
        },
      },
    },

    {
      name: 'Firefox TV',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'Safari TV',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes timeout for server startup
  },

  /* Global test settings for TV display testing */
  expect: {
    // Increase timeout for video loading and transitions
    timeout: 10 * 1000, // 10 seconds
  },
  
  /* Test timeout for TV display scenarios */
  timeout: 60 * 1000, // 60 seconds per test
  
  /* Output directories */
  outputDir: 'test-results/',
});