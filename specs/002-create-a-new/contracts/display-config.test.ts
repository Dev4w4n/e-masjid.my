// Display Configuration API Contract Tests
// These tests will fail initially until implementation is complete

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const SAMPLE_DISPLAY_ID = "550e8400-e29b-41d4-a716-446655440000";

test.describe("Display Configuration API", () => {
  test("GET /displays/{displayId}/config returns complete configuration", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("data");

    const config = data.data;
    expect(config).toHaveProperty("id");
    expect(config).toHaveProperty("masjid_id");
    expect(config).toHaveProperty("display_name");
    expect(config).toHaveProperty("prayer_time_position");
    expect(config).toHaveProperty("carousel_interval");
    expect(config).toHaveProperty("max_content_items");
    expect(config).toHaveProperty("auto_refresh_interval");
    expect(config).toHaveProperty("is_active");

    // Verify data types and constraints
    expect(typeof config.id).toBe("string");
    expect(typeof config.masjid_id).toBe("string");
    expect(typeof config.display_name).toBe("string");
    expect(config.display_name.length).toBeLessThanOrEqual(50);

    expect(["top", "bottom", "left", "right", "center"]).toContain(
      config.prayer_time_position
    );

    expect(typeof config.carousel_interval).toBe("number");
    expect(config.carousel_interval).toBeGreaterThanOrEqual(5);
    expect(config.carousel_interval).toBeLessThanOrEqual(300);

    expect(typeof config.max_content_items).toBe("number");
    expect(config.max_content_items).toBeGreaterThanOrEqual(1);
    expect(config.max_content_items).toBeLessThanOrEqual(20);

    expect(typeof config.auto_refresh_interval).toBe("number");
    expect(config.auto_refresh_interval).toBeGreaterThanOrEqual(1);
    expect(config.auto_refresh_interval).toBeLessThanOrEqual(60);

    expect(typeof config.is_active).toBe("boolean");
  });

  test("PUT /displays/{displayId}/config updates configuration successfully", async ({
    request,
  }) => {
    const updateData = {
      display_name: "Updated Display Name",
      prayer_time_position: "center",
      carousel_interval: 30,
      max_content_items: 8,
      auto_refresh_interval: 5,
      is_active: true,
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: updateData,
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("data");

    const updatedConfig = data.data;
    expect(updatedConfig.display_name).toBe(updateData.display_name);
    expect(updatedConfig.prayer_time_position).toBe(
      updateData.prayer_time_position
    );
    expect(updatedConfig.carousel_interval).toBe(updateData.carousel_interval);
    expect(updatedConfig.max_content_items).toBe(updateData.max_content_items);
    expect(updatedConfig.auto_refresh_interval).toBe(
      updateData.auto_refresh_interval
    );
    expect(updatedConfig.is_active).toBe(updateData.is_active);
  });

  test("PUT /displays/{displayId}/config validates carousel_interval range", async ({
    request,
  }) => {
    const invalidData = {
      carousel_interval: 3, // Below minimum of 5
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData,
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toHaveProperty("field");
    expect(error.details.field).toBe("carousel_interval");
  });

  test("PUT /displays/{displayId}/config validates max_content_items range", async ({
    request,
  }) => {
    const invalidData = {
      max_content_items: 25, // Above maximum of 20
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData,
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details.field).toBe("max_content_items");
  });

  test("PUT /displays/{displayId}/config validates prayer_time_position enum", async ({
    request,
  }) => {
    const invalidData = {
      prayer_time_position: "invalid_position",
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData,
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details.field).toBe("prayer_time_position");
  });

  test("PUT /displays/{displayId}/config validates display_name length", async ({
    request,
  }) => {
    const invalidData = {
      display_name: "A".repeat(51), // Exceeds 50 character limit
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: invalidData,
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details.field).toBe("display_name");
  });

  test("GET /displays/{displayId}/config returns 404 for non-existent display", async ({
    request,
  }) => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const response = await request.get(
      `${BASE_URL}/displays/${nonExistentId}/config`
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error.code).toBe("RESOURCE_NOT_FOUND");
  });

  test("PUT /displays/{displayId}/config allows partial updates", async ({
    request,
  }) => {
    const partialUpdate = {
      carousel_interval: 45,
    };

    const response = await request.put(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/config`,
      {
        data: partialUpdate,
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const updatedConfig = data.data;
    expect(updatedConfig.carousel_interval).toBe(45);

    // Other fields should remain unchanged
    expect(updatedConfig).toHaveProperty("display_name");
    expect(updatedConfig).toHaveProperty("prayer_time_position");
    expect(updatedConfig).toHaveProperty("max_content_items");
  });
});

test.describe("Display Health API", () => {
  test("POST /displays/{displayId}/heartbeat records activity", async ({
    request,
  }) => {
    const heartbeatData = {
      status: "online",
    };

    const response = await request.post(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/heartbeat`,
      {
        data: heartbeatData,
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("success");
    expect(data).toHaveProperty("timestamp");
    expect(data.success).toBe(true);
    expect(typeof data.timestamp).toBe("string");

    // Timestamp should be recent (within last minute)
    const timestamp = new Date(data.timestamp);
    const now = new Date();
    const diffSeconds = (now.getTime() - timestamp.getTime()) / 1000;
    expect(diffSeconds).toBeLessThan(60);
  });

  test("POST /displays/{displayId}/heartbeat accepts error status", async ({
    request,
  }) => {
    const heartbeatData = {
      status: "error",
      error_message: "Network connectivity issue",
    };

    const response = await request.post(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/heartbeat`,
      {
        data: heartbeatData,
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("POST /displays/{displayId}/heartbeat validates status enum", async ({
    request,
  }) => {
    const invalidData = {
      status: "invalid_status",
    };

    const response = await request.post(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/heartbeat`,
      {
        data: invalidData,
      }
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});

test.describe("Masjid Management API", () => {
  test("GET /masjids/{masjidId}/displays returns all displays for masjid", async ({
    request,
  }) => {
    const sampleMasjidId = "660e8400-e29b-41d4-a716-446655440000";
    const response = await request.get(
      `${BASE_URL}/masjids/${sampleMasjidId}/displays`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);

    // Verify each display has required fields
    data.data.forEach((display: any) => {
      expect(display).toHaveProperty("id");
      expect(display).toHaveProperty("masjid_id");
      expect(display).toHaveProperty("display_name");
      expect(display).toHaveProperty("prayer_time_position");
      expect(display).toHaveProperty("carousel_interval");
      expect(display.masjid_id).toBe(sampleMasjidId);
    });
  });
});
