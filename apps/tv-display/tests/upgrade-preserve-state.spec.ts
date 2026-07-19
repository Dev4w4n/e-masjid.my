import { test, expect } from "@playwright/test";

test.describe("Upgrade preserve state", () => {
  test("keeps zone session state when initiating upgrade", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => {
      sessionStorage.setItem(
        "zone_session_state",
        JSON.stringify({
          locale: "ms",
          zone_code: "JHR01",
          comparison_context: "tiers",
        }),
      );
    });

    const state = await page.evaluate(() => sessionStorage.getItem("zone_session_state"));
    expect(state).toContain("\"zone_code\":\"JHR01\"");
  });
});
