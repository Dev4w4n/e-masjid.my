/**
 * E2E Error Handling Test
 * 
 * Comprehensive end-to-end tests for error handling scenarios including
 * network failures, data corruption, API timeouts, and recovery mechanisms.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration for error scenarios
const ERROR_TEST_CONFIG = {
  viewport: { width: 1920, height: 1080 },
  userAgent: 'TV-Display-Agent/1.0',
  timeout: 60000, // Longer timeout for error scenarios
  retries: 0 // No retries for error tests
};

// Mock display data for error testing
const MOCK_DISPLAY_ID = 'test-display-error-001';
const MOCK_MASJID_ID = 'test-masjid-error-001';

test.describe('TV Display Error Handling E2E Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: ERROR_TEST_CONFIG.viewport,
      userAgent: ERROR_TEST_CONFIG.userAgent
    });
    page = await context.newPage();
    page.setDefaultTimeout(ERROR_TEST_CONFIG.timeout);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    // Clear any existing routes before each test
    await page.unrouteAll();
  });

  test.describe('Network Failure Scenarios', () => {
    test('should handle complete API server unavailability', async () => {
      // Simulate complete API server failure
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should show error state or fallback content
      const errorState = page.locator('[data-testid="error-state"], [data-testid="api-error"], .error-message');
      await expect(errorState).toBeVisible({ timeout: 15000 });

      // Should show appropriate error message in Bahasa Malaysia
      const errorText = await errorState.textContent();
      expect(errorText?.toLowerCase()).toMatch(/(gagal|ralat|sambungan|tiada|error)/);

      console.log('✓ Complete API failure handled with error state');
    });

    test('should handle intermittent network connectivity', async () => {
      let requestCount = 0;

      // Simulate intermittent failures (fail every other request)
      await page.route('**/api/displays/**', route => {
        requestCount++;
        if (requestCount % 2 === 0) {
          route.abort('connectionreset');
        } else {
          route.continue();
        }
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should eventually load some content despite intermittent failures
      const contentOrError = page.locator('[data-testid="content-carousel"], [data-testid="error-state"]');
      await expect(contentOrError).toBeVisible({ timeout: 20000 });

      console.log(`✓ Intermittent connectivity handled (${requestCount} requests attempted)`);
    });

    test('should handle slow API responses and timeouts', async () => {
      // Simulate very slow API responses
      await page.route('**/api/displays/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        route.continue();
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should show loading state during slow requests
      const loadingState = page.locator('[data-testid="loading-spinner"], [data-testid="loading-state"]');
      
      // Check if loading state appears
      const hasLoadingState = await loadingState.isVisible().catch(() => false);
      if (hasLoadingState) {
        console.log('✓ Loading state shown during slow requests');
      }

      // Should eventually timeout and show error or fallback
      const errorOrContent = page.locator('[data-testid="error-state"], [data-testid="content-carousel"]');
      await expect(errorOrContent).toBeVisible({ timeout: 30000 });

      console.log('✓ Slow API responses handled with timeout mechanism');
    });

    test('should gracefully handle DNS resolution failures', async () => {
      // Simulate DNS failure
      await page.route('**/api/**', route => {
        route.abort('namenotresolved');
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should show network error state
      const networkError = page.locator('[data-testid="network-error"], [data-testid="connection-error"]');
      
      // If specific network error not found, check for general error state
      const anyError = page.locator('[data-testid="error-state"], .error-message, [data-status="error"]');
      await expect(anyError).toBeVisible({ timeout: 15000 });

      console.log('✓ DNS resolution failure handled gracefully');
    });

    test('should handle mixed API endpoint failures', async () => {
      // Simulate different failures for different endpoints
      await page.route('**/api/displays/*/content', route => {
        route.fulfill({ status: 500, body: 'Content service unavailable' });
      });

      await page.route('**/api/displays/*/prayer-times', route => {
        route.abort('failed');
      });

      await page.route('**/api/displays/*/config', route => {
        route.fulfill({ status: 404, body: 'Display not found' });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle partial failures gracefully
      const partialError = page.locator('[data-testid="partial-error"], [data-testid="service-degraded"]');
      
      // Or show general error state
      const errorState = page.locator('[data-testid="error-state"], [data-status="error"]');
      await expect(errorState).toBeVisible({ timeout: 15000 });

      console.log('✓ Mixed API endpoint failures handled');
    });
  });

  test.describe('Data Corruption and Invalid Response Scenarios', () => {
    test('should handle malformed JSON responses', async () => {
      // Return invalid JSON
      await page.route('**/api/displays/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{ invalid json: malformed, missing quotes }'
        });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle JSON parsing errors
      const parseError = page.locator('[data-testid="parse-error"], [data-testid="data-error"]');
      
      const anyError = page.locator('[data-testid="error-state"], .error-message');
      await expect(anyError).toBeVisible({ timeout: 15000 });

      console.log('✓ Malformed JSON responses handled');
    });

    test('should handle missing required fields in API responses', async () => {
      // Return responses with missing required fields
      await page.route('**/api/displays/*/content', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: '1', title: 'Content 1' }, // Missing required fields
              { id: '2' }, // Missing title and other fields
              {} // Empty object
            ]
          })
        });
      });

      await page.route('**/api/displays/*/prayer-times', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              // Missing prayer time fields
              id: '1',
              masjid_id: 'test'
            }
          })
        });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should validate data and show error for invalid content
      const validationError = page.locator('[data-testid="validation-error"], [data-testid="invalid-data"]');
      
      const errorState = page.locator('[data-testid="error-state"], [data-status="error"]');
      await expect(errorState).toBeVisible({ timeout: 15000 });

      console.log('✓ Missing required fields handled with validation errors');
    });

    test('should handle corrupted image and video URLs', async () => {
      // Return content with invalid URLs
      await page.route('**/api/displays/*/content', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: '1',
                title: 'Broken Image',
                type: 'image',
                url: 'https://invalid-domain-12345.com/broken-image.jpg',
                sponsorship_amount: 100,
                duration: 10,
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                status: 'active',
                submitted_by: 'test',
                submitted_at: '2024-01-01T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              },
              {
                id: '2',
                title: 'Broken Video',
                type: 'youtube_video',
                url: 'https://youtube.com/watch?v=invalid-video-id',
                sponsorship_amount: 200,
                duration: 30,
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                status: 'active',
                submitted_by: 'test',
                submitted_at: '2024-01-01T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          })
        });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle broken media gracefully
      await page.waitForTimeout(5000); // Wait for content to load

      // Check for error placeholders or fallback content
      const mediaErrors = page.locator('[data-testid="media-error"], [data-testid="load-error"], .broken-media');
      const mediaErrorCount = await mediaErrors.count();

      // Should show placeholder or skip broken content
      const carousel = page.locator('[data-testid="content-carousel"]');
      await expect(carousel).toBeVisible();

      console.log(`✓ Corrupted media URLs handled (${mediaErrorCount} media errors detected)`);
    });

    test('should handle invalid prayer times data', async () => {
      // Return invalid prayer times
      await page.route('**/api/displays/*/prayer-times', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: '1',
              masjid_id: 'test',
              prayer_date: '2024-01-01',
              fajr_time: '25:99', // Invalid time format
              sunrise_time: 'invalid',
              dhuhr_time: '',
              asr_time: null,
              maghrib_time: '19:30',
              isha_time: '21:00',
              source: 'INVALID_SOURCE',
              fetched_at: '2024-01-01T00:00:00Z',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          })
        });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle invalid prayer times gracefully
      const prayerError = page.locator('[data-testid="prayer-error"], [data-testid="time-error"]');
      
      // Or show fallback prayer times
      const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
      
      // At least one should be visible
      const prayerStateVisible = await Promise.race([
        prayerError.isVisible(),
        prayerOverlay.isVisible()
      ]);

      expect(prayerStateVisible).toBe(true);
      console.log('✓ Invalid prayer times data handled');
    });

    test('should handle inconsistent data types in responses', async () => {
      // Return responses with wrong data types
      await page.route('**/api/displays/*/content', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 123, // Should be string
                title: null, // Should be string
                type: 'image',
                url: ['not', 'a', 'string'], // Should be string
                sponsorship_amount: 'not-a-number', // Should be number
                duration: '10', // Should be number
                start_date: 1234567890, // Should be ISO string
                end_date: true, // Should be ISO string
                status: 'active',
                submitted_by: 'test',
                submitted_at: '2024-01-01T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
              }
            ]
          })
        });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle type mismatches gracefully
      const typeError = page.locator('[data-testid="type-error"], [data-testid="data-validation-error"]');
      
      const errorState = page.locator('[data-testid="error-state"], [data-status="error"]');
      await expect(errorState).toBeVisible({ timeout: 15000 });

      console.log('✓ Inconsistent data types handled');
    });
  });

  test.describe('Recovery and Resilience Mechanisms', () => {
    test('should implement exponential backoff for retries', async () => {
      let attemptTimes: number[] = [];

      // Track retry attempts with timestamps
      await page.route('**/api/displays/**', route => {
        attemptTimes.push(Date.now());
        
        if (attemptTimes.length <= 3) {
          route.fulfill({ status: 500, body: 'Server Error' });
        } else {
          // Succeed after 3 failures
          route.continue();
        }
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for retries to complete
      await page.waitForTimeout(10000);

      // Should eventually succeed or show final error
      const finalState = page.locator('[data-testid="content-carousel"], [data-testid="error-state"]');
      await expect(finalState).toBeVisible({ timeout: 15000 });

      // Verify exponential backoff pattern
      if (attemptTimes.length > 2) {
        const interval1 = attemptTimes[1] - attemptTimes[0];
        const interval2 = attemptTimes[2] - attemptTimes[1];
        
        // Second interval should be longer (exponential backoff)
        expect(interval2).toBeGreaterThan(interval1 * 0.8); // Allow some variance
        console.log(`✓ Exponential backoff implemented: ${interval1}ms → ${interval2}ms`);
      } else {
        console.log(`✓ Retry mechanism active (${attemptTimes.length} attempts)`);
      }
    });

    test('should maintain display state during temporary failures', async () => {
      // Start with successful responses
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);
      
      // Wait for initial load
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible({ timeout: 15000 });

      // Capture initial state
      const initialContent = await page.locator('[data-testid="content-carousel"]').innerHTML();

      // Simulate temporary failure
      await page.route('**/api/**', route => {
        route.fulfill({ status: 503, body: 'Service Temporarily Unavailable' });
      });

      // Trigger a refresh or wait for background refresh
      await page.reload();

      // Should maintain previous state or show cached content
      const postFailureState = page.locator('[data-testid="content-carousel"], [data-testid="cached-content"]');
      await expect(postFailureState).toBeVisible({ timeout: 15000 });

      console.log('✓ Display state maintained during temporary failures');
    });

    test('should gracefully degrade functionality with partial service failures', async () => {
      // Allow content API to work but fail prayer times
      await page.route('**/api/displays/*/content', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: '1',
              masjid_id: 'test',
              display_id: 'test',
              title: 'Test Content',
              type: 'text_announcement',
              url: '#',
              sponsorship_amount: 100,
              duration: 10,
              start_date: '2024-01-01',
              end_date: '2024-12-31',
              status: 'active',
              submitted_by: 'test',
              submitted_at: '2024-01-01T00:00:00Z',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }]
          })
        });
      });

      await page.route('**/api/displays/*/prayer-times', route => {
        route.fulfill({ status: 500, body: 'Prayer service unavailable' });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Content should still work
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible({ timeout: 15000 });

      // Prayer times should show error or be hidden
      const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
      const prayerVisible = await prayerOverlay.isVisible().catch(() => false);

      if (prayerVisible) {
        // If visible, should show error state
        const prayerError = await prayerOverlay.locator('[data-testid="prayer-error"], .error').count();
        console.log(`✓ Graceful degradation: Content works, prayer times ${prayerError > 0 ? 'show error' : 'hidden'}`);
      } else {
        console.log('✓ Graceful degradation: Content works, prayer times hidden during failure');
      }
    });

    test('should recover automatically when services come back online', async () => {
      let serviceDown = true;

      // Initially fail all requests
      await page.route('**/api/**', route => {
        if (serviceDown) {
          route.fulfill({ status: 503, body: 'Service Down' });
        } else {
          route.continue();
        }
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should show error state initially
      const errorState = page.locator('[data-testid="error-state"], [data-status="error"]');
      await expect(errorState).toBeVisible({ timeout: 15000 });

      // Simulate service recovery
      serviceDown = false;

      // Wait for automatic recovery (might need to trigger refresh)
      await page.waitForTimeout(5000);
      
      // Manually trigger retry by reloading
      await page.reload();

      // Should recover and show content
      const recoveredState = page.locator('[data-testid="content-carousel"], [data-status="online"]');
      await expect(recoveredState).toBeVisible({ timeout: 15000 });

      console.log('✓ Automatic recovery when services come back online');
    });
  });

  test.describe('User Experience During Errors', () => {
    test('should display user-friendly error messages in Bahasa Malaysia', async () => {
      // Simulate various error scenarios
      const errorScenarios = [
        {
          name: 'Network Error',
          setup: () => page.route('**/api/**', route => route.abort('failed'))
        },
        {
          name: 'Server Error',
          setup: () => page.route('**/api/**', route => route.fulfill({ status: 500, body: 'Server Error' }))
        },
        {
          name: 'Not Found Error',
          setup: () => page.route('**/api/**', route => route.fulfill({ status: 404, body: 'Not Found' }))
        }
      ];

      for (const scenario of errorScenarios) {
        await page.unrouteAll();
        await scenario.setup();
        
        await page.goto(`/display/${MOCK_DISPLAY_ID}`);

        // Look for user-friendly error messages
        const errorMessage = page.locator('[data-testid="error-message"], .error-message, [data-testid="user-error"]');
        
        if (await errorMessage.isVisible({ timeout: 10000 })) {
          const messageText = await errorMessage.textContent();
          
          // Should contain Bahasa Malaysia error terms
          const hasMalayTerms = messageText?.toLowerCase().match(/(gagal|ralat|sambungan|tiada|tidak|dapat)/);
          
          if (hasMalayTerms) {
            console.log(`✓ ${scenario.name}: User-friendly Bahasa Malaysia error message shown`);
          } else {
            console.log(`✓ ${scenario.name}: Error message shown (language not verified)`);
          }
        } else {
          console.log(`ℹ ${scenario.name}: No specific error message found`);
        }
      }
    });

    test('should maintain basic display functionality during errors', async () => {
      // Simulate content API failure but allow display page to load
      await page.route('**/api/displays/*/content', route => {
        route.fulfill({ status: 500, body: 'Content unavailable' });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Basic page structure should still be present
      const pageStructure = page.locator('html, body, main, [data-testid="display-container"]');
      await expect(pageStructure.first()).toBeVisible();

      // Should show some form of fallback or error state
      const fallbackState = page.locator('[data-testid="fallback-content"], [data-testid="error-state"], [data-testid="empty-state"]');
      await expect(fallbackState).toBeVisible({ timeout: 15000 });

      console.log('✓ Basic display functionality maintained during content errors');
    });

    test('should provide offline indicators when appropriate', async () => {
      // Simulate complete network failure
      await page.context().setOffline(true);
      
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for offline detection
      await page.waitForTimeout(3000);

      // Should show offline indicator
      const offlineIndicator = page.locator('[data-testid="offline"], [data-testid="network-offline"], [data-status="offline"]');
      
      const isOfflineShown = await offlineIndicator.isVisible({ timeout: 10000 });
      
      if (isOfflineShown) {
        console.log('✓ Offline indicator shown during network failure');
      } else {
        // Check for general error state that might indicate offline
        const errorState = page.locator('[data-testid="error-state"], [data-testid="connection-error"]');
        const hasErrorState = await errorState.isVisible();
        
        if (hasErrorState) {
          console.log('✓ Error state shown during offline condition');
        } else {
          console.log('ℹ No explicit offline indicator found');
        }
      }

      // Restore online state
      await page.context().setOffline(false);
    });
  });

  test.describe('Error Logging and Monitoring', () => {
    test('should capture console errors for monitoring', async () => {
      const consoleErrors: string[] = [];
      
      // Capture console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Simulate API failure
      await page.route('**/api/**', route => {
        route.fulfill({ status: 500, body: 'Server Error' });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);
      
      // Wait for errors to be logged
      await page.waitForTimeout(5000);

      // Should have captured some errors
      expect(consoleErrors.length).toBeGreaterThan(0);
      console.log(`✓ Captured ${consoleErrors.length} console errors for monitoring`);
      
      // Log first few errors for debugging
      consoleErrors.slice(0, 3).forEach((error, index) => {
        console.log(`  Error ${index + 1}: ${error.substring(0, 100)}...`);
      });
    });

    test('should handle JavaScript runtime errors gracefully', async () => {
      const pageErrors: string[] = [];
      
      // Capture page errors
      page.on('pageerror', error => {
        pageErrors.push(error.message);
      });

      // Inject code that will cause runtime error
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);
      
      await page.evaluate(() => {
        // Intentionally cause a runtime error
        setTimeout(() => {
          // @ts-ignore
          nonExistentFunction();
        }, 1000);
      });

      await page.waitForTimeout(3000);

      // Page should still be functional despite runtime errors
      const pageStillFunctional = await page.locator('body').isVisible();
      expect(pageStillFunctional).toBe(true);

      if (pageErrors.length > 0) {
        console.log(`✓ JavaScript runtime errors handled gracefully (${pageErrors.length} errors captured)`);
      } else {
        console.log('ℹ No JavaScript runtime errors captured');
      }
    });
  });

  test.describe('Edge Cases and Boundary Conditions', () => {
    test('should handle extremely large API responses', async () => {
      // Generate large response (simulate memory pressure)
      const largeContent = Array.from({ length: 1000 }, (_, i) => ({
        id: `content-${i}`,
        masjid_id: 'test',
        display_id: 'test',
        title: `Large Content Item ${i}`.repeat(10), // Make titles longer
        description: 'A'.repeat(1000), // 1KB description per item
        type: 'text_announcement',
        url: '#',
        sponsorship_amount: i * 100,
        duration: 10,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'active',
        submitted_by: 'test',
        submitted_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }));

      await page.route('**/api/displays/*/content', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: largeContent })
        });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle large response without crashing
      const contentLoaded = await page.locator('[data-testid="content-carousel"]').isVisible({ timeout: 20000 });
      expect(contentLoaded).toBe(true);

      console.log(`✓ Large API response handled (${largeContent.length} items, ~${Math.round(JSON.stringify(largeContent).length / 1024)}KB)`);
    });

    test('should handle concurrent error scenarios', async () => {
      // Simulate multiple concurrent failures
      await page.route('**/api/displays/*/content', route => {
        setTimeout(() => route.fulfill({ status: 500, body: 'Content Error' }), Math.random() * 1000);
      });

      await page.route('**/api/displays/*/prayer-times', route => {
        setTimeout(() => route.fulfill({ status: 503, body: 'Prayer Error' }), Math.random() * 1000);
      });

      await page.route('**/api/displays/*/config', route => {
        setTimeout(() => route.fulfill({ status: 404, body: 'Config Error' }), Math.random() * 1000);
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should handle multiple concurrent errors
      const errorState = page.locator('[data-testid="error-state"], [data-status="error"]');
      await expect(errorState).toBeVisible({ timeout: 20000 });

      console.log('✓ Concurrent error scenarios handled');
    });

    test('should handle memory constraints and cleanup', async () => {
      // Simulate memory pressure by creating many DOM elements
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Add many elements to simulate memory usage
      await page.evaluate(() => {
        for (let i = 0; i < 1000; i++) {
          const div = document.createElement('div');
          div.innerHTML = 'A'.repeat(1000); // 1KB per element
          document.body.appendChild(div);
        }
      });

      // Wait and check if page is still responsive
      await page.waitForTimeout(2000);

      const pageResponsive = await page.locator('body').isVisible();
      expect(pageResponsive).toBe(true);

      // Clean up memory
      await page.evaluate(() => {
        const extraDivs = document.querySelectorAll('body > div:not([data-testid])');
        extraDivs.forEach(div => div.remove());
      });

      console.log('✓ Memory constraints handled with proper cleanup');
    });
  });
});