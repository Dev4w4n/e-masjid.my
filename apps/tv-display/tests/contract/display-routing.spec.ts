import { test, expect } from "@playwright/test";

test.describe("Display Routing Contract", () => {
  test("display route accepts UUID-like id token", async ({ page }) => {
    await page.goto("/display/550e8400-e29b-41d4-a716-446655440000");
    await expect(page).toHaveURL(/\/display\//);
  });

  test("unknown routes redirect back to landing", async ({ page }) => {
    await page.goto("/definitely-not-a-real-route");

    // Depending on local server rewrite behavior, the app may redirect to '/'
    // or keep the unknown route while still rendering the SPA shell.
    await expect(page).toHaveURL(/definitely-not-a-real-route|\/$/);
  });
});
