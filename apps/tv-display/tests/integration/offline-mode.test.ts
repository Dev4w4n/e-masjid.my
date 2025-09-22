/**
 * Offline Mode Integration Tests
 * 
 * Tests the complete offline mode functionality with API mocking
 */

import { test, expect } from '@playwright/test';
import { setupOfflineApiMocks, setupApiMocks, navigateToDisplay, SAMPLE_DISPLAY_ID } from '../utils/api-mocks';

test.describe('Offline Mode Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with online mode
    await setupApiMocks(page);
    await navigateToDisplay(page);
  });
  test('displays cached content when API is unavailable', async ({ page }) => {
    // First, load content normally to populate cache
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'cached-content-1',
            title: 'Cached Content 1',
            type: 'image',
            url: 'https://example.com/cached1.jpg',
            thumbnail_url: 'https://example.com/cached1-thumb.jpg',
            sponsorship_amount: 500.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'cached-content-2',
            title: 'Cached Content 2',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=cached2',
            thumbnail_url: 'https://example.com/cached2.jpg',
            sponsorship_amount: 300.00,
            duration: 20,
            status: 'active',
            approved_at: '2024-12-01T11:00:00Z'
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Verify content loads normally
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems).toHaveCount(2);

    // Now simulate API failure
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      await route.fulfill({ status: 500 });
    });

    // Trigger content refresh
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('content-refresh'));
    });

    await page.waitForTimeout(3000);

    // Should still display cached content
    const cachedItems = page.locator('[data-testid="content-item"]');
    await expect(cachedItems).toHaveCount(2);

    // Should show offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible();
  });

  test('displays fallback prayer times when JAKIM API is unavailable', async ({ page }) => {
    // First, load prayer times normally
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      const json = {
        data: {
          prayer_date: '2024-12-25',
          fajr_time: '06:00',
          sunrise_time: '07:30',
          dhuhr_time: '13:15',
          asr_time: '16:30',
          maghrib_time: '19:45',
          isha_time: '21:00',
          source: 'JAKIM_API',
          fetched_at: '2024-12-25T05:00:00Z'
        },
        meta: {
          position: 'top'
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Verify prayer times load normally
    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
    await expect(prayerOverlay).toBeVisible();

    // Now simulate prayer times API failure
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      await route.fulfill({ status: 500 });
    });

    // Trigger prayer times refresh
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('prayer-times-refresh'));
    });

    await page.waitForTimeout(2000);

    // Should still display cached/fallback prayer times
    await expect(prayerOverlay).toBeVisible();

    // Should indicate data is from cache/fallback
    const fallbackIndicator = page.locator('[data-testid="prayer-times-fallback"]');
    if (await fallbackIndicator.count() > 0) {
      await expect(fallbackIndicator).toBeVisible();
    }
  });

  test('continues carousel operation during network interruptions', async ({ page }) => {
    // Set up initial content
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'offline-content-1',
            title: 'Offline Content 1',
            type: 'image',
            url: 'https://example.com/offline1.jpg',
            thumbnail_url: 'https://example.com/offline1-thumb.jpg',
            sponsorship_amount: 400.00,
            duration: 5,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'offline-content-2',
            title: 'Offline Content 2',
            type: 'image',
            url: 'https://example.com/offline2.jpg',
            thumbnail_url: 'https://example.com/offline2-thumb.jpg',
            sponsorship_amount: 200.00,
            duration: 5,
            status: 'active',
            approved_at: '2024-12-01T11:00:00Z'
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 6
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Get initial active content
    const initialActive = page.locator('[data-testid="content-item"][data-active="true"]');
    const initialId = await initialActive.getAttribute('data-content-id');

    // Simulate network interruption - block all API calls
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ status: 0 }); // Network error
    });

    // Wait for carousel transition
    await page.waitForTimeout(8000);

    // Carousel should still be transitioning between cached content
    const newActive = page.locator('[data-testid="content-item"][data-active="true"]');
    const newId = await newActive.getAttribute('data-content-id');

    expect(newId).not.toBe(initialId); // Should have transitioned
  });

  test('displays appropriate offline messaging in Bahasa Malaysia', async ({ page }) => {
    // Simulate complete network failure
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ status: 0 });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should show offline message
    const offlineMessage = page.locator('[data-testid="offline-message"]');
    await expect(offlineMessage).toBeVisible({ timeout: 10000 });

    const messageText = await offlineMessage.textContent();

    // Should be in Bahasa Malaysia
    const malayTerms = ['Luar talian', 'Tidak sambung', 'Tiada rangkaian'];
    const containsMalayTerm = malayTerms.some(term => messageText?.includes(term));
    
    expect(containsMalayTerm).toBe(true);
  });

  test('automatically reconnects when network is restored', async ({ page }) => {
    let networkAvailable = false;

    // Start with network failure
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      if (!networkAvailable) {
        await route.fulfill({ status: 500 });
        return;
      }

      // Network restored - return content
      const json = {
        data: [
          {
            id: 'restored-content',
            title: 'Network Restored Content',
            type: 'image',
            url: 'https://example.com/restored.jpg',
            thumbnail_url: 'https://example.com/restored-thumb.jpg',
            sponsorship_amount: 600.00,
            duration: 10,
            status: 'active',
            approved_at: new Date().toISOString()
          }
        ],
        meta: {
          total: 1,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should show offline state initially
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible({ timeout: 10000 });

    // Restore network
    networkAvailable = true;

    // Trigger reconnection attempt
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('network-restored'));
    });

    await page.waitForTimeout(3000);

    // Should show new content and remove offline indicator
    const restoredContent = page.locator('[data-testid="content-item"][data-content-id="restored-content"]');
    await expect(restoredContent).toBeVisible({ timeout: 10000 });

    // Offline indicator should be hidden
    await expect(offlineIndicator).toBeHidden();
  });

  test('gracefully handles partial network failures', async ({ page }) => {
    // Content API works, but prayer times API fails
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'partial-content',
            title: 'Partial Network Content',
            type: 'image',
            url: 'https://example.com/partial.jpg',
            thumbnail_url: 'https://example.com/partial-thumb.jpg',
            sponsorship_amount: 300.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          }
        ],
        meta: {
          total: 1,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      await route.fulfill({ status: 500 }); // Prayer times API fails
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Content should load successfully
    const contentCarousel = page.locator('[data-testid="content-carousel"]');
    await expect(contentCarousel).toBeVisible();

    // Prayer times should show fallback or cached data
    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
    if (await prayerOverlay.count() > 0) {
      await expect(prayerOverlay).toBeVisible();
      
      // Should indicate prayer times are from fallback
      const fallbackIndicator = page.locator('[data-testid="prayer-times-fallback"]');
      if (await fallbackIndicator.count() > 0) {
        await expect(fallbackIndicator).toBeVisible();
      }
    }
  });

  test('maintains display configuration during offline periods', async ({ page }) => {
    // Load configuration initially
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/config`, async (route) => {
      const json = {
        data: {
          id: SAMPLE_DISPLAY_ID,
          masjid_id: 'masjid-001',
          display_name: 'Offline Test Display',
          prayer_time_position: 'bottom',
          carousel_interval: 8,
          max_content_items: 5,
          auto_refresh_interval: 3,
          is_active: true,
          last_heartbeat: new Date().toISOString()
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Verify initial configuration is applied
    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
    if (await prayerOverlay.count() > 0) {
      const position = await prayerOverlay.getAttribute('data-position');
      expect(position).toBe('bottom');
    }

    // Now simulate config API failure
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/config`, async (route) => {
      await route.fulfill({ status: 500 });
    });

    // Trigger configuration refresh
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('config-refresh'));
    });

    await page.waitForTimeout(2000);

    // Should maintain cached configuration
    if (await prayerOverlay.count() > 0) {
      const cachedPosition = await prayerOverlay.getAttribute('data-position');
      expect(cachedPosition).toBe('bottom'); // Should maintain cached config
    }
  });

  test('handles image loading failures in offline mode', async ({ page }) => {
    // Set up content with some images that will fail to load
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'image-fail-content',
            title: 'Image Loading Test',
            type: 'image',
            url: 'https://example.com/nonexistent-image.jpg',
            thumbnail_url: 'https://example.com/nonexistent-thumb.jpg',
            sponsorship_amount: 200.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          }
        ],
        meta: {
          total: 1,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    // Block image loading to simulate offline condition
    await page.route('**/nonexistent-*.jpg', async (route) => {
      await route.fulfill({ status: 404 });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Should show placeholder or fallback for failed images
    const imageContent = page.locator('[data-testid="content-item"][data-type="image"]');
    await expect(imageContent).toBeVisible();

    const imagePlaceholder = imageContent.locator('[data-testid="image-placeholder"]');
    const imageError = imageContent.locator('[data-testid="image-error"]');
    
    // Should show placeholder or error state for missing images
    const hasPlaceholder = await imagePlaceholder.count() > 0;
    const hasError = await imageError.count() > 0;
    
    expect(hasPlaceholder || hasError).toBe(true);
  });

  test('provides offline status indicators for administrators', async ({ page }) => {
    // Simulate offline condition
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ status: 0 });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Look for administrative offline indicators
    const indicators = [
      '[data-testid="offline-indicator"]',
      '[data-testid="network-status"]',
      '[data-testid="connection-status"]'
    ];

    let foundIndicator = false;
    for (const indicator of indicators) {
      const element = page.locator(indicator);
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        foundIndicator = true;
        break;
      }
    }

    expect(foundIndicator).toBe(true);
  });

  test('handles YouTube video playback in offline scenarios', async ({ page }) => {
    // Set up YouTube content
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'youtube-offline',
            title: 'YouTube Video Offline Test',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=offline-test',
            thumbnail_url: 'https://example.com/youtube-thumb.jpg',
            sponsorship_amount: 400.00,
            duration: 30,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          }
        ],
        meta: {
          total: 1,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    const youtubeContent = page.locator('[data-testid="content-item"][data-type="youtube_video"]');
    await expect(youtubeContent).toBeVisible();

    // Simulate network failure during video playback
    await page.route('**youtube.com/**', async (route) => {
      await route.fulfill({ status: 0 });
    });

    // Should show fallback for failed video loading
    const videoError = youtubeContent.locator('[data-testid="video-error"]');
    const videoPlaceholder = youtubeContent.locator('[data-testid="video-placeholder"]');
    
    // Either error state or placeholder should be shown
    const hasVideoError = await videoError.count() > 0;
    const hasVideoPlaceholder = await videoPlaceholder.count() > 0;
    
    expect(hasVideoError || hasVideoPlaceholder).toBe(true);
  });
});

