import { test, expect } from "@playwright/test";

test.describe("Content Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage first
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should navigate from homepage to detail page", async ({ page }) => {
    // Wait for content cards to load
    const cards = page.locator("article a, .card-islamic");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Click the first content card
    const firstCard = page.locator("article a, .card-islamic").first();
    const cardTitle = await firstCard.locator("h3, h2").textContent();

    await firstCard.click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/iklan\/.+/);

    // Verify the title appears on detail page
    await expect(page.locator("h1")).toContainText(cardTitle || "");
  });

  test("should render full content on detail page", async ({ page }) => {
    // Navigate directly to a detail page
    const firstCard = page.locator("article a, .card-islamic").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Verify key elements are present
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("article")).toBeVisible();

    // Verify masjid info section is displayed (look for specific structure)
    const masjidSection = page
      .locator("article div.flex.items-center")
      .filter({ hasText: "🕌" });
    await expect(masjidSection).toBeVisible();

    const locationSection = page
      .locator("article div.flex.items-center")
      .filter({ hasText: "📍" });
    await expect(locationSection).toBeVisible();

    // Verify content is displayed (either image or video)
    const hasImage = (await page.locator("article img[alt]").count()) > 0;
    const hasVideo = (await page.locator("article iframe").count()) > 0;
    expect(hasImage || hasVideo).toBeTruthy();
  });

  test("should display contact information if available", async ({ page }) => {
    // Navigate to detail page
    const firstCard = page.locator("article a, .card-islamic").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Check if contact section exists
    const contactSection = page.locator("text=/maklumat hubungan|contact/i");

    if ((await contactSection.count()) > 0) {
      await expect(contactSection).toBeVisible();

      // If contact section exists, verify it has either phone or email
      const hasPhone = (await page.locator('a[href^="tel:"]').count()) > 0;
      const hasEmail = (await page.locator('a[href^="mailto:"]').count()) > 0;

      expect(hasPhone || hasEmail).toBeTruthy();
    }
  });

  test("should have correct meta tags", async ({ page }) => {
    // Navigate to detail page
    const firstCard = page.locator("article a, .card-islamic").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Verify meta tags
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);

    // Verify OpenGraph tags
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    expect(ogDescription).toBeTruthy();
  });

  test("should include Product structured data", async ({ page }) => {
    // Navigate to detail page
    const firstCard = page.locator("article a, .card-islamic").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Find all structured data script tags
    const structuredDataScripts = page.locator(
      'script[type="application/ld+json"]'
    );
    const count = await structuredDataScripts.count();

    // Should have at least one structured data tag
    expect(count).toBeGreaterThan(0);

    // Check each script for Product type
    let foundProduct = false;
    for (let i = 0; i < count; i++) {
      const jsonContent = await structuredDataScripts.nth(i).textContent();
      try {
        const data = JSON.parse(jsonContent || "{}");
        if (data["@type"] === "Product") {
          foundProduct = true;
          expect(data.name).toBeTruthy();
          expect(data.description).toBeDefined();
          break;
        }
      } catch (e) {
        // Skip malformed JSON
      }
    }

    expect(foundProduct).toBeTruthy();
  });

  test("should display premium badge for sponsored content", async ({
    page,
  }) => {
    // Look for premium content on homepage
    const premiumSection = page.locator("text=/iklan premium|premium/i");

    if ((await premiumSection.count()) > 0) {
      // Find first premium badge
      const premiumBadge = page.locator(".premium-badge").first();

      if ((await premiumBadge.count()) > 0) {
        // Click the parent card (navigate up to the link)
        const parentCard = premiumBadge.locator("xpath=ancestor::a[1]");
        await parentCard.click();
        await page.waitForLoadState("networkidle");

        // Verify premium badge appears on detail page
        const detailBadge = page.locator(".premium-badge").first();
        await expect(detailBadge).toBeVisible();
      }
    }
  });

  test("should navigate back to homepage", async ({ page }) => {
    // Get homepage URL first
    const homepageUrl = page.url();

    // Navigate to detail page
    const firstCard = page.locator("article a, .card-islamic").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Verify we're on detail page
    await expect(page).toHaveURL(/\/iklan\/.+/);

    // Click browser back button
    await page.goBack();
    await page.waitForLoadState("networkidle");

    // Verify back on homepage
    await expect(page).toHaveURL(homepageUrl);
    await expect(page.locator("h1")).toContainText(
      /iklan|perkhidmatan|komuniti/i
    );
  });

  test("should handle non-existent content gracefully", async ({ page }) => {
    // Navigate to non-existent content
    await page.goto(
      "/iklan/non-existent-slug-00000000-0000-0000-0000-000000000000"
    );

    // Should show 404 or error page
    const is404 =
      (await page.locator("text=/404|not found|tidak dijumpai/i").count()) > 0;
    const isError = (await page.locator("text=/error|ralat/i").count()) > 0;

    expect(is404 || isError).toBeTruthy();
  });

  test("should load within performance budget", async ({ page }) => {
    // Navigate to detail page
    const firstCard = page.locator("article a, .card-islamic").first();

    const startTime = Date.now();
    await firstCard.click();
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
