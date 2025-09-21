/**
 * Prayer Times Overlay Integration Tests
 * 
 * Tests the complete prayer times overlay functionality from user stories
 * These tests MUST FAIL initially until implementation is complete (TDD)
 * 
 * Expected to fail: Components and pages don't exist yet
 * Success criteria: All tests pass after T027 prayer overlay component implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Prayer Times Overlay Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
<<<<<<< HEAD
    // Ensure browser is considered online for API calls
    await page.addInitScript(() => {
      // Override navigator.onLine to return true
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    // Mock API responses for consistent testing
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/config`, async (route) => {
      const json = {
        data: {
          id: SAMPLE_DISPLAY_ID,
          masjid_id: 'masjid-001',
          display_name: 'Prayer Overlay Test Display',
          prayer_time_position: 'top',
          carousel_interval: 10,
          max_content_items: 5,
          auto_refresh_interval: 3,
          is_active: true,
          last_heartbeat: new Date().toISOString(),
          resolution: '1920x1080',
          orientation: 'landscape',
          prayer_time_font_size: 'medium',
          prayer_time_color: '#ffffff',
          prayer_time_background_opacity: 0.8,
          content_transition_type: 'fade',
          show_sponsorship_amounts: true,
          sponsorship_tier_colors: {
            bronze: '#CD7F32',
            silver: '#C0C0C0', 
            gold: '#FFD700',
            platinum: '#E5E4E2'
          },
          heartbeat_interval: 30000
        }
      };
      await route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        json 
      });
    });

    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content*`, async (route) => {
      const json = {
        data: [
          {
            id: 'content-001',
            masjid_id: 'masjid-001',
            display_id: SAMPLE_DISPLAY_ID,
            title: 'Test Content 1',
            description: 'Test content for prayer overlay testing',
            type: 'text_announcement',
            url: 'text:announcement',
            duration: 10,
            status: 'active',
            submitted_by: 'user-001',
            submitted_at: new Date().toISOString(),
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            sponsorship_amount: 50,
            sponsorship_tier: 'bronze',
            payment_status: 'paid',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          offset: 0,
          has_more: false,
          next_page: null,
          prev_page: null,
          last_updated: new Date().toISOString(),
          carousel_interval: 10,
          next_refresh: new Date(Date.now() + 10000).toISOString(),
          total_active: 1,
          total_pending: 0,
          sponsorship_revenue: 50
        },
        links: {
          self: `${BASE_URL}/api/displays/${SAMPLE_DISPLAY_ID}/content`,
          next: null,
          prev: null
        },
        error: null
      };
      await route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        json 
      });
    });

    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times*`, async (route) => {
      const json = {
        data: {
          fajr_time: '05:45:00',
          sunrise_time: '07:10:00',
          dhuhr_time: '13:15:00',
          asr_time: '16:30:00',
          maghrib_time: '19:20:00',
          isha_time: '20:35:00',
          prayer_date: new Date().toISOString().split('T')[0]
        },
        meta: {
          position: 'top',
          font_size: 'medium',
          color: '#ffffff',
          background_opacity: 0.8,
          zone_code: 'WLY01',
          location_name: 'Kuala Lumpur',
          source: 'JAKIM',
          last_updated: new Date().toISOString()
        },
        error: null
      };
      await route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        json 
      });
    });

    // Navigate to the TV display page
    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    
    // Wait a moment for network status to be established
    await page.waitForTimeout(1000);
  });

  test('displays prayer times overlay on top of content carousel', async ({ page }) => {
    // Wait for the content carousel to load
    await page.waitForSelector('[data-testid="content-carousel"]', { timeout: 30000 });
=======
    // Navigate to the TV display page
    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
  });

  test('displays prayer times overlay on top of content carousel', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
    
    // Verify prayer times overlay is visible
    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');
    await expect(prayerOverlay).toBeVisible();

    // Verify overlay is positioned above content carousel
    const overlayZIndex = await prayerOverlay.evaluate((el) => 
      parseInt(window.getComputedStyle(el).zIndex)
    );
    expect(overlayZIndex).toBeGreaterThan(1);

    // Verify content carousel is still visible behind overlay
    const carousel = page.locator('[data-testid="content-carousel"]');
    await expect(carousel).toBeVisible();
  });

  test('displays current day prayer times with correct format', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');

    // Verify all prayer times are displayed
    const fajrTime = prayerOverlay.locator('[data-testid="fajr-time"]');
    const sunriseTime = prayerOverlay.locator('[data-testid="sunrise-time"]');
    const dhuhrTime = prayerOverlay.locator('[data-testid="dhuhr-time"]');
    const asrTime = prayerOverlay.locator('[data-testid="asr-time"]');
    const maghribTime = prayerOverlay.locator('[data-testid="maghrib-time"]');
    const ishaTime = prayerOverlay.locator('[data-testid="isha-time"]');

    await expect(fajrTime).toBeVisible();
    await expect(sunriseTime).toBeVisible();
    await expect(dhuhrTime).toBeVisible();
    await expect(asrTime).toBeVisible();
    await expect(maghribTime).toBeVisible();
    await expect(ishaTime).toBeVisible();

    // Verify time format (HH:MM)
    const fajrText = await fajrTime.textContent();
    expect(fajrText).toMatch(/\d{2}:\d{2}/);
  });

  test('displays prayer names in Bahasa Malaysia', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');

    // Verify prayer names are in Bahasa Malaysia
    const prayerNames = [
      { testId: 'fajr-label', expected: 'Subuh' },
      { testId: 'sunrise-label', expected: 'Syuruk' },
      { testId: 'dhuhr-label', expected: 'Zohor' },
      { testId: 'asr-label', expected: 'Asar' },
      { testId: 'maghrib-label', expected: 'Maghrib' },
      { testId: 'isha-label', expected: 'Isyak' }
    ];

    for (const prayer of prayerNames) {
      const label = prayerOverlay.locator(`[data-testid="${prayer.testId}"]`);
      await expect(label).toBeVisible();
      
      const text = await label.textContent();
      expect(text).toContain(prayer.expected);
    }
  });

  test('respects prayer time position configuration', async ({ page }) => {
    // Test different positions by mocking config API
    const positions = ['top', 'bottom', 'left', 'right', 'center'];

    for (const position of positions) {
      // Mock API response with specific position
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
            fetched_at: new Date().toISOString()
          },
          meta: {
            position: position
          }
        };
        await route.fulfill({ json });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="prayer-times-overlay"]');

      const overlay = page.locator('[data-testid="prayer-times-overlay"]');
      
      // Verify overlay has correct position class or attribute
      const positionClass = await overlay.getAttribute('data-position');
      expect(positionClass).toBe(position);
    }
  });

  test('updates prayer times automatically at midnight', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Get initial prayer date
    const dateDisplay = page.locator('[data-testid="prayer-date"]');
    const initialDate = await dateDisplay.textContent();

    // Mock time passing to next day and API update
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const json = {
        data: {
          prayer_date: tomorrowStr,
          fajr_time: '06:05', // Slightly different times for next day
          sunrise_time: '07:35',
          dhuhr_time: '13:20',
          asr_time: '16:35',
          maghrib_time: '19:50',
          isha_time: '21:05',
          source: 'JAKIM_API',
          fetched_at: new Date().toISOString()
        },
        meta: {
          position: 'top'
        }
      };
      await route.fulfill({ json });
    });

    // Trigger update (simulate scheduled refresh)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('prayer-times-update'));
    });

    // Wait for update
    await page.waitForTimeout(2000);

    // Verify date has changed
    const newDate = await dateDisplay.textContent();
    expect(newDate).not.toBe(initialDate);
  });

  test('highlights current or next prayer time', async ({ page }) => {
    // Mock current time to be between prayers
    await page.addInitScript(() => {
      // Set time to 14:00 (after Dhuhr, before Asr)
      const mockDate = new Date();
      mockDate.setHours(14, 0, 0, 0);
      Date.now = () => mockDate.getTime();
    });

    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Next prayer (Asr) should be highlighted
    const asrTime = page.locator('[data-testid="asr-time"]');
    const isHighlighted = await asrTime.evaluate((el) => 
      el.classList.contains('highlighted') || el.classList.contains('next-prayer')
    );
    expect(isHighlighted).toBe(true);

    // Previous prayer (Dhuhr) should not be highlighted
    const dhuhrTime = page.locator('[data-testid="dhuhr-time"]');
    const isDhuhrHighlighted = await dhuhrTime.evaluate((el) => 
      el.classList.contains('highlighted') || el.classList.contains('next-prayer')
    );
    expect(isDhuhrHighlighted).toBe(false);
  });

  test('displays prayer times in TV-optimized font size and contrast', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');

    // Verify font size is large enough for TV viewing
    const fontSize = await prayerOverlay.evaluate((el) => 
      parseInt(window.getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThan(24); // At least 24px for TV readability

    // Verify high contrast for TV viewing
    const color = await prayerOverlay.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    const backgroundColor = await prayerOverlay.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );

    // Should have contrasting colors (not transparent)
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(color).not.toBe(backgroundColor);
  });

  test('maintains overlay visibility during content transitions', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');
    await page.waitForSelector('[data-testid="content-carousel"]');

    const prayerOverlay = page.locator('[data-testid="prayer-times-overlay"]');

    // Verify overlay is visible initially
    await expect(prayerOverlay).toBeVisible();

    // Wait for content transition
    await page.waitForTimeout(6000);

    // Verify overlay is still visible after content transition
    await expect(prayerOverlay).toBeVisible();

    // Verify overlay maintains position
    const position = await prayerOverlay.getAttribute('data-position');
    expect(position).toBeTruthy();
  });

  test('handles JAKIM API data source correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Verify data source is displayed or logged
    const dataSource = page.locator('[data-testid="data-source"]');
    if (await dataSource.count() > 0) {
      const sourceText = await dataSource.textContent();
      expect(sourceText).toContain('JAKIM');
    }

    // Verify prayer times are from JAKIM format
    const fajrTime = page.locator('[data-testid="fajr-time"]');
    const timeText = await fajrTime.textContent();
    
    // JAKIM times should be in HH:MM format
    expect(timeText).toMatch(/^\d{2}:\d{2}$/);
  });

  test('adapts to different TV viewport sizes', async ({ page }) => {
    // Test different TV resolutions
    const viewports = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 3840, height: 2160 }, // 4K
      { width: 1366, height: 768 }   // HD Ready
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForSelector('[data-testid="prayer-times-overlay"]');

      const overlay = page.locator('[data-testid="prayer-times-overlay"]');
      
      // Verify overlay is properly positioned and sized
      const boundingBox = await overlay.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(200);
      expect(boundingBox?.height).toBeGreaterThan(100);

      // Verify overlay doesn't exceed viewport
      expect(boundingBox?.x).toBeGreaterThanOrEqual(0);
      expect(boundingBox?.y).toBeGreaterThanOrEqual(0);
      expect((boundingBox?.x || 0) + (boundingBox?.width || 0)).toBeLessThanOrEqual(viewport.width);
      expect((boundingBox?.y || 0) + (boundingBox?.height || 0)).toBeLessThanOrEqual(viewport.height);
    }
  });

  test('shows current Islamic date alongside prayer times', async ({ page }) => {
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Verify Islamic date is displayed
    const islamicDate = page.locator('[data-testid="islamic-date"]');
    if (await islamicDate.count() > 0) {
      await expect(islamicDate).toBeVisible();
      
      const dateText = await islamicDate.textContent();
      // Should contain Arabic/Islamic month names or format
      expect(dateText?.length).toBeGreaterThan(0);
    }

    // Verify Gregorian date is also shown
    const gregorianDate = page.locator('[data-testid="gregorian-date"]');
    await expect(gregorianDate).toBeVisible();
    
    const gregText = await gregorianDate.textContent();
    expect(gregText).toMatch(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});

test.describe('Prayer Times Overlay Error Handling', () => {
  test('handles prayer times API failure gracefully', async ({ page }) => {
    // Mock API failure
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should show fallback or cached prayer times
    const fallbackMessage = page.locator('[data-testid="prayer-times-error"]');
    const overlay = page.locator('[data-testid="prayer-times-overlay"]');

    // Either show error message or fallback times
    const hasError = await fallbackMessage.count() > 0;
    const hasOverlay = await overlay.count() > 0;
    
    expect(hasError || hasOverlay).toBe(true);
  });

  test('handles invalid prayer times data', async ({ page }) => {
    // Mock invalid data response
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      const json = {
        data: {
          prayer_date: 'invalid-date',
          fajr_time: 'invalid-time',
          sunrise_time: '25:99', // Invalid time
          dhuhr_time: '13:15',
          asr_time: '16:30',
          maghrib_time: '19:45',
          isha_time: '21:00',
          source: 'JAKIM_API',
          fetched_at: new Date().toISOString()
        },
        meta: { position: 'top' }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should handle invalid data gracefully
    const errorState = page.locator('[data-testid="prayer-times-error"]');
    await expect(errorState).toBeVisible({ timeout: 10000 });
  });

  test('handles missing prayer time position configuration', async ({ page }) => {
    // Mock response without position
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
          fetched_at: new Date().toISOString()
        },
        meta: {} // Missing position
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Should use default position
    const overlay = page.locator('[data-testid="prayer-times-overlay"]');
    const position = await overlay.getAttribute('data-position');
    expect(['top', 'bottom', 'left', 'right', 'center']).toContain(position || 'top');
  });

  test('handles timezone and location changes', async ({ page }) => {
    // Mock prayer times for different location
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/prayer-times`, async (route) => {
      const json = {
        data: {
          prayer_date: '2024-12-25',
          fajr_time: '05:30', // Different timezone
          sunrise_time: '07:00',
          dhuhr_time: '12:45',
          asr_time: '16:00',
          maghrib_time: '19:15',
          isha_time: '20:30',
          source: 'JAKIM_API_ZONE_SGR01', // Different zone
          fetched_at: new Date().toISOString()
        },
        meta: { position: 'top' }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="prayer-times-overlay"]');

    // Should display the new times correctly
    const fajrTime = page.locator('[data-testid="fajr-time"]');
    const timeText = await fajrTime.textContent();
    expect(timeText).toBe('05:30');
  });
});