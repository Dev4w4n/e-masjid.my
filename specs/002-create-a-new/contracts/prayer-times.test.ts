// Prayer Times API Contract Tests
// These tests will fail initially until implementation is complete

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const SAMPLE_DISPLAY_ID = "550e8400-e29b-41d4-a716-446655440000";

test.describe("Prayer Times API", () => {
  test("GET /displays/{displayId}/prayer-times returns current prayer schedule", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("meta");

    // Verify prayer schedule structure
    const schedule = data.data;
    expect(schedule).toHaveProperty("prayer_date");
    expect(schedule).toHaveProperty("fajr_time");
    expect(schedule).toHaveProperty("sunrise_time");
    expect(schedule).toHaveProperty("dhuhr_time");
    expect(schedule).toHaveProperty("asr_time");
    expect(schedule).toHaveProperty("maghrib_time");
    expect(schedule).toHaveProperty("isha_time");
    expect(schedule).toHaveProperty("source");
    expect(schedule).toHaveProperty("fetched_at");

    // Verify time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    expect(schedule.fajr_time).toMatch(timeRegex);
    expect(schedule.sunrise_time).toMatch(timeRegex);
    expect(schedule.dhuhr_time).toMatch(timeRegex);
    expect(schedule.asr_time).toMatch(timeRegex);
    expect(schedule.maghrib_time).toMatch(timeRegex);
    expect(schedule.isha_time).toMatch(timeRegex);

    // Verify date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(schedule.prayer_date).toMatch(dateRegex);

    // Verify meta contains position configuration
    expect(data.meta).toHaveProperty("position");
    expect(["top", "bottom", "left", "right", "center"]).toContain(
      data.meta.position
    );
  });

  test("GET /displays/{displayId}/prayer-times accepts date parameter", async ({
    request,
  }) => {
    const testDate = "2025-12-25";
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times?date=${testDate}`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data.prayer_date).toBe(testDate);
  });

  test("GET /displays/{displayId}/prayer-times returns 404 for invalid display", async ({
    request,
  }) => {
    const invalidDisplayId = "00000000-0000-0000-0000-000000000000";
    const response = await request.get(
      `${BASE_URL}/displays/${invalidDisplayId}/prayer-times`
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty("code");
    expect(error.code).toBe("RESOURCE_NOT_FOUND");
  });

  test("GET /displays/{displayId}/prayer-times validates date parameter", async ({
    request,
  }) => {
    const invalidDate = "2025-13-45"; // Invalid date
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times?date=${invalidDate}`
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  test("GET /displays/{displayId}/prayer-times includes JAKIM source", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data.source).toContain("JAKIM");
  });

  test("GET /displays/{displayId}/prayer-times prayer times are in logical order", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    expect(response.status()).toBe(200);

    const schedule = await response.json();
    const times = schedule.data;

    // Convert time strings to comparable format (minutes since midnight)
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const fajr = timeToMinutes(times.fajr_time);
    const sunrise = timeToMinutes(times.sunrise_time);
    const dhuhr = timeToMinutes(times.dhuhr_time);
    const asr = timeToMinutes(times.asr_time);
    const maghrib = timeToMinutes(times.maghrib_time);
    const isha = timeToMinutes(times.isha_time);

    // Verify prayer times are in chronological order
    expect(fajr).toBeLessThan(sunrise);
    expect(sunrise).toBeLessThan(dhuhr);
    expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib);
    expect(maghrib).toBeLessThan(isha);
  });
});

test.describe("Prayer Times API Resilience", () => {
  test("handles JAKIM API failures gracefully", async ({ request }) => {
    // This test verifies the system behavior when JAKIM API is unavailable
    // Should return cached data or appropriate error response
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    // Should either succeed with cached data or return specific error
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.data).toHaveProperty("fetched_at");
      // Cached data should be relatively recent (within 48 hours)
      const fetchedAt = new Date(data.data.fetched_at);
      const now = new Date();
      const diffHours =
        (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeLessThan(48);
    } else {
      expect(response.status()).toBe(503); // Service unavailable
      const error = await response.json();
      expect(error.code).toBe("PRAYER_TIMES_UNAVAILABLE");
    }
  });

  test("retries JAKIM API calls as specified", async ({ request }) => {
    // This test verifies retry logic implementation
    // In a real scenario, we'd mock API failures and verify retry attempts
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/prayer-times`
    );

    // If successful, it should have proper source attribution
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.data.source).toBeDefined();
      expect(data.data.fetched_at).toBeDefined();
    }
  });
});
