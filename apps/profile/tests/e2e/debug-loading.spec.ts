import { test, expect } from "@playwright/test";

test.describe("Debug Auth Loading", () => {
  test("Debug loading state after page refresh", async ({ page }) => {
    console.log("🔬 Debug test: analyzing auth loading state");

    // Enable console logging
    page.on("console", (msg) => console.log("🖥️ ", msg.text()));

    // Step 1: Login
    console.log("🧭 Step 1: Navigate to sign-in page");
    await page.goto("http://localhost:3002/auth/signin");
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log("🔐 Step 2: Fill in credentials");
    await page.fill('input[type="email"]', "super.admin@test.com");
    await page.fill('input[type="password"]', "TestPassword123!");

    console.log("⏱️ Step 3: Submit form and wait for redirect");
    await page.click('button[type="submit"]');

    // Wait for successful authentication
    await page.waitForURL((url) => !url.pathname.includes("/auth/signin"), {
      timeout: 10000,
    });
    console.log("✅ Successfully authenticated and redirected");

    // Step 2: Refresh the page
    console.log("🔄 Step 4: Refreshing the page");
    await page.reload({ waitUntil: "domcontentloaded" });

    // Wait a bit to see what happens
    console.log("⏳ Waiting 10 seconds to observe loading behavior...");
    await page.waitForTimeout(10000);

    // Check for spinners
    const spinners = await page
      .locator('[role="progressbar"], .MuiCircularProgress-root')
      .all();
    console.log(`🔍 Found ${spinners.length} loading spinners on page`);

    // Check the loading state in the page
    const loadingStates = await page.evaluate(() => {
      // Check if React DevTools or any global state is available
      const body = document.body;
      const textContent = body.textContent || "";
      return {
        hasWelcomeBack: textContent.includes("Welcome back"),
        hasQuickActions: textContent.includes("Quick Actions"),
        hasDashboard: textContent.includes("Dashboard"),
        hasLoadingText: textContent.includes("Loading"),
        bodyLength: textContent.length,
      };
    });

    console.log("📊 Page content analysis:", loadingStates);

    console.log("✅ Debug test completed");
  });
});
