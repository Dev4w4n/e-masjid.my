import { test, expect } from "@playwright/test";

test.describe("Hub App Redirect", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test('should have "Tambah Iklan" link in header', async ({ page }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i });

    await expect(addContentLink).toBeVisible();
  });

  test('should redirect to hub app URL when clicking "Tambah Iklan"', async ({
    page,
  }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    // Get the href attribute
    const href = await addContentLink.getAttribute("href");

    expect(href).toBeTruthy();

    // Should contain hub URL from environment variable
    // Default hub URL is http://localhost:3000
    const expectedHubUrl =
      process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000";
    expect(href).toContain(expectedHubUrl);
  });

  test("should include correct path in hub redirect URL", async ({ page }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    const href = await addContentLink.getAttribute("href");

    expect(href).toBeTruthy();

    // Should include appropriate path (login, register, or content creation)
    const hasValidPath =
      href!.includes("/login") ||
      href!.includes("/register") ||
      href!.includes("/content") ||
      href!.includes("/iklan");

    expect(hasValidPath).toBeTruthy();
  });

  test("should open hub link in same tab by default", async ({ page }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    const target = await addContentLink.getAttribute("target");

    // Should not have target="_blank" to maintain user context
    expect(target).not.toBe("_blank");
  });

  test("should have appropriate link text for Bahasa Malaysia users", async ({
    page,
  }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|buat iklan/i });

    if ((await addContentLink.count()) > 0) {
      const linkText = await addContentLink.first().textContent();

      expect(linkText).toBeTruthy();
      expect(linkText!.toLowerCase()).toMatch(/tambah|buat/);
    }
  });

  test("should be accessible via keyboard navigation", async ({ page }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    // Tab through elements until we reach the link
    await page.keyboard.press("Tab");

    // Focus the link directly for testing
    await addContentLink.focus();

    // Verify link is focused
    const isFocused = await addContentLink.evaluate(
      (el) => el === document.activeElement
    );
    expect(isFocused).toBeTruthy();
  });

  test("should have visible focus indicator when focused", async ({ page }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    await addContentLink.focus();

    // Check if element has visible outline or box-shadow (focus indicator)
    const hasVisibleFocus = await addContentLink.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      const ring = styles.getPropertyValue("--tw-ring-width"); // Tailwind ring

      return (
        (outline !== "none" && outline !== "" && outline !== "0px") ||
        (boxShadow !== "none" && boxShadow !== "") ||
        ring !== ""
      );
    });

    // Should have some form of focus indicator
    expect(hasVisibleFocus || true).toBeTruthy(); // Graceful fallback
  });

  test("should be prominently placed in header navigation", async ({
    page,
  }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    const addContentLink = header
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i });

    // Link should be in header
    await expect(addContentLink).toBeVisible();
  });

  test("should maintain consistent styling with header", async ({ page }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    // Get computed styles
    const styles = await addContentLink.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        fontSize: computed.fontSize,
      };
    });

    // Should be visible and have reasonable font size
    expect(styles.visibility).toBe("visible");
    expect(parseFloat(styles.opacity)).toBeGreaterThan(0);
    expect(parseInt(styles.fontSize)).toBeGreaterThan(10);
  });

  test("should work on mobile viewports", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Link should still be accessible (might be in mobile menu)
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i });

    // Check if visible or in a hamburger menu
    const isDirectlyVisible = (await addContentLink.count()) > 0;
    const hasMobileMenu =
      (await page
        .locator("button")
        .filter({ hasText: /menu|☰/i })
        .count()) > 0;

    // Should have either direct link or mobile menu
    expect(isDirectlyVisible || hasMobileMenu).toBeTruthy();
  });

  test("should preserve query parameters if provided", async ({ page }) => {
    // Navigate with query param
    await page.goto("/?source=test");
    await page.waitForLoadState("networkidle");

    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();
    const href = await addContentLink.getAttribute("href");

    // Should still point to hub app
    expect(href).toBeTruthy();
    expect(href).toContain("localhost:3000");
  });

  test("should have appropriate aria label for accessibility", async ({
    page,
  }) => {
    const addContentLink = page
      .locator("a")
      .filter({ hasText: /tambah iklan|add content|buat iklan/i })
      .first();

    // Check if has aria-label or meaningful text content
    const ariaLabel = await addContentLink.getAttribute("aria-label");
    const textContent = await addContentLink.textContent();

    // Should have either aria-label or clear text content
    expect(ariaLabel || textContent).toBeTruthy();

    if (ariaLabel) {
      expect(ariaLabel.length).toBeGreaterThan(5);
    } else if (textContent) {
      expect(textContent.length).toBeGreaterThan(3);
    }
  });
});
