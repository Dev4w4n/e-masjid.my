import { test, expect } from "@playwright/test";
import { TestUtils } from "./helpers/test-utils";

test.describe("Page Refresh After Login Issues", () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test("Issue 2: Unable to load page after logged in then refresh", async ({
    page,
  }) => {
    console.log("🔬 Testing Issue 2: Page refresh after login");

    const email = process.env.TEST_SUPER_ADMIN_EMAIL!;
    const password = process.env.TEST_SUPER_ADMIN_PASSWORD!;

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    // Step 1: Sign in successfully
    console.log("🔐 Step 1: Initial authentication");
    await testUtils.signIn(email, password);

    // Verify authentication is successful
    const isAuthenticatedInitially = await testUtils.isAuthenticated();
    expect(isAuthenticatedInitially).toBeTruthy();

    const initialState = await testUtils.getCurrentState();
    console.log("✅ Initial authentication successful:", initialState);

    // Step 2: Navigate to a protected page (profile page)
    console.log("🧭 Step 2: Navigate to protected page");
    await testUtils.navigateAndWait("/profile");

    // Verify we can access the protected page
    const profilePageState = await testUtils.getCurrentState();
    expect(profilePageState.url).toContain("/profile");
    console.log("✅ Profile page accessible:", profilePageState);

    // Step 3: Refresh the page and check what happens
    console.log("🔄 Step 3: Refreshing page to test persistence");

    // Start monitoring console logs for authentication flow during refresh
    const refreshLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      refreshLogs.push(`[${msg.type()}] ${text}`);
    });

    const refreshStartTime = Date.now();
    await page.reload({ waitUntil: "networkidle" });
    const refreshTime = Date.now() - refreshStartTime;

    console.log(`📊 Page refresh took ${refreshTime}ms`);

    // Step 4: Verify authentication persists after refresh
    console.log("🔍 Step 4: Checking authentication persistence");

    try {
      // Wait for authentication to be restored
      await testUtils.waitForAuthComplete(30000);

      const postRefreshState = await testUtils.getCurrentState();
      console.log("🔍 Post-refresh state:", postRefreshState);

      // Check if we're still authenticated
      const isAuthenticatedAfterRefresh = await testUtils.isAuthenticated();

      if (!isAuthenticatedAfterRefresh) {
        console.error("❌ Authentication not persisted after refresh!");
        await testUtils.takeScreenshot("auth-not-persisted-after-refresh");

        // Check if we were redirected to login page
        if (postRefreshState.url.includes("/auth/signin")) {
          console.error(
            "❌ Redirected to login page after refresh - session not persisted"
          );
        }

        // Log the refresh logs for debugging
        console.error("📝 Refresh logs:");
        refreshLogs.forEach((log, index) => {
          console.error(`  ${index + 1}. ${log}`);
        });
      }

      expect(isAuthenticatedAfterRefresh).toBeTruthy();

      // Verify we're still on the profile page (or haven't been redirected to login)
      expect(postRefreshState.url).not.toContain("/auth/signin");

      console.log("✅ Authentication persisted successfully after refresh");
    } catch (error) {
      console.error(
        "❌ Error during post-refresh authentication check:",
        error
      );

      // Capture debugging information
      const errorState = await testUtils.getCurrentState();
      console.error("🔍 Error state:", errorState);

      await testUtils.takeScreenshot("refresh-authentication-error");

      // Log all captured logs for debugging
      console.error("📝 All refresh logs:");
      refreshLogs.forEach((log, index) => {
        console.error(`  ${index + 1}. ${log}`);
      });

      throw error;
    }
  });

  test("Page refresh persistence across different protected pages", async ({
    page,
  }) => {
    console.log("🔬 Testing refresh persistence across different pages");

    const email = process.env.TEST_MASJID_ADMIN_EMAIL!;
    const password = process.env.TEST_MASJID_ADMIN_PASSWORD!;

    // Sign in once
    await testUtils.signIn(email, password);

    // Test refresh on different protected pages
    const protectedPages = [
      "/profile",
      "/profile/view",
      "/admin",
      "/masjids/new",
    ];

    for (const pagePath of protectedPages) {
      console.log(`🧭 Testing refresh on ${pagePath}`);

      try {
        // Navigate to the page
        await testUtils.navigateAndWait(pagePath);

        const beforeRefreshState = await testUtils.getCurrentState();
        console.log(`📍 Before refresh (${pagePath}):`, beforeRefreshState);

        // Refresh the page
        const refreshTime = await testUtils.refreshAndMeasure();

        // Check authentication after refresh
        const isAuthenticated = await testUtils.isAuthenticated();
        const afterRefreshState = await testUtils.getCurrentState();

        console.log(`📍 After refresh (${pagePath}):`, afterRefreshState);
        console.log(`⏱️ Refresh time: ${refreshTime}ms`);

        // Verify authentication persisted
        if (!isAuthenticated) {
          console.error(`❌ Authentication lost on ${pagePath} after refresh`);
          await testUtils.takeScreenshot(
            `auth-lost-${pagePath.replace("/", "-")}`
          );
        }

        expect(isAuthenticated).toBeTruthy();

        // Verify we weren't redirected to login
        expect(afterRefreshState.url).not.toContain("/auth/signin");

        console.log(`✅ Refresh test passed for ${pagePath}`);
      } catch (error) {
        console.error(`❌ Refresh test failed for ${pagePath}:`, error);
        await testUtils.takeScreenshot(
          `refresh-error-${pagePath.replace("/", "-")}`
        );
        throw error;
      }
    }
  });

  test("Authentication token persistence and refresh behavior", async ({
    page,
  }) => {
    console.log("🔬 Testing authentication token persistence");

    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    // Monitor localStorage and sessionStorage changes
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      const originalRemoveItem = localStorage.removeItem;

      localStorage.setItem = function (key, value) {
        console.log(
          `🔑 localStorage.setItem: ${key} = ${value?.substring(0, 50)}...`
        );
        return originalSetItem.call(this, key, value);
      };

      localStorage.removeItem = function (key) {
        console.log(`🗑️ localStorage.removeItem: ${key}`);
        return originalRemoveItem.call(this, key);
      };
    });

    // Sign in and capture storage state
    await testUtils.signIn(email, password);

    // Check what's stored in localStorage/sessionStorage
    const storageBeforeRefresh = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage).map((key) => ({
          key,
          value: localStorage.getItem(key)?.substring(0, 100) + "...",
        })),
        sessionStorage: Object.keys(sessionStorage).map((key) => ({
          key,
          value: sessionStorage.getItem(key)?.substring(0, 100) + "...",
        })),
      };
    });

    console.log("💾 Storage before refresh:", storageBeforeRefresh);

    // Refresh and check storage again
    await page.reload({ waitUntil: "networkidle" });

    const storageAfterRefresh = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage).map((key) => ({
          key,
          value: localStorage.getItem(key)?.substring(0, 100) + "...",
        })),
        sessionStorage: Object.keys(sessionStorage).map((key) => ({
          key,
          value: sessionStorage.getItem(key)?.substring(0, 100) + "...",
        })),
      };
    });

    console.log("💾 Storage after refresh:", storageAfterRefresh);

    // Check if important auth tokens are preserved
    const authKeys = ["supabase.auth.token", "sb-", "auth-", "session", "user"];
    const hasAuthTokens = storageAfterRefresh.localStorage.some((item) =>
      authKeys.some((key) => item.key.includes(key))
    );

    if (!hasAuthTokens) {
      console.warn(
        "⚠️ No authentication tokens found in localStorage after refresh"
      );
    }

    // Verify authentication still works
    await testUtils.waitForAuthComplete(15000);
    const isAuthenticated = await testUtils.isAuthenticated();
    expect(isAuthenticated).toBeTruthy();
  });

  test("Network retry behavior on refresh", async ({ page }) => {
    console.log("🔬 Testing network retry behavior on refresh");

    // Track failed network requests
    const failedRequests: Array<{
      url: string;
      status: number;
      attempt: number;
    }> = [];
    let requestAttempts = new Map<string, number>();

    page.on("response", (response) => {
      const url = response.url();
      const status = response.status();

      // Track Supabase requests
      if (url.includes("supabase") || url.includes("rest/v1")) {
        const currentAttempts = requestAttempts.get(url) || 0;
        requestAttempts.set(url, currentAttempts + 1);

        if (status >= 400) {
          failedRequests.push({
            url,
            status,
            attempt: currentAttempts + 1,
          });
          console.log(
            `❌ Failed request: ${url} - ${status} (attempt ${currentAttempts + 1})`
          );
        } else {
          console.log(
            `✅ Successful request: ${url} - ${status} (attempt ${currentAttempts + 1})`
          );
        }
      }
    });

    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    // Authenticate
    await testUtils.signIn(email, password);

    // Navigate to profile and refresh multiple times
    await testUtils.navigateAndWait("/profile");

    for (let i = 0; i < 3; i++) {
      console.log(`🔄 Refresh attempt ${i + 1}/3`);
      requestAttempts.clear(); // Reset attempt counters

      await page.reload({ waitUntil: "networkidle" });
      await testUtils.waitForAuthComplete(20000);

      await page.waitForTimeout(2000); // Wait for any retries
    }

    // Analyze results
    console.log("📊 Network retry analysis:");
    console.log(`  Total failed requests: ${failedRequests.length}`);

    if (failedRequests.length > 0) {
      console.log("❌ Failed requests detected:");
      failedRequests.forEach((req, index) => {
        console.log(
          `  ${index + 1}. ${req.url} - ${req.status} (attempt ${req.attempt})`
        );
      });
    }

    // Check for excessive retries (indicating potential issues)
    const excessiveRetries = Array.from(requestAttempts.entries()).filter(
      ([url, attempts]) => attempts > 3
    );

    if (excessiveRetries.length > 0) {
      console.warn("⚠️ Excessive retries detected:");
      excessiveRetries.forEach(([url, attempts]) => {
        console.warn(`  ${url}: ${attempts} attempts`);
      });
    }

    // Assertions
    expect(failedRequests.filter((req) => req.status >= 500).length).toBe(0); // No server errors
    expect(excessiveRetries.length).toBeLessThan(2); // At most 1 URL with excessive retries
  });
});
