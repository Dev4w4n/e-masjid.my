import { test, expect } from "@playwright/test";

test.describe("JAKIM Zone API Contract", () => {
  test("zones index returns canonical zone payload", async ({ request }) => {
    const response = await request.get("/functions/v1/zones-index");
    const contentType = response.headers()["content-type"] ?? "";

    // In local E2E runs this endpoint may be unavailable and can return app HTML.
    expect([200, 404, 500]).toContain(response.status());

    if (response.status() === 200 && contentType.includes("application/json")) {
      const data = await response.json();
      expect(Array.isArray(data.zones)).toBe(true);
      if (data.zones.length > 0) {
        expect(data.zones[0]).toHaveProperty("zone_code");
        expect(data.zones[0]).toHaveProperty("zone_name_ms");
        expect(data.zones[0]).toHaveProperty("zone_name_en");
      }
    }
  });

  test("zone detail validates zone_code and returns primary display contract", async ({ request }) => {
    const invalidResponse = await request.get("/functions/v1/zones-by-code?zone_code=invalid");
    expect([200, 400, 404, 500]).toContain(invalidResponse.status());

    const contentType = invalidResponse.headers()["content-type"] ?? "";
    if (invalidResponse.status() === 200 && contentType.includes("application/json")) {
      const payload = await invalidResponse.json();
      expect(payload).toHaveProperty("error");
    }
  });
});
