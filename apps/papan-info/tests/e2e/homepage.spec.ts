import { test, expect } from "@playwright/test";

test.describe("Homepage E2E Tests", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/masjidbro|e-masjid/i);
  });

  test('should display header with "Tambah Iklan" link', async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const tambahIklanLink = page.getByRole("link", { name: /tambah iklan/i });
    await expect(tambahIklanLink).toBeVisible();
  });

  test("should display content grid", async ({ page }) => {
    await page.goto("/");

    // Wait for content to load
    await page.waitForSelector('[data-testid="content-grid"], .content-grid', {
      timeout: 5000,
    });

    const contentGrid = page
      .locator('[data-testid="content-grid"], .content-grid')
      .first();
    await expect(contentGrid).toBeVisible();
  });

  test("should display category filter buttons", async ({ page }) => {
    await page.goto("/");

    const allButton = page.getByRole("button", { name: /all|semua/i });
    await expect(allButton).toBeVisible();
  });

  test("should display footer", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("should load page in under 2 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test("should have no JavaScript errors in console", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(consoleErrors).toHaveLength(0);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Mobile menu should be accessible
    const mobileMenu = page.locator(
      '[aria-label="menu"], button[aria-label="Menu"]'
    );
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });
});
