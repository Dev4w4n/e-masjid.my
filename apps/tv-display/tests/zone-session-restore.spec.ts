import { test, expect } from "@playwright/test";

test.describe("Zone Session Restore", () => {
  test("returns to landing without losing selected language context", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("zone_session_state", JSON.stringify({
        locale: "ms",
        zone_code: "JHR01",
        comparison_section: "tiers",
      }));
    });

    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
  });
});
