/**
 * Prayer Times API Contract Tests
 * 
 * Tests the API contract for GET /displays/{displayId}/prayer-times endpoint
 * These tests MUST FAIL initially until API implementation is complete (TDD)
 * 
 * Expected to fail: API routes don't exist yet
 * Success criteria: All tests pass after T022 API route implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Prayer Times API Contract', () => {
  test('GET /displays/{displayId}/prayer-times returns current day prayer schedule', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');

    // Verify prayer schedule structure
    const prayerSchedule = data.data;
    expect(prayerSchedule).toHaveProperty('prayer_date');
    expect(prayerSchedule).toHaveProperty('fajr_time');
    expect(prayerSchedule).toHaveProperty('sunrise_time');
    expect(prayerSchedule).toHaveProperty('dhuhr_time');
    expect(prayerSchedule).toHaveProperty('asr_time');
    expect(prayerSchedule).toHaveProperty('maghrib_time');
    expect(prayerSchedule).toHaveProperty('isha_time');
    expect(prayerSchedule).toHaveProperty('source');
    expect(prayerSchedule).toHaveProperty('fetched_at');

    // Verify meta contains position
    expect(data.meta).toHaveProperty('position');
    expect(['top', 'bottom', 'left', 'right', 'center']).toContain(data.meta.position);
  });

  test('GET /displays/{displayId}/prayer-times returns valid time formats', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const prayerSchedule = data.data;

    // Verify date format (YYYY-MM-DD)
    expect(prayerSchedule.prayer_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Verify time formats (HH:MM)
    const timeFields = [
      'fajr_time',
      'sunrise_time', 
      'dhuhr_time',
      'asr_time',
      'maghrib_time',
      'isha_time'
    ];

    timeFields.forEach((field) => {
      expect(prayerSchedule[field]).toMatch(/^\d{2}:\d{2}$/);
    });

    // Verify fetched_at is valid ISO datetime
    expect(prayerSchedule.fetched_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('GET /displays/{displayId}/prayer-times supports date query parameter', async ({
    request,
  }) => {
    const targetDate = '2024-12-25';
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times?date=${targetDate}`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data.prayer_date).toBe(targetDate);
  });

  test('GET /displays/{displayId}/prayer-times validates date parameter format', async ({
    request,
  }) => {
    const invalidDate = 'invalid-date';
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times?date=${invalidDate}`
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /displays/{displayId}/prayer-times returns prayer times in logical order', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const schedule = data.data;

    // Convert times to minutes for comparison
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const fajr = timeToMinutes(schedule.fajr_time);
    const sunrise = timeToMinutes(schedule.sunrise_time);
    const dhuhr = timeToMinutes(schedule.dhuhr_time);
    const asr = timeToMinutes(schedule.asr_time);
    const maghrib = timeToMinutes(schedule.maghrib_time);
    const isha = timeToMinutes(schedule.isha_time);

    // Verify prayer times are in chronological order
    expect(fajr).toBeLessThan(sunrise);
    expect(sunrise).toBeLessThan(dhuhr);
    expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib);
    expect(maghrib).toBeLessThan(isha);
  });

  test('GET /displays/{displayId}/prayer-times includes data source information', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const prayerSchedule = data.data;

    // Should indicate data source (e.g., JAKIM_API)
    expect(typeof prayerSchedule.source).toBe('string');
    expect(prayerSchedule.source.length).toBeGreaterThan(0);

    // fetched_at should be recent (within last 24 hours for cached data)
    const fetchedAt = new Date(prayerSchedule.fetched_at);
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    expect(fetchedAt.getTime()).toBeGreaterThan(dayAgo.getTime());
    expect(fetchedAt.getTime()).toBeLessThanOrEqual(now.getTime());
  });

  test('GET /displays/{displayId}/prayer-times returns 404 for non-existent display', async ({
    request,
  }) => {
    const invalidDisplayId = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(
      `${BASE_URL}/displays/${invalidDisplayId}/prayer-times`
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });

  test('GET /displays/{displayId}/prayer-times validates UUID format', async ({
    request,
  }) => {
    const invalidFormatId = 'not-a-uuid';
    const response = await request.get(
      `${BASE_URL}/displays/${invalidFormatId}/prayer-times`
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /displays/{displayId}/prayer-times handles future dates appropriately', async ({
    request,
  }) => {
    const futureDate = '2025-12-31';
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times?date=${futureDate}`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data.prayer_date).toBe(futureDate);
    
    // Should still return valid prayer times
    expect(data.data).toHaveProperty('fajr_time');
    expect(data.data).toHaveProperty('maghrib_time');
  });

  test('GET /displays/{displayId}/prayer-times includes overlay position from display config', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    
    // Meta should include position from display configuration
    expect(data.meta).toHaveProperty('position');
    expect(typeof data.meta.position).toBe('string');
    expect(['top', 'bottom', 'left', 'right', 'center']).toContain(data.meta.position);
  });
});

test.describe('Prayer Times API Error Handling', () => {
  test('handles JAKIM API service unavailability', async ({ request }) => {
    // This tests graceful handling when external prayer times API is down
    // Should either return cached data or appropriate error
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    if (response.status() === 500) {
      const error = await response.json();
      expect(error).toHaveProperty('code');
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    } else {
      // Should return cached/fallback data
      expect(response.status()).toBe(200);
    }
  });

  test('handles invalid masjid location configuration', async ({ request }) => {
    // Test with display that has invalid prayer zone configuration
    const invalidConfigDisplayId = '111e8400-e29b-41d4-a716-446655440111';
    const response = await request.get(
      `${BASE_URL}/displays/${invalidConfigDisplayId}/prayer-times`
    );

    expect([400, 500]).toContain(response.status());

    if (response.status() === 400) {
      const error = await response.json();
      expect(error.code).toBe('INVALID_CONFIGURATION');
    }
  });

  test('provides fallback for historical dates beyond API coverage', async ({ request }) => {
    const oldDate = '2020-01-01';
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times?date=${oldDate}`
    );

    // Should either provide calculated times or return appropriate error
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.data.prayer_date).toBe(oldDate);
    }
  });
});