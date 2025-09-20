import { test, expect } from "@playwright/test";

test.describe("Simple Page Refresh Test", () => {
  test("Should handle page refresh after login", async ({ page }) => {
    console.log("🔬 Testing simple page refresh after login");

    // Step 1: Login
    console.log("🧭 Step 1: Navigate to sign-in page");
    await page.goto("http://localhost:3002/auth/signin");
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log("🔐 Step 2: Fill in credentials");
    await page.fill('input[type="email"]', "super.admin@test.com");
    await page.fill('input[type="password"]', "TestPassword123!");

    console.log("⏱️ Step 3: Submit form and wait for redirect");
    await page.click('button[type="submit"]');

    // Wait for successful authentication by checking URL
    await page.waitForURL((url) => !url.pathname.includes("/auth/signin"), {
      timeout: 10000,
    });
    console.log(
      "✅ Successfully authenticated and redirected away from signin"
    );

    // Step 2: Refresh the page
    console.log("🔄 Step 4: Refreshing the page");
    await page.reload({ waitUntil: "domcontentloaded" });

    // Step 3: Check if we're still authenticated and content loads
    console.log("🔍 Step 5: Checking authentication status after refresh");

    // First check if we got redirected to signin (auth failed)
    const currentUrl = page.url();
    console.log("📍 Current URL after refresh:", currentUrl);

    if (currentUrl.includes("/auth/signin")) {
      console.log("❌ User was redirected to signin page - auth not persisted");
      throw new Error("Authentication did not persist after page refresh");
    }

    console.log("✅ User remained authenticated - auth persisted");

    // Now wait for the content to actually load (not just authentication)
    console.log("⏳ Waiting for page content to load...");

    try {
      // Wait for loading spinners to disappear
      await page.waitForFunction(
        () => {
          const spinners = document.querySelectorAll(
            '[role="progressbar"], .MuiCircularProgress-root'
          );
          return spinners.length === 0;
        },
        { timeout: 15000 }
      );
      console.log("✅ Loading spinners are gone");

      // Wait for actual content to appear
      await page.waitForFunction(
        () => {
          const bodyText = document.body.textContent || "";
          return (
            bodyText.includes("Welcome back") ||
            bodyText.includes("Quick Actions") ||
            bodyText.includes("Dashboard")
          );
        },
        { timeout: 10000 }
      );

      console.log("✅ Content has loaded successfully!");

      // Verify content is visible
      const pageContent = await page.textContent("body");
      if (
        pageContent?.includes("Welcome back") ||
        pageContent?.includes("Dashboard") ||
        pageContent?.includes("Quick Actions")
      ) {
        console.log(
          "✅ Confirmed: User content is visible, authentication and content loading successful"
        );
      } else {
        throw new Error("Expected content not found on page after refresh");
      }
    } catch (error) {
      console.error("❌ Content loading failed:", error);

      // Debug: Log what's actually on the page
      const pageContent = await page.textContent("body");
      console.log("🔍 Current page content:", pageContent?.substring(0, 500));

      // Take a screenshot for debugging
      await page.screenshot({ path: "test-results/content-loading-error.png" });

      throw new Error("Content did not load properly after page refresh");
    }

    // Also check if there are any error messages
    const errorMessages = await page
      .locator('[role="alert"], .error, .alert-error')
      .all();
    if (errorMessages.length > 0) {
      console.log("⚠️ Found error messages on page");
      for (const error of errorMessages) {
        const text = await error.textContent();
        console.log("Error text:", text);
      }
    }

    console.log("✅ Simple page refresh test completed");
  });
});
