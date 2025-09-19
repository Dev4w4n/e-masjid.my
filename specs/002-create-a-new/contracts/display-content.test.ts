// Display Content API Contract Tests
// These tests will fail initially until implementation is complete

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const SAMPLE_DISPLAY_ID = "550e8400-e29b-41d4-a716-446655440000";

test.describe("Display Content API", () => {
  test("GET /displays/{displayId}/content returns top 10 sponsored content", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("meta");

    // Verify content structure
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(10);

    // Verify each content item has required fields
    if (data.data.length > 0) {
      const contentItem = data.data[0];
      expect(contentItem).toHaveProperty("id");
      expect(contentItem).toHaveProperty("title");
      expect(contentItem).toHaveProperty("type");
      expect(contentItem).toHaveProperty("url");
      expect(contentItem).toHaveProperty("sponsorship_amount");
      expect(contentItem).toHaveProperty("duration");

      // Verify content type is valid
      expect(["youtube_video", "image"]).toContain(contentItem.type);

      // Verify sponsorship amount is number
      expect(typeof contentItem.sponsorship_amount).toBe("number");
      expect(contentItem.sponsorship_amount).toBeGreaterThanOrEqual(0);
    }

    // Verify meta contains carousel interval
    expect(data.meta).toHaveProperty("carousel_interval");
    expect(typeof data.meta.carousel_interval).toBe("number");
    expect(data.meta.carousel_interval).toBeGreaterThanOrEqual(5);
    expect(data.meta.carousel_interval).toBeLessThanOrEqual(300);
  });

  test("GET /displays/{displayId}/content returns 404 for invalid display", async ({
    request,
  }) => {
    const invalidDisplayId = "00000000-0000-0000-0000-000000000000";
    const response = await request.get(
      `${BASE_URL}/displays/${invalidDisplayId}/content`
    );

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty("code");
    expect(error).toHaveProperty("message");
    expect(error.code).toBe("RESOURCE_NOT_FOUND");
  });

  test("GET /displays/{displayId}/content sorts by sponsorship amount descending", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const contentItems = data.data;

    // Verify items are sorted by sponsorship_amount in descending order
    for (let i = 0; i < contentItems.length - 1; i++) {
      expect(contentItems[i].sponsorship_amount).toBeGreaterThanOrEqual(
        contentItems[i + 1].sponsorship_amount
      );
    }
  });

  test("GET /displays/{displayId}/content includes only active content", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const contentItems = data.data;

    // Verify all items have status 'active'
    contentItems.forEach((item) => {
      expect(item.status).toBe("active");
    });
  });

  test("GET /displays/{displayId}/content handles YouTube and image content types", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/displays/${SAMPLE_DISPLAY_ID}/content`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    const contentItems = data.data;

    contentItems.forEach((item) => {
      if (item.type === "youtube_video") {
        // YouTube URLs should contain youtube.com or youtu.be
        expect(item.url).toMatch(/youtube\.com|youtu\.be/);
      } else if (item.type === "image") {
        // Image URLs should point to image files
        expect(item.url).toMatch(/\.(jpg|jpeg|png|gif|webp)$/i);
      }

      // All items should have thumbnail_url
      expect(item).toHaveProperty("thumbnail_url");
      expect(typeof item.thumbnail_url).toBe("string");
    });
  });
});

test.describe("Content API Error Handling", () => {
  test("handles server errors gracefully", async ({ request }) => {
    // This test assumes a scenario that triggers server error
    // Implementation should handle database failures, etc.
    const response = await request.get(
      `${BASE_URL}/displays/invalid-uuid-format/content`
    );

    expect([400, 500]).toContain(response.status());

    const error = await response.json();
    expect(error).toHaveProperty("code");
    expect(error).toHaveProperty("message");
  });

  test("validates display ID format", async ({ request }) => {
    const invalidFormatId = "not-a-uuid";
    const response = await request.get(
      `${BASE_URL}/displays/${invalidFormatId}/content`
    );

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});
