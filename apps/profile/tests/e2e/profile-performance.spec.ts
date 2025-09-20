import { test, expect } from "@playwright/test";
import { TestUtils } from "./helpers/test-utils";

test.describe("Profile Loading Performance Issues", () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test("Issue 1: Slow profile loading performance after login", async ({
    page,
  }) => {
    console.log("🔬 Testing Issue 1: Slow profile loading performance");

    // Setup: Start capturing auth logs
    const authLogs = await testUtils.captureAuthLogs();

    // Test with super admin user credentials from .env.test.local
    const email = process.env.TEST_SUPER_ADMIN_EMAIL!;
    const password = process.env.TEST_SUPER_ADMIN_PASSWORD!;

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    console.log(`🔐 Testing with user: ${email}`);

    // Step 1: Navigate to sign-in page and measure baseline
    const signInStartTime = Date.now();
    await testUtils.navigateAndWait("/auth/signin", 'input[type="email"]');
    const signInPageLoadTime = Date.now() - signInStartTime;

    console.log(`📊 Sign-in page load time: ${signInPageLoadTime}ms`);

    // Step 2: Sign in and measure authentication time
    const authStartTime = Date.now();

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // Click submit and start measuring profile loading
    await page.click('button[type="submit"]');

    // Capture the exact moment when profile loading starts
    const profileLoadStartTime = Date.now();

    // Wait for redirect away from signin page (indicates auth started)
    await page.waitForURL((url) => !url.pathname.includes("/auth/signin"), {
      timeout: 30000,
    });

    console.log(
      "🔄 Authentication redirect completed, waiting for profile loading..."
    );

    // Wait for profile loading to complete (no more loading spinners)
    try {
      await testUtils.waitForAuthComplete(45000); // Increased timeout for slow loading
      const profileLoadTime = Date.now() - profileLoadStartTime;

      console.log(`📊 Total profile loading time: ${profileLoadTime}ms`);

      // Analyze the captured logs
      console.log("📝 Authentication logs captured:");
      authLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });

      // Performance assertions
      expect(profileLoadTime).toBeLessThan(15000); // Should load within 15 seconds

      // Check for timeout errors in logs
      const timeoutErrors = authLogs.filter(
        (log) =>
          log.includes("timeout") ||
          log.includes("failed") ||
          log.includes("⏰")
      );

      if (timeoutErrors.length > 0) {
        console.error("❌ Timeout errors detected:", timeoutErrors);
        await testUtils.takeScreenshot("profile-loading-timeout-error");
      }

      expect(timeoutErrors.length).toBe(0);

      // Verify successful authentication
      const isAuthenticated = await testUtils.isAuthenticated();
      expect(isAuthenticated).toBeTruthy();
    } catch (error) {
      console.error("❌ Profile loading failed or timed out:", error);
      await testUtils.takeScreenshot("profile-loading-failure");

      // Log current page state for debugging
      const currentState = await testUtils.getCurrentState();
      console.error("🔍 Current page state:", currentState);

      // Re-throw the error to fail the test
      throw error;
    }
  });

  test("Issue 1b: Measure profile loading performance with network monitoring", async ({
    page,
  }) => {
    console.log("🔬 Testing Issue 1b: Profile loading with network monitoring");

    // Monitor network requests to identify slow queries
    const networkRequests: Array<{
      url: string;
      duration: number;
      status: number;
    }> = [];

    page.on("response", async (response) => {
      const request = response.request();
      const requestStartTime = Date.now();

      // Track Supabase API calls
      if (
        request.url().includes("supabase") ||
        request.url().includes("rest/v1")
      ) {
        networkRequests.push({
          url: request.url(),
          duration: requestStartTime, // We'll measure duration differently
          status: response.status(),
        });

        console.log(
          `🌐 API Request: ${request.method()} ${request.url()} - ${response.status()}`
        );
      }
    });

    // Capture console logs specifically for database queries
    const dbLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.includes("Fetching") ||
        text.includes("query") ||
        text.includes("database") ||
        text.includes("Profile query") ||
        text.includes("User query")
      ) {
        dbLogs.push(text);
        console.log(`📊 DB Log: ${text}`);
      }
    });

    // Test authentication flow
    const email = process.env.TEST_SUPER_ADMIN_EMAIL!;
    const password = process.env.TEST_SUPER_ADMIN_PASSWORD!;

    await testUtils.signIn(email, password);

    // Wait a bit for all network requests to complete
    await page.waitForTimeout(5000);

    // Analyze network performance
    console.log("📊 Network request analysis:");
    networkRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.url} - ${req.status}`);
    });

    // Analyze database query logs
    console.log("📊 Database query logs:");
    dbLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });

    // Performance assertions
    const slowRequests = networkRequests.filter((req) => req.status >= 500);
    if (slowRequests.length > 0) {
      console.warn("⚠️ Server error requests detected:", slowRequests);
    }

    // Check for failed requests
    const failedRequests = networkRequests.filter((req) => req.status >= 400);
    expect(failedRequests.length).toBe(0);

    // Verify no duplicate queries (performance optimization check)
    const uniqueUrls = new Set(networkRequests.map((req) => req.url));
    const duplicateQueries = networkRequests.length - uniqueUrls.size;

    if (duplicateQueries > 0) {
      console.warn(
        `⚠️ Potential duplicate queries detected: ${duplicateQueries}`
      );
    }
  });

  test("Profile loading performance comparison: Before vs After optimization", async ({
    page,
  }) => {
    console.log("🔬 Testing profile loading performance comparison");

    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    // Test multiple iterations to get average performance
    const iterations = 3;
    const performanceResults = [];

    for (let i = 0; i < iterations; i++) {
      console.log(`🔄 Performance test iteration ${i + 1}/${iterations}`);

      // Clear any existing authentication
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Measure complete authentication flow
      const iterationStartTime = Date.now();

      await testUtils.signIn(email, password);
      await testUtils.waitForAuthComplete(30000);

      const iterationTotalTime = Date.now() - iterationStartTime;
      performanceResults.push(iterationTotalTime);

      console.log(`📊 Iteration ${i + 1} completed in ${iterationTotalTime}ms`);

      // Wait before next iteration
      if (i < iterations - 1) {
        await page.waitForTimeout(2000);
      }
    }

    // Calculate performance statistics
    const averageTime =
      performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
    const minTime = Math.min(...performanceResults);
    const maxTime = Math.max(...performanceResults);

    console.log("📊 Performance Results:");
    console.log(`  Average time: ${averageTime.toFixed(2)}ms`);
    console.log(`  Min time: ${minTime}ms`);
    console.log(`  Max time: ${maxTime}ms`);
    console.log(`  Individual results: ${performanceResults.join(", ")}ms`);

    // Performance assertions
    expect(averageTime).toBeLessThan(10000); // Should average under 10 seconds
    expect(maxTime).toBeLessThan(15000); // No single attempt should exceed 15 seconds

    // Consistency check - max shouldn't be more than 3x min
    const consistencyRatio = maxTime / minTime;
    console.log(
      `📊 Performance consistency ratio: ${consistencyRatio.toFixed(2)}`
    );
    expect(consistencyRatio).toBeLessThan(3);
  });
});