test.describe('Offline Mode Error Recovery', () => {
  test('implements exponential backoff for reconnection attempts', async ({ page }) => {
    let attemptCount = 0;
    const attemptTimes: number[] = [];

    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      attemptCount++;
      attemptTimes.push(Date.now());
      
      if (attemptCount < 3) {
        // Fail first 2 attempts
        await route.fulfill({ status: 500 });
      } else {
        // Succeed on 3rd attempt
        const json = {
          data: [
            {
              id: 'recovered-content',
              title: 'Recovery Success',
              type: 'image',
              url: 'https://example.com/recovery.jpg',
              thumbnail_url: 'https://example.com/recovery-thumb.jpg',
              sponsorship_amount: 100.00,
              duration: 10,
              status: 'active',
              approved_at: new Date().toISOString()
            }
          ],
          meta: { total: 1, carousel_interval: 10 }
        };
        await route.fulfill({ json });
      }
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Wait for recovery
    await page.waitForSelector('[data-testid="content-carousel"]', { timeout: 30000 });

    // Verify exponential backoff was used
    expect(attemptCount).toBeGreaterThanOrEqual(3);
    
    if (attemptTimes.length >= 3) {
      const firstInterval = attemptTimes[1] - attemptTimes[0];
      const secondInterval = attemptTimes[2] - attemptTimes[1];
      
      // Second interval should be longer (exponential backoff)
      expect(secondInterval).toBeGreaterThan(firstInterval);
    }
  });

  test('logs offline events for troubleshooting', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLogs.push(msg.text());
      }
    });

    // Simulate API failure
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForTimeout(5000);

    // Should log offline/error events
    const hasOfflineLog = consoleLogs.some(log => 
      log.includes('offline') || 
      log.includes('network') || 
      log.includes('connection')
    );

    expect(hasOfflineLog).toBe(true);
  });
});