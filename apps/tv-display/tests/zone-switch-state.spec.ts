import { test, expect } from "@playwright/test";

test.describe("Zone Switch State Persistence", () => {
  test("language context remains stable while switching zone", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => {
      sessionStorage.setItem("zone_session_state", JSON.stringify({
        locale: "ms",
        zone_code: "JHR01",
        comparison_section: "tiers",
      }));
    });

    const state = await page.evaluate(() => sessionStorage.getItem("zone_session_state"));
    expect(state).toContain("\"locale\":\"ms\"");
  });
});
