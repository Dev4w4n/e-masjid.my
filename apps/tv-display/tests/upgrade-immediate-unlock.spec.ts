import { test, expect } from "@playwright/test";

test.describe("Upgrade immediate unlock", () => {
  test("shows upgrade entry point on display page", async ({ page }) => {
    await page.goto("/display/550e8400-e29b-41d4-a716-446655440000");
    await expect(page.getByRole("button", { name: /Tukar Pelan|Upgrade/ })).toBeVisible();
  });
});
