/**
 * API Mocking Utilities for E2E Tests
 * 
 * Provides consistent API mocking setup for Playwright tests
 * to avoid database dependencies and ensure reliable test execution
 */

import { Page } from '@playwright/test';

export const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface MockApiOptions {
  displayId?: string;
  configOverrides?: Partial<any>;
  contentOverrides?: Partial<any>;
  prayerTimesOverrides?: Partial<any>;
}

/**
 * Sets up comprehensive API mocking for TV display tests
 */
export async function setupApiMocks(page: Page, options: MockApiOptions = {}) {
  const {
    displayId = SAMPLE_DISPLAY_ID,
    configOverrides = {},
    contentOverrides = {},
    prayerTimesOverrides = {}
  } = options;

  // Ensure browser is considered online for API calls
  await page.addInitScript(() => {
    // Override navigator.onLine to return true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  // Mock display configuration API
  await page.route(`**/api/displays/${displayId}/config`, async (route) => {
    const json = {
      data: {
        id: displayId,
        masjid_id: 'masjid-001',
        display_name: 'Test Display',
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
        heartbeat_interval: 30000,
        ...configOverrides
      }
    };
    await route.fulfill({ 
      status: 200,
      contentType: 'application/json',
      json 
    });
  });

  // Mock display content API
  await page.route(`**/api/displays/${displayId}/content*`, async (route) => {
    const json = {
      data: [
        {
          id: 'content-001',
          masjid_id: 'masjid-001',
          display_id: displayId,
          title: 'Test Content 1',
          description: 'Test content for integration testing',
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
          updated_at: new Date().toISOString(),
          ...contentOverrides
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
        self: `${BASE_URL}/api/displays/${displayId}/content`,
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

  // Mock prayer times API
  await page.route(`**/api/displays/${displayId}/prayer-times*`, async (route) => {
    const json = {
      data: {
        fajr_time: '05:45:00',
        sunrise_time: '07:10:00',
        dhuhr_time: '13:15:00',
        asr_time: '16:30:00',
        maghrib_time: '19:20:00',
        isha_time: '20:35:00',
        prayer_date: new Date().toISOString().split('T')[0],
        ...prayerTimesOverrides
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
}

/**
 * Sets up API mocks that simulate error conditions
 */
export async function setupErrorApiMocks(page: Page, options: { displayId?: string; errorType?: 'network' | 'server' | 'not_found' } = {}) {
  const { displayId = SAMPLE_DISPLAY_ID, errorType = 'server' } = options;

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  const statusCode = errorType === 'not_found' ? 404 : errorType === 'server' ? 500 : 502;

  await page.route(`**/api/displays/${displayId}/**`, async (route) => {
    await route.fulfill({ 
      status: statusCode,
      contentType: 'application/json',
      json: { 
        error: { 
          message: `${errorType} error for testing`,
          code: errorType.toUpperCase()
        } 
      }
    });
  });
}

/**
 * Sets up API mocks that simulate offline conditions
 */
export async function setupOfflineApiMocks(page: Page, options: { displayId?: string } = {}) {
  const { displayId = SAMPLE_DISPLAY_ID } = options;

  // Set browser to offline mode
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
  });

  // Mock all API calls to fail with network error
  await page.route(`**/api/displays/${displayId}/**`, async (route) => {
    await route.abort('failed');
  });
}

/**
 * Navigates to display page and waits for basic setup
 */
export async function navigateToDisplay(page: Page, displayId: string = SAMPLE_DISPLAY_ID) {
  await page.goto(`${BASE_URL}/display/${displayId}`);
  
  // Wait a moment for network status to be established
  await page.waitForTimeout(1000);
}