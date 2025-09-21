/**
 * Multi-Display Configuration Integration Tests
 * 
 * Tests the complete multi-display support functionality from user stories
 * These tests MUST FAIL initially until implementation is complete (TDD)
 * 
 * Expected to fail: Multi-display functionality doesn't exist yet
 * Success criteria: All tests pass after display configuration implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const MAIN_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';
const SECONDARY_DISPLAY_ID = '660e8400-e29b-41d4-a716-446655440001';
const LOBBY_DISPLAY_ID = '770e8400-e29b-41d4-a716-446655440002';

test.describe('Multi-Display Configuration Integration Tests', () => {
  test('each display shows content according to its own configuration', async ({ browser }) => {
    // Test multiple displays with different configurations
    const displays = [
      {
        id: MAIN_DISPLAY_ID,
        name: 'Main Hall Display',
        maxItems: 10,
        interval: 5,
        prayerPosition: 'top'
      },
      {
        id: SECONDARY_DISPLAY_ID,
        name: 'Lobby Display',
        maxItems: 5,
        interval: 10,
        prayerPosition: 'bottom'
      }
    ];

    const contexts = await Promise.all([
      browser.newContext({ viewport: { width: 1920, height: 1080 } }),
      browser.newContext({ viewport: { width: 1920, height: 1080 } })
    ]);

    const pages = await Promise.all([
      contexts[0].newPage(),
      contexts[1].newPage()
    ]);

    // Mock different configurations for each display
    for (let i = 0; i < displays.length; i++) {
      const display = displays[i];
      const page = pages[i];

      // Mock display config API
      await page.route(`**/api/displays/${display.id}/config`, async (route) => {
        const json = {
          data: {
            id: display.id,
            masjid_id: 'masjid-001',
            display_name: display.name,
            prayer_time_position: display.prayerPosition,
            carousel_interval: display.interval,
            max_content_items: display.maxItems,
            auto_refresh_interval: 5,
            is_active: true,
            last_heartbeat: new Date().toISOString()
          }
        };
        await route.fulfill({ json });
      });

      // Mock content API with different limits
      await page.route(`**/api/displays/${display.id}/content`, async (route) => {
        const contentItems = Array.from({ length: display.maxItems }, (_, index) => ({
          id: `content-${display.id}-${index}`,
          title: `Content ${index + 1} for ${display.name}`,
          type: 'image',
          url: `https://example.com/content-${index}.jpg`,
          thumbnail_url: `https://example.com/thumb-${index}.jpg`,
          sponsorship_amount: 100 - index,
          duration: 5,
          status: 'active',
          approved_at: new Date().toISOString()
        }));

        const json = {
          data: contentItems,
          meta: {
            total: contentItems.length,
            carousel_interval: display.interval
          }
        };
        await route.fulfill({ json });
      });

      // Mock prayer times API with position
      await page.route(`**/api/displays/${display.id}/prayer-times`, async (route) => {
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
            fetched_at: new Date().toISOString()
          },
          meta: {
            position: display.prayerPosition
          }
        };
        await route.fulfill({ json });
      });

      await page.goto(`${BASE_URL}/display/${display.id}`);
      await page.waitForSelector('[data-testid="content-carousel"]');
    }

    // Verify each display shows correct number of content items
    for (let i = 0; i < displays.length; i++) {
      const display = displays[i];
      const page = pages[i];

      const contentItems = page.locator('[data-testid="content-item"]');
      expect(await contentItems.count()).toBe(display.maxItems);

      // Verify prayer overlay position
      const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
      const position = await prayerOverlay.getAttribute('data-position');
      expect(position).toBe(display.prayerPosition);
    }

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });

  test('displays can be configured independently through API', async ({ page }) => {
    // Test updating one display configuration doesn't affect others
    const originalConfig = {
      display_name: 'Original Display',
      prayer_time_position: 'top',
      carousel_interval: 5,
      max_content_items: 10
    };

    const updatedConfig = {
      display_name: 'Updated Display',
      prayer_time_position: 'bottom',
      carousel_interval: 15,
      max_content_items: 8
    };

    // Mock GET config for main display
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/config`, (route) => {
      if (route.request().method() === 'GET') {
        const json = {
          data: {
            id: MAIN_DISPLAY_ID,
            masjid_id: 'masjid-001',
            ...originalConfig,
            auto_refresh_interval: 5,
            is_active: true,
            last_heartbeat: new Date().toISOString()
          }
        };
        route.fulfill({ json });
      }
    });

    // Mock PUT config update
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/config`, (route) => {
      if (route.request().method() === 'PUT') {
        const json = {
          data: {
            id: MAIN_DISPLAY_ID,
            masjid_id: 'masjid-001',
            ...updatedConfig,
            auto_refresh_interval: 5,
            is_active: true,
            last_heartbeat: new Date().toISOString()
          }
        };
        route.fulfill({ json });
      }
    });

    await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);

    // Simulate configuration update via admin interface or API call
    const response = await page.request.put(`${BASE_URL}/api/displays/${MAIN_DISPLAY_ID}/config`, {
      data: updatedConfig
    });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.data.display_name).toBe(updatedConfig.display_name);
    expect(responseData.data.carousel_interval).toBe(updatedConfig.carousel_interval);
  });

  test('supports different masjids with isolated display configurations', async ({ browser }) => {
    const masjidA = 'masjid-001';
    const masjidB = 'masjid-002';

    const displayA = 'display-masjid-a';
    const displayB = 'display-masjid-b';

    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all([
      contexts[0].newPage(),
      contexts[1].newPage()
    ]);

    // Mock configurations for different masjids
    await pages[0].route(`**/api/displays/${displayA}/**`, async (route) => {
      const url = route.request().url();
      
      if (url.includes('/config')) {
        const json = {
          data: {
            id: displayA,
            masjid_id: masjidA,
            display_name: 'Masjid A Main Display',
            prayer_time_position: 'top',
            carousel_interval: 5,
            max_content_items: 10,
            auto_refresh_interval: 5,
            is_active: true
          }
        };
        await route.fulfill({ json });
      } else if (url.includes('/content')) {
        const json = {
          data: [
            {
              id: 'content-a-1',
              title: 'Masjid A Content',
              type: 'image',
              url: 'https://example.com/masjid-a.jpg',
              thumbnail_url: 'https://example.com/thumb-a.jpg',
              sponsorship_amount: 100,
              duration: 5,
              status: 'active',
              approved_at: new Date().toISOString()
            }
          ],
          meta: { total: 1, carousel_interval: 5 }
        };
        await route.fulfill({ json });
      }
    });

    await pages[1].route(`**/api/displays/${displayB}/**`, async (route) => {
      const url = route.request().url();
      
      if (url.includes('/config')) {
        const json = {
          data: {
            id: displayB,
            masjid_id: masjidB,
            display_name: 'Masjid B Secondary Display',
            prayer_time_position: 'bottom',
            carousel_interval: 10,
            max_content_items: 5,
            auto_refresh_interval: 3,
            is_active: true
          }
        };
        await route.fulfill({ json });
      } else if (url.includes('/content')) {
        const json = {
          data: [
            {
              id: 'content-b-1',
              title: 'Masjid B Content',
              type: 'youtube_video',
              url: 'https://youtube.com/watch?v=example',
              thumbnail_url: 'https://example.com/thumb-b.jpg',
              sponsorship_amount: 200,
              duration: 30,
              status: 'active',
              approved_at: new Date().toISOString()
            }
          ],
          meta: { total: 1, carousel_interval: 10 }
        };
        await route.fulfill({ json });
      }
    });

    // Navigate to different masjid displays
    await pages[0].goto(`${BASE_URL}/display/${displayA}`);
    await pages[1].goto(`${BASE_URL}/display/${displayB}`);

    await Promise.all([
      pages[0].waitForSelector('[data-testid="content-carousel"]'),
      pages[1].waitForSelector('[data-testid="content-carousel"]')
    ]);

    // Verify each masjid shows its own content
    const contentA = pages[0].locator('[data-testid="content-title"]');
    const contentB = pages[1].locator('[data-testid="content-title"]');

    const titleA = await contentA.textContent();
    const titleB = await contentB.textContent();

    expect(titleA).toContain('Masjid A');
    expect(titleB).toContain('Masjid B');

    // Verify prayer overlay positions are different
    const overlayA = pages[0].locator('[data-testid="prayer-times-overlay"]');
    const overlayB = pages[1].locator('[data-testid="prayer-times-overlay"]');

    const positionA = await overlayA.getAttribute('data-position');
    const positionB = await overlayB.getAttribute('data-position');

    expect(positionA).toBe('top');
    expect(positionB).toBe('bottom');

    await Promise.all(contexts.map(context => context.close()));
  });

  test('maintains display identity and heartbeat tracking', async ({ page }) => {
    // Mock heartbeat API
    let heartbeatCount = 0;
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/heartbeat`, async (route) => {
      heartbeatCount++;
      const json = {
        success: true,
        timestamp: new Date().toISOString()
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Wait for heartbeat to be sent
    await page.waitForTimeout(3000);

    // Verify heartbeat was sent
    expect(heartbeatCount).toBeGreaterThan(0);

    // Verify display ID is tracked
    const displayId = await page.evaluate(() => {
      return (window as any).displayId || 
             document.documentElement.getAttribute('data-display-id');
    });

    expect(displayId).toBe(MAIN_DISPLAY_ID);
  });

  test('handles display activation and deactivation', async ({ page }) => {
    let isActive = true;

    // Mock config API with dynamic activation status
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/config`, async (route) => {
      const json = {
        data: {
          id: MAIN_DISPLAY_ID,
          masjid_id: 'masjid-001',
          display_name: 'Test Display',
          prayer_time_position: 'top',
          carousel_interval: 5,
          max_content_items: 10,
          auto_refresh_interval: 5,
          is_active: isActive,
          last_heartbeat: new Date().toISOString()
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Verify active display shows content
    const carousel = page.locator('[data-testid="content-carousel"]');
    await expect(carousel).toBeVisible();

    // Simulate display deactivation
    isActive = false;
    await page.reload();

    // Verify inactive display shows appropriate message
    const inactiveMessage = page.locator('[data-testid="display-inactive"]');
    await expect(inactiveMessage).toBeVisible({ timeout: 10000 });
  });

  test('supports display-specific auto-refresh intervals', async ({ page }) => {
    const refreshInterval = 3; // 3 minutes

    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/config`, async (route) => {
      const json = {
        data: {
          id: MAIN_DISPLAY_ID,
          masjid_id: 'masjid-001',
          display_name: 'Auto Refresh Display',
          prayer_time_position: 'top',
          carousel_interval: 5,
          max_content_items: 10,
          auto_refresh_interval: refreshInterval,
          is_active: true,
          last_heartbeat: new Date().toISOString()
        }
      };
      await route.fulfill({ json });
    });

    let contentRequestCount = 0;
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/content`, async (route) => {
      contentRequestCount++;
      const json = {
        data: [
          {
            id: `content-refresh-${contentRequestCount}`,
            title: `Content Update ${contentRequestCount}`,
            type: 'image',
            url: `https://example.com/content-${contentRequestCount}.jpg`,
            thumbnail_url: `https://example.com/thumb-${contentRequestCount}.jpg`,
            sponsorship_amount: 100,
            duration: 5,
            status: 'active',
            approved_at: new Date().toISOString()
          }
        ],
        meta: { total: 1, carousel_interval: 5 }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Initial request
    expect(contentRequestCount).toBe(1);

    // Wait for auto-refresh (simulate faster for testing)
    await page.evaluate((interval) => {
      // Trigger refresh event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auto-refresh'));
      }, interval * 100); // Speed up for test
    }, refreshInterval);

    await page.waitForTimeout(2000);

    // Verify content was refreshed
    expect(contentRequestCount).toBeGreaterThan(1);
  });

  test('handles concurrent display configurations without conflicts', async ({ browser }) => {
    // Test multiple displays being configured simultaneously
    const displayIds = [MAIN_DISPLAY_ID, SECONDARY_DISPLAY_ID, LOBBY_DISPLAY_ID];
    
    const contexts = await Promise.all(
      displayIds.map(() => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Mock simultaneous configuration updates
    const configPromises = displayIds.map(async (displayId, index) => {
      const page = pages[index];
      
      await page.route(`**/api/displays/${displayId}/config`, async (route) => {
        if (route.request().method() === 'PUT') {
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
          
          const json = {
            data: {
              id: displayId,
              masjid_id: 'masjid-001',
              display_name: `Updated Display ${index + 1}`,
              prayer_time_position: ['top', 'bottom', 'center'][index],
              carousel_interval: 5 + index,
              max_content_items: 10 - index,
              auto_refresh_interval: 5,
              is_active: true,
              last_heartbeat: new Date().toISOString()
            }
          };
          await route.fulfill({ json });
        }
      });

      // Update configuration
      const response = await page.request.put(`${BASE_URL}/api/displays/${displayId}/config`, {
        data: {
          display_name: `Updated Display ${index + 1}`,
          carousel_interval: 5 + index
        }
      });

      return response.status();
    });

    // All updates should succeed without conflicts
    const results = await Promise.all(configPromises);
    results.forEach(status => {
      expect(status).toBe(200);
    });

    await Promise.all(contexts.map(context => context.close()));
  });
});

test.describe('Multi-Display Error Handling', () => {
  test('handles display configuration conflicts gracefully', async ({ page }) => {
    // Mock configuration conflict scenario
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/config`, async (route) => {
      if (route.request().method() === 'PUT') {
        const json = {
          code: 'CONFIGURATION_CONFLICT',
          message: 'Display configuration is being updated by another process',
          details: { retry_after: 5 }
        };
        await route.fulfill({ status: 409, json });
      }
    });

    const response = await page.request.put(`${BASE_URL}/api/displays/${MAIN_DISPLAY_ID}/config`, {
      data: { carousel_interval: 10 }
    });

    expect(response.status()).toBe(409);

    const error = await response.json();
    expect(error.code).toBe('CONFIGURATION_CONFLICT');
  });

  test('handles display not found scenarios', async ({ page }) => {
    const nonExistentDisplayId = 'non-existent-display-id';

    await page.goto(`${BASE_URL}/display/${nonExistentDisplayId}`);

    // Should show display not found message
    const notFoundMessage = page.locator('[data-testid="display-not-found"]');
    await expect(notFoundMessage).toBeVisible({ timeout: 10000 });
  });

  test('handles masjid access restrictions', async ({ page }) => {
    // Mock unauthorized access to display from different masjid
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/**`, async (route) => {
      const json = {
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Display belongs to different masjid'
      };
      await route.fulfill({ status: 403, json });
    });

    await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);

    // Should show access denied message
    const accessDenied = page.locator('[data-testid="access-denied"]');
    await expect(accessDenied).toBeVisible({ timeout: 10000 });
  });

  test('handles display offline status tracking', async ({ page }) => {
    // Mock heartbeat failure
    await page.route(`**/api/displays/${MAIN_DISPLAY_ID}/heartbeat`, async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Display should continue functioning despite heartbeat failure
    const carousel = page.locator('[data-testid="content-carousel"]');
    await expect(carousel).toBeVisible();

    // Should log or indicate offline status
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    if (await offlineIndicator.count() > 0) {
      await expect(offlineIndicator).toBeVisible();
    }
  });
});