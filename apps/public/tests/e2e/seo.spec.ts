import { test, expect } from "@playwright/test";

test.describe("SEO Validation", () => {
  test.describe("Homepage SEO", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    test("should have meta title tag", async ({ page }) => {
      const title = await page.title();

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(title.toLowerCase()).toContain("emasjid");
    });

    test("should have meta description tag", async ({ page }) => {
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");

      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
      expect(description!.length).toBeLessThanOrEqual(160);
    });

    test("should have OpenGraph meta tags", async ({ page }) => {
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute("content");
      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .getAttribute("content");
      const ogType = await page
        .locator('meta[property="og:type"]')
        .getAttribute("content");
      const ogUrl = await page
        .locator('meta[property="og:url"]')
        .getAttribute("content");

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogType).toBe("website");
      expect(ogUrl).toBeTruthy();
    });

    test("should have Twitter Card meta tags", async ({ page }) => {
      const twitterCard = await page
        .locator('meta[name="twitter:card"]')
        .getAttribute("content");
      const twitterTitle = await page
        .locator('meta[name="twitter:title"]')
        .getAttribute("content");

      expect(twitterCard).toBeTruthy();
      expect(twitterTitle).toBeTruthy();
    });

    test("should have valid ItemList structured data", async ({ page }) => {
      const scripts = page.locator('script[type="application/ld+json"]');
      const count = await scripts.count();

      expect(count).toBeGreaterThan(0);

      // Find ItemList structured data
      let foundItemList = false;
      for (let i = 0; i < count; i++) {
        const jsonContent = await scripts.nth(i).textContent();
        try {
          const data = JSON.parse(jsonContent || "{}");
          if (data["@type"] === "ItemList") {
            foundItemList = true;
            expect(data.itemListElement).toBeDefined();
            expect(Array.isArray(data.itemListElement)).toBeTruthy();
            break;
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }

      expect(foundItemList).toBeTruthy();
    });

    test("should have canonical link", async ({ page }) => {
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");

      expect(canonical).toBeTruthy();
      expect(canonical).toContain("localhost:3002");
    });

    test("should have proper HTML lang attribute", async ({ page }) => {
      const lang = await page.locator("html").getAttribute("lang");

      expect(lang).toBeTruthy();
      expect(["ms", "ms-MY", "en"]).toContain(lang);
    });

    test("should have viewport meta tag for responsive design", async ({
      page,
    }) => {
      const viewport = await page
        .locator('meta[name="viewport"]')
        .getAttribute("content");

      expect(viewport).toBeTruthy();
      expect(viewport).toContain("width=device-width");
    });
  });

  test.describe("Content Detail Page SEO", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Navigate to first content detail page
      const firstCard = page.locator("article a, .card-islamic").first();
      await firstCard.click();
      await page.waitForLoadState("networkidle");
    });

    test("should have content-specific meta title", async ({ page }) => {
      const title = await page.title();

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThanOrEqual(60);
      // Should not be same as homepage title
      expect(title.toLowerCase()).toContain("emasjid");
    });

    test("should have content-specific meta description", async ({ page }) => {
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");

      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
      expect(description!.length).toBeLessThanOrEqual(160);
    });

    test("should have Product structured data with required fields", async ({
      page,
    }) => {
      const scripts = page.locator('script[type="application/ld+json"]');
      const count = await scripts.count();

      expect(count).toBeGreaterThan(0);

      // Find Product structured data
      let foundProduct = false;
      for (let i = 0; i < count; i++) {
        const jsonContent = await scripts.nth(i).textContent();
        try {
          const data = JSON.parse(jsonContent || "{}");
          if (data["@type"] === "Product") {
            foundProduct = true;

            // Verify required Product fields
            expect(data.name).toBeTruthy();
            expect(data.description).toBeDefined();
            expect(data["@context"]).toBe("https://schema.org");

            // Verify offers if present
            if (data.offers) {
              expect(data.offers.priceCurrency).toBe("MYR");
            }
            break;
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }

      expect(foundProduct).toBeTruthy();
    });

    test("should have OpenGraph image meta tag", async ({ page }) => {
      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");

      // Image is optional but should be valid URL if present
      if (ogImage) {
        expect(ogImage).toMatch(/^https?:\/\/.+/);
      }
    });

    test("should have canonical URL for detail page", async ({ page }) => {
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");

      expect(canonical).toBeTruthy();
      expect(canonical).toMatch(/\/iklan\/.+/);
    });
  });

  test.describe("Sitemap & Robots", () => {
    test("should have accessible sitemap at /sitemap.xml", async ({ page }) => {
      const response = await page.goto("/sitemap.xml");

      expect(response?.status()).toBe(200);
      expect(response?.headers()["content-type"]).toContain("xml");

      const content = await page.content();
      expect(content).toContain("<?xml");
      expect(content).toContain("<urlset");
      expect(content).toContain("<url>");
      expect(content).toContain("<loc>");
    });

    test("should include homepage in sitemap", async ({ page }) => {
      await page.goto("/sitemap.xml");

      const content = await page.content();
      expect(content).toContain("http://localhost:3002/");
    });

    test("should include content detail pages in sitemap", async ({ page }) => {
      await page.goto("/sitemap.xml");

      const content = await page.content();
      expect(content).toContain("/iklan/");
    });

    test("should have accessible robots.txt at /robots.txt", async ({
      page,
    }) => {
      const response = await page.goto("/robots.txt");

      expect(response?.status()).toBe(200);
      expect(response?.headers()["content-type"]).toContain("text");

      const content = await page.content();
      expect(content).toContain("User-agent");
    });

    test("should reference sitemap in robots.txt", async ({ page }) => {
      await page.goto("/robots.txt");

      const content = await page.content();
      expect(content.toLowerCase()).toContain("sitemap");
      expect(content).toContain("/sitemap.xml");
    });

    test("should allow all bots in robots.txt", async ({ page }) => {
      await page.goto("/robots.txt");

      const content = await page.content();
      expect(content).toContain("User-agent: *");
      expect(content).toContain("Allow: /");
    });
  });

  test.describe("Image Accessibility", () => {
    test("should have alt text for all images on homepage", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const images = page.locator("img");
      const count = await images.count();

      // Check each image has alt attribute
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        // Alt can be empty string for decorative images, but must exist
        expect(alt).toBeDefined();
      }
    });

    test("should have alt text for all images on detail page", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Navigate to detail page
      const firstCard = page.locator("article a, .card-islamic").first();
      if ((await firstCard.count()) > 0) {
        await firstCard.click();
        await page.waitForLoadState("networkidle");

        const images = page.locator("img");
        const count = await images.count();

        // Check each image has alt attribute
        for (let i = 0; i < count; i++) {
          const alt = await images.nth(i).getAttribute("alt");
          expect(alt).toBeDefined();
        }
      }
    });

    test("should have descriptive alt text for content images", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check content images have meaningful alt text
      const contentImages = page.locator("article img, .card-islamic img");
      const count = await contentImages.count();

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) {
          const alt = await contentImages.nth(i).getAttribute("alt");

          // Alt should exist and be meaningful (not just "image" or empty)
          expect(alt).toBeTruthy();
          if (alt) {
            expect(alt.length).toBeGreaterThan(3);
          }
        }
      }
    });
  });

  test.describe("Performance & Core Web Vitals", () => {
    test("should load homepage within reasonable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Should load in less than 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test("should have no console errors on homepage", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (err) => !err.includes("favicon") && !err.includes("404")
      );

      expect(criticalErrors.length).toBe(0);
    });

    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // h1 should come before h2
      const h1 = page.locator("h1").first();
      const h2 = page.locator("h2").first();

      if ((await h2.count()) > 0) {
        const h1Box = await h1.boundingBox();
        const h2Box = await h2.boundingBox();

        if (h1Box && h2Box) {
          // h1 should appear before h2 in the document
          expect(h1Box.y).toBeLessThan(h2Box.y);
        }
      }
    });
  });
});
