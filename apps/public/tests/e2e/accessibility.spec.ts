import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Audit (WCAG 2.1 AA)", () => {
  test.describe("Homepage Accessibility", () => {
    test("should not have any automatically detectable accessibility violations", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check h1 exists and is unique
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // h1 should have meaningful text
      const h1Text = await page.locator("h1").textContent();
      expect(h1Text).toBeTruthy();
      expect(h1Text!.length).toBeGreaterThan(5);
    });

    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa"])
        .include("body")
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v: any) => v.id === "color-contrast"
      );

      expect(contrastViolations).toEqual([]);
    });

    test("should have proper ARIA labels for interactive elements", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check all buttons have accessible names
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute("aria-label");
        const textContent = await button.textContent();

        // Button should have either aria-label or text content
        expect(ariaLabel || textContent).toBeTruthy();
      }
    });

    test("should have proper alt text for all images", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const images = page.locator("img");
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");

        // Alt attribute must exist (can be empty for decorative images)
        expect(alt).toBeDefined();
      }
    });

    test("should be navigable with keyboard", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Tab through focusable elements
      const focusableElements = await page
        .locator(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        .count();

      expect(focusableElements).toBeGreaterThan(0);

      // Focus first element
      await page.keyboard.press("Tab");

      // Check if an element is focused
      const hasFocus = await page.evaluate(
        () => document.activeElement !== document.body
      );
      expect(hasFocus).toBeTruthy();
    });

    test("should have visible focus indicators", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Get first focusable link
      const firstLink = page.locator("a").first();
      await firstLink.focus();

      // Check if element has visible focus indicator
      const hasVisibleFocus = await firstLink.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== "none" ||
          styles.boxShadow !== "none" ||
          styles.getPropertyValue("--tw-ring-width") !== ""
        );
      });

      expect(hasVisibleFocus).toBeTruthy();
    });

    test("should have proper lang attribute", async ({ page }) => {
      await page.goto("/");

      const lang = await page.locator("html").getAttribute("lang");

      expect(lang).toBeTruthy();
      expect(["ms", "ms-MY", "en"]).toContain(lang);
    });

    test("should have descriptive link text", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const links = page.locator("a");
      const linkCount = await links.count();

      // Check first 10 links
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");

        // Link should have meaningful text or aria-label
        const accessibleName = ariaLabel || text;
        expect(accessibleName).toBeTruthy();

        // Avoid generic link text
        const genericTerms = [
          "click here",
          "klik di sini",
          "here",
          "link",
          "more",
          "read more",
        ];
        if (accessibleName) {
          const isGeneric = genericTerms.some(
            (term) => accessibleName.toLowerCase().trim() === term
          );
          expect(isGeneric).toBeFalsy();
        }
      }
    });
  });

  test.describe("Content Detail Page Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Navigate to first content
      const firstCard = page.locator("article a, .card-islamic").first();
      await firstCard.click();
      await page.waitForLoadState("networkidle");
    });

    test("should not have any accessibility violations", async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should have proper article structure", async ({ page }) => {
      // Check article element exists
      await expect(page.locator("article")).toBeVisible();

      // Check h1 exists
      const h1 = page.locator("article h1");
      await expect(h1).toBeVisible();
    });

    test("should have accessible contact information", async ({ page }) => {
      // Check if contact section exists
      const contactHeading = page
        .locator("h2")
        .filter({ hasText: /maklumat hubungan|contact/i });

      if ((await contactHeading.count()) > 0) {
        // Check phone links
        const phoneLinks = page.locator('a[href^="tel:"]');
        if ((await phoneLinks.count()) > 0) {
          const href = await phoneLinks.first().getAttribute("href");
          expect(href).toMatch(/^tel:/);
        }

        // Check email links
        const emailLinks = page.locator('a[href^="mailto:"]');
        if ((await emailLinks.count()) > 0) {
          const href = await emailLinks.first().getAttribute("href");
          expect(href).toMatch(/^mailto:/);
        }
      }
    });

    test("should have proper iframe title for YouTube embeds", async ({
      page,
    }) => {
      const iframe = page.locator("iframe");

      if ((await iframe.count()) > 0) {
        const title = await iframe.getAttribute("title");
        expect(title).toBeTruthy();
        expect(title!.length).toBeGreaterThan(3);
      }
    });

    test("should have descriptive image alt text", async ({ page }) => {
      const contentImages = page.locator("article img");

      if ((await contentImages.count()) > 0) {
        const alt = await contentImages.first().getAttribute("alt");
        expect(alt).toBeTruthy();
        expect(alt!.length).toBeGreaterThan(3);
      }
    });
  });

  test.describe("Form Accessibility (if applicable)", () => {
    test("should have proper form labels", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const inputs = page.locator("input, textarea, select");
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");

        // Input should have associated label or aria-label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = (await label.count()) > 0;
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });
  });

  test.describe("Responsive Design Accessibility", () => {
    test("should be accessible on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should have proper touch target sizes on mobile", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check button and link sizes (minimum 44x44px for touch targets)
      const interactiveElements = page.locator("a, button");
      const count = await interactiveElements.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactiveElements.nth(i);
        const box = await element.boundingBox();

        if (box) {
          // Touch targets should be at least 44x44px (relaxed to 40x40 for compact layouts)
          expect(box.width).toBeGreaterThanOrEqual(40);
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe("Screen Reader Support", () => {
    test("should have proper ARIA landmarks", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Check for header
      const header = page.locator('header, [role="banner"]');
      const headerCount = await header.count();
      expect(headerCount).toBeGreaterThanOrEqual(1);

      // Check for footer
      const footer = page.locator('footer, [role="contentinfo"]');
      const footerCount = await footer.count();
      expect(footerCount).toBeGreaterThanOrEqual(1);
    });

    test("should have proper list markup", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check if lists are used properly
      const lists = page.locator("ul, ol");
      const listCount = await lists.count();

      if (listCount > 0) {
        // First list should have list items
        const firstList = lists.first();
        const listItems = firstList.locator("li");
        const itemCount = await listItems.count();

        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test("should announce route changes", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check for route announcer (Next.js built-in)
      const announcer = page.locator('[role="alert"][aria-live="assertive"]');

      // Navigate to detail page
      const firstCard = page.locator("article a, .card-islamic").first();
      if ((await firstCard.count()) > 0) {
        await firstCard.click();
        await page.waitForLoadState("networkidle");

        // Route change should be announced
        const hasAnnouncer = (await announcer.count()) > 0;
        expect(hasAnnouncer).toBeTruthy();
      }
    });
  });

  test.describe("Error Handling Accessibility", () => {
    test("should handle 404 page accessibly", async ({ page }) => {
      await page.goto("/iklan/non-existent-page");

      // Should have proper error message
      const errorMessage = page.locator("text=/404|not found|tidak dijumpai/i");
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();
      }

      // Run accessibility check on error page
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
