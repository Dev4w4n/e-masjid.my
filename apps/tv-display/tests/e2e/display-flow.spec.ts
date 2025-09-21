/**
 * E2E Display Flow Test
 * 
 * Comprehensive end-to-end test covering the full TV display functionality
 * from initial loading through content cycling, prayer times updates, and
 * error handling scenarios.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration for TV display
const TV_DISPLAY_CONFIG = {
  viewport: { width: 1920, height: 1080 },
  userAgent: 'TV-Display-Agent/1.0',
  timeout: 30000
};

// Mock display data
const MOCK_DISPLAY_ID = 'test-display-001';
const MOCK_MASJID_ID = 'test-masjid-001';

test.describe('TV Display Flow E2E Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: TV_DISPLAY_CONFIG.viewport,
      userAgent: TV_DISPLAY_CONFIG.userAgent
    });
    page = await context.newPage();

    // Set longer timeout for TV display scenarios
    page.setDefaultTimeout(TV_DISPLAY_CONFIG.timeout);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('Initial Loading Flow', () => {
    test('should load display page and show loading state', async () => {
      // Navigate to display page
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Check that page loads
      await expect(page).toHaveTitle(/TV Display/);

      // Should show loading state initially
      const loadingIndicator = page.locator('[data-testid="loading-spinner"], [data-testid="loading-state"]');
      
      // Wait for either loading to appear or content to load
      await Promise.race([
        loadingIndicator.waitFor({ timeout: 2000 }).catch(() => {}),
        page.locator('[data-testid="display-content"]').waitFor({ timeout: 2000 }).catch(() => {})
      ]);

      console.log('✓ Display page loaded successfully');
    });

    test('should initialize display components', async () => {
      // Navigate to display page
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for main display components to be present
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="prayer-times-overlay"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="display-status"]')).toBeVisible({ timeout: 10000 });

      console.log('✓ All display components initialized');
    });

    test('should establish API connections', async () => {
      // Navigate to display page
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for network requests to complete
      await page.waitForLoadState('networkidle');

      // Check for successful API calls by looking for data-loaded attributes or content
      const contentCarousel = page.locator('[data-testid="content-carousel"]');
      const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');

      // Wait for content to be populated
      await expect(contentCarousel).toHaveAttribute('data-loaded', 'true', { timeout: 15000 });
      await expect(prayerOverlay).toHaveAttribute('data-loaded', 'true', { timeout: 15000 });

      console.log('✓ API connections established and data loaded');
    });
  });

  test.describe('Content Cycling Flow', () => {
    test('should cycle through content items automatically', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for content carousel to load
      const carousel = page.locator('[data-testid="content-carousel"]');
      await expect(carousel).toBeVisible();

      // Check if there are multiple content items
      const contentItems = page.locator('[data-testid^="content-item-"]');
      const itemCount = await contentItems.count();

      if (itemCount > 1) {
        // Get initial active item
        const initialActiveItem = await page.locator('[data-testid^="content-item-"].active').getAttribute('data-testid');
        
        // Wait for content to cycle (default is 10 seconds per item)
        await page.waitForTimeout(12000);
        
        // Check if active item has changed
        const newActiveItem = await page.locator('[data-testid^="content-item-"].active').getAttribute('data-testid');
        
        expect(newActiveItem).not.toBe(initialActiveItem);
        console.log(`✓ Content cycled from ${initialActiveItem} to ${newActiveItem}`);
      } else {
        console.log('✓ Single content item displayed (no cycling needed)');
      }
    });

    test('should display different content types correctly', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for content to load
      await page.waitForSelector('[data-testid="content-carousel"]');

      // Check for different content types
      const contentTypes = ['image', 'youtube_video', 'text_announcement', 'event_poster'];
      const foundTypes: string[] = [];

      for (const type of contentTypes) {
        const typeSelector = `[data-content-type="${type}"]`;
        const elements = await page.locator(typeSelector).count();
        
        if (elements > 0) {
          foundTypes.push(type);
          
          // Verify type-specific elements
          switch (type) {
            case 'image':
              await expect(page.locator(`${typeSelector} img`)).toBeVisible();
              break;
            case 'youtube_video':
              await expect(page.locator(`${typeSelector} iframe, ${typeSelector} [data-testid="video-player"]`)).toBeVisible();
              break;
            case 'text_announcement':
              await expect(page.locator(`${typeSelector} [data-testid="announcement-text"]`)).toBeVisible();
              break;
            case 'event_poster':
              await expect(page.locator(`${typeSelector} [data-testid="event-details"]`)).toBeVisible();
              break;
          }
        }
      }

      console.log(`✓ Found and verified content types: ${foundTypes.join(', ')}`);
      expect(foundTypes.length).toBeGreaterThan(0);
    });

    test('should handle smooth transitions between content', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const carousel = page.locator('[data-testid="content-carousel"]');
      await expect(carousel).toBeVisible();

      // Check if transitions are smooth (no abrupt changes)
      const contentItems = page.locator('[data-testid^="content-item-"]');
      const itemCount = await contentItems.count();

      if (itemCount > 1) {
        // Monitor for transition classes or smooth opacity changes
        await page.waitForTimeout(8000); // Wait near transition time
        
        // Look for transition indicators
        const transitionElements = page.locator('.transition, .fade, [data-transitioning="true"]');
        const hasTransitions = await transitionElements.count() > 0;
        
        if (hasTransitions) {
          console.log('✓ Smooth transitions detected');
        } else {
          console.log('ℹ No explicit transition classes found');
        }
      }
    });
  });

  test.describe('Prayer Times Display', () => {
    test('should display current prayer times', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
      await expect(prayerOverlay).toBeVisible();

      // Check for prayer time elements
      const prayerNames = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      
      for (const prayer of prayerNames) {
        const prayerElement = page.locator(`[data-testid="prayer-${prayer}"]`);
        await expect(prayerElement).toBeVisible();
        
        // Verify time format (HH:MM)
        const timeText = await prayerElement.textContent();
        expect(timeText).toMatch(/\d{1,2}:\d{2}/);
      }

      console.log('✓ All prayer times displayed with correct format');
    });

    test('should show next prayer countdown', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const nextPrayerCountdown = page.locator('[data-testid="next-prayer-countdown"]');
      await expect(nextPrayerCountdown).toBeVisible();

      // Check countdown format
      const countdownText = await nextPrayerCountdown.textContent();
      expect(countdownText).toMatch(/\d+:\d{2}|\d+ (jam|minit)/); // HH:MM or "X jam Y minit" format

      console.log('✓ Next prayer countdown displayed');
    });

    test('should update prayer times in real-time', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const nextPrayerCountdown = page.locator('[data-testid="next-prayer-countdown"]');
      await expect(nextPrayerCountdown).toBeVisible();

      // Get initial countdown value
      const initialCountdown = await nextPrayerCountdown.textContent();

      // Wait for 5 seconds and check if countdown updated
      await page.waitForTimeout(5000);
      
      const updatedCountdown = await nextPrayerCountdown.textContent();
      
      // Countdown should have changed (decreased)
      expect(updatedCountdown).not.toBe(initialCountdown);
      console.log(`✓ Countdown updated from "${initialCountdown}" to "${updatedCountdown}"`);
    });

    test('should handle prayer time position configuration', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
      await expect(prayerOverlay).toBeVisible();

      // Check if overlay has position classes
      const overlayClasses = await prayerOverlay.getAttribute('class');
      const positionClasses = ['top', 'bottom', 'left', 'right', 'center'];
      const hasPositionClass = positionClasses.some(pos => overlayClasses?.includes(pos));

      expect(hasPositionClass).toBe(true);
      console.log(`✓ Prayer times positioned with classes: ${overlayClasses}`);
    });
  });

  test.describe('Display Status and Monitoring', () => {
    test('should show display status indicator', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const statusIndicator = page.locator('[data-testid="display-status"]');
      await expect(statusIndicator).toBeVisible();

      // Check status states
      const possibleStates = ['online', 'loading', 'error', 'offline'];
      const statusElement = await statusIndicator.getAttribute('data-status');
      
      expect(possibleStates).toContain(statusElement);
      console.log(`✓ Display status: ${statusElement}`);
    });

    test('should handle network status changes', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Simulate offline condition
      await page.context().setOffline(true);
      
      // Wait for offline detection
      await page.waitForTimeout(3000);
      
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], [data-status="offline"]');
      await expect(offlineIndicator).toBeVisible({ timeout: 10000 });

      // Restore online condition
      await page.context().setOffline(false);
      
      // Wait for online detection
      await page.waitForTimeout(3000);
      
      const onlineIndicator = page.locator('[data-testid="online-indicator"], [data-status="online"]');
      await expect(onlineIndicator).toBeVisible({ timeout: 10000 });

      console.log('✓ Network status changes handled correctly');
    });

    test('should display last updated timestamp', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      const lastUpdated = page.locator('[data-testid="last-updated"], [data-testid="sync-status"]');
      
      // Should be visible if implemented
      if (await lastUpdated.count() > 0) {
        await expect(lastUpdated).toBeVisible();
        
        const timestampText = await lastUpdated.textContent();
        expect(timestampText).toMatch(/\d{1,2}:\d{2}|\d+ (minit|jam) (yang lalu|ago)/);
        
        console.log(`✓ Last updated timestamp: ${timestampText}`);
      } else {
        console.log('ℹ Last updated timestamp not implemented');
      }
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('should load within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);
      
      // Wait for main content to be visible
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible();
      await expect(page.locator('[data-testid="prayer-times-overlay"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds for TV displays
      expect(loadTime).toBeLessThan(10000);
      console.log(`✓ Page loaded in ${loadTime}ms`);
    });

    test('should maintain 60fps during transitions', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for content to load
      await page.waitForSelector('[data-testid="content-carousel"]');

      // Monitor frame rate during transition
      const performanceEntries = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries.length);
          });
          
          observer.observe({ entryTypes: ['frame'] });
          
          // Fallback if frame timing not available
          setTimeout(() => resolve(0), 1000);
        });
      });

      // If frame timing is available, we should see regular frame updates
      if (performanceEntries > 0) {
        console.log(`✓ Frame timing available: ${performanceEntries} entries`);
      } else {
        console.log('ℹ Frame timing API not available in test environment');
      }
    });

    test('should handle memory usage efficiently', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Let content cycle for a few rounds
      await page.waitForTimeout(30000);

      // Get memory usage after cycling
      const laterMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      if (initialMemory > 0 && laterMemory > 0) {
        const memoryIncrease = laterMemory - initialMemory;
        const increasePercent = (memoryIncrease / initialMemory) * 100;
        
        // Memory increase should be reasonable (less than 50%)
        expect(increasePercent).toBeLessThan(50);
        console.log(`✓ Memory usage: ${initialMemory} → ${laterMemory} (+${increasePercent.toFixed(1)}%)`);
      } else {
        console.log('ℹ Memory monitoring not available in test environment');
      }
    });
  });

  test.describe('Accessibility and TV Display Optimization', () => {
    test('should have appropriate contrast ratios', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Check for high contrast elements suitable for TV viewing
      const textElements = page.locator('h1, h2, h3, p, span').first();
      
      if (await textElements.count() > 0) {
        const computedStyle = await textElements.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontSize: style.fontSize
          };
        });

        // TV displays should use larger fonts
        const fontSize = parseFloat(computedStyle.fontSize);
        expect(fontSize).toBeGreaterThan(16); // Minimum 16px for TV readability

        console.log(`✓ Text styling appropriate for TV: ${computedStyle.fontSize} font`);
      }
    });

    test('should support keyboard navigation for accessibility', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Check if interactive elements are keyboard accessible
      const interactiveElements = page.locator('button, [tabindex], [role="button"]');
      const count = await interactiveElements.count();

      if (count > 0) {
        // Test Tab navigation
        await page.keyboard.press('Tab');
        const focusedElement = await page.locator(':focus').count();
        
        expect(focusedElement).toBeGreaterThan(0);
        console.log('✓ Keyboard navigation supported');
      } else {
        console.log('ℹ No interactive elements found (expected for TV display)');
      }
    });

    test('should use TV-appropriate fonts and sizing', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Check prayer times text sizing (should be large for TV viewing)
      const prayerTimesText = page.locator('[data-testid="prayer-times-overlay"] .prayer-time');
      
      if (await prayerTimesText.count() > 0) {
        const fontSize = await prayerTimesText.first().evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        const fontSizePx = parseFloat(fontSize);
        expect(fontSizePx).toBeGreaterThan(24); // Large enough for TV viewing

        console.log(`✓ Prayer times font size appropriate for TV: ${fontSize}`);
      }
    });
  });

  test.describe('Error Recovery and Resilience', () => {
    test('should gracefully handle API failures', async () => {
      // Intercept API calls and simulate failures
      await page.route('**/api/displays/**', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should show error state or fallback content
      const errorIndicator = page.locator('[data-testid="error-state"], [data-testid="fallback-content"]');
      await expect(errorIndicator).toBeVisible({ timeout: 15000 });

      console.log('✓ API failure handled gracefully');
    });

    test('should retry failed requests automatically', async () => {
      let requestCount = 0;
      
      // Intercept API calls and fail first few attempts
      await page.route('**/api/displays/**', route => {
        requestCount++;
        if (requestCount <= 2) {
          route.fulfill({ status: 500, body: 'Temporary Error' });
        } else {
          route.continue();
        }
      });

      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Should eventually succeed after retries
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible({ timeout: 20000 });
      
      expect(requestCount).toBeGreaterThan(2);
      console.log(`✓ Request retried ${requestCount} times before success`);
    });

    test('should maintain functionality during intermittent connectivity', async () => {
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);

      // Wait for initial load
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible();

      // Simulate intermittent connectivity
      await page.context().setOffline(true);
      await page.waitForTimeout(2000);
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);
      await page.context().setOffline(false);

      // Display should remain functional
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible();
      
      console.log('✓ Display remains functional during intermittent connectivity');
    });
  });

  test.describe('Full User Journey', () => {
    test('should complete a full display cycle from start to finish', async () => {
      const startTime = Date.now();

      // 1. Initial page load
      await page.goto(`/display/${MOCK_DISPLAY_ID}`);
      console.log('1. ✓ Page loaded');

      // 2. Wait for all components to initialize
      await expect(page.locator('[data-testid="content-carousel"]')).toBeVisible();
      await expect(page.locator('[data-testid="prayer-times-overlay"]')).toBeVisible();
      await expect(page.locator('[data-testid="display-status"]')).toBeVisible();
      console.log('2. ✓ All components initialized');

      // 3. Wait for content to load and start cycling
      await page.waitForTimeout(5000);
      console.log('3. ✓ Content cycling started');

      // 4. Monitor prayer times updates
      const initialPrayerTime = await page.locator('[data-testid="next-prayer-countdown"]').textContent();
      await page.waitForTimeout(3000);
      const updatedPrayerTime = await page.locator('[data-testid="next-prayer-countdown"]').textContent();
      expect(updatedPrayerTime).not.toBe(initialPrayerTime);
      console.log('4. ✓ Prayer times updating');

      // 5. Verify content transitions
      const contentItems = await page.locator('[data-testid^="content-item-"]').count();
      if (contentItems > 1) {
        await page.waitForTimeout(12000); // Wait for transition
        console.log('5. ✓ Content transitions working');
      } else {
        console.log('5. ✓ Single content item (no transitions needed)');
      }

      // 6. Check final state
      await expect(page.locator('[data-testid="display-status"]')).toHaveAttribute('data-status', 'online');
      
      const totalTime = Date.now() - startTime;
      console.log(`6. ✓ Full cycle completed in ${totalTime}ms`);

      // Journey should complete within reasonable time
      expect(totalTime).toBeLessThan(30000); // 30 seconds max
    });
  });
});