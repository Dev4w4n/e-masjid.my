import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually for testing
function loadTestEnv() {
  const envPath = path.join(__dirname, "../../../../.env.test.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const envLines = envContent.split("\n");

    envLines.forEach((line) => {
      if (line.trim() && !line.startsWith("#")) {
        const [key, value] = line.split("=");
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

// Load environment variables before tests
loadTestEnv();

test.describe("Profile Performance Issues - Real Test", () => {
  test.beforeEach(async ({ page }) => {
    // Setup console logging to capture auth issues
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.includes("🔍") ||
        text.includes("📊") ||
        text.includes("⏰") ||
        text.includes("timeout") ||
        text.includes("failed") ||
        text.includes("error")
      ) {
        console.log(`[CONSOLE] ${msg.type()}: ${text}`);
      }
    });
  });

  test("Issue 1: Measure actual profile loading performance", async ({
    page,
  }) => {
    console.log("🔬 Testing REAL Issue 1: Profile loading performance");

    const email = process.env.TEST_SUPER_ADMIN_EMAIL;
    const password = process.env.TEST_SUPER_ADMIN_PASSWORD;

    console.log("🔑 Using credentials:", {
      email,
      password: password ? "***" : "undefined",
    });

    if (!email || !password) {
      console.error("❌ Test credentials not found in environment");
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter((k) => k.includes("TEST"))
      );
      throw new Error("Test credentials not configured");
    }

    console.log("🧭 Step 1: Navigate to sign-in page");
    await page.goto("http://localhost:3002/auth/signin");
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log("🔐 Step 2: Fill in credentials");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    console.log("⏱️ Step 3: Start timing and submit form");
    const loginStartTime = Date.now();

    // Submit and immediately start monitoring console logs for performance issues
    await page.click('button[type="submit"]');

    console.log("⏳ Step 4: Wait for authentication and profile loading");

    try {
      // Wait for redirect away from signin (indicates auth process started)
      await page.waitForURL((url) => !url.pathname.includes("/auth/signin"), {
        timeout: 30000,
      });

      const authRedirectTime = Date.now() - loginStartTime;
      console.log(`📊 Auth redirect completed in: ${authRedirectTime}ms`);

      // Wait for loading spinners to disappear (indicates profile loading complete)
      await page.waitForFunction(
        () => {
          const spinners = document.querySelectorAll(
            '[role="progressbar"], .MuiCircularProgress-root'
          );
          return spinners.length === 0;
        },
        { timeout: 30000 }
      );

      const totalLoadTime = Date.now() - loginStartTime;
      console.log(`📊 Total profile loading time: ${totalLoadTime}ms`);

      // Check final state
      const currentUrl = page.url();
      console.log(`📍 Final URL: ${currentUrl}`);

      // Performance assertions
      if (totalLoadTime > 10000) {
        console.warn(
          `⚠️ SLOW PERFORMANCE DETECTED: ${totalLoadTime}ms (over 10 seconds)`
        );
        await page.screenshot({
          path: "test-results/screenshots/slow-performance.png",
        });
      }

      if (totalLoadTime > 15000) {
        console.error(
          `❌ UNACCEPTABLE PERFORMANCE: ${totalLoadTime}ms (over 15 seconds)`
        );
        throw new Error(`Profile loading too slow: ${totalLoadTime}ms`);
      }

      console.log("✅ Profile loading performance test completed");
    } catch (error) {
      const errorTime = Date.now() - loginStartTime;
      console.error(
        `❌ Profile loading failed or timed out after ${errorTime}ms:`,
        error
      );

      await page.screenshot({
        path: "test-results/screenshots/profile-loading-error.png",
      });

      throw error;
    }
  });

  test("Issue 2: Test page refresh after login", async ({ page }) => {
    console.log("🔬 Testing REAL Issue 2: Page refresh after login");

    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error("Test user credentials not configured");
    }

    console.log("🔐 Step 1: Login successfully");
    await page.goto("http://localhost:3002/auth/signin");
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL((url) => !url.pathname.includes("/auth/signin"), {
      timeout: 30000,
    });
    await page.waitForFunction(
      () => {
        const spinners = document.querySelectorAll(
          '[role="progressbar"], .MuiCircularProgress-root'
        );
        return spinners.length === 0;
      },
      { timeout: 30000 }
    );

    console.log("✅ Initial login successful");

    console.log("🧭 Step 2: Navigate to protected profile page");
    await page.goto("http://localhost:3002/profile");
    await page.waitForLoadState("networkidle");

    const beforeRefreshUrl = page.url();
    console.log(`📍 Before refresh URL: ${beforeRefreshUrl}`);

    console.log("🔄 Step 3: Refresh the page and test persistence");
    const refreshStartTime = Date.now();

    await page.reload({ waitUntil: "networkidle" });

    const refreshTime = Date.now() - refreshStartTime;
    console.log(`📊 Page refresh took: ${refreshTime}ms`);

    console.log("🔍 Step 4: Check if authentication persisted");

    try {
      // Wait for the page to fully load after refresh
      await page.waitForFunction(
        () => {
          const spinners = document.querySelectorAll(
            '[role="progressbar"], .MuiCircularProgress-root'
          );
          return spinners.length === 0;
        },
        { timeout: 30000 }
      );

      const afterRefreshUrl = page.url();
      console.log(`📍 After refresh URL: ${afterRefreshUrl}`);

      // Check if we were redirected to login page (authentication lost)
      if (afterRefreshUrl.includes("/auth/signin")) {
        console.error(
          "❌ AUTHENTICATION LOST: Redirected to login page after refresh"
        );
        await page.screenshot({
          path: "test-results/screenshots/auth-lost-after-refresh.png",
        });
        throw new Error("Authentication was not persisted after page refresh");
      }

      // Check if we stayed on the protected page
      if (afterRefreshUrl.includes("/profile")) {
        console.log("✅ Authentication persisted: Still on profile page");
      } else {
        console.warn(
          `⚠️ Unexpected redirect after refresh: ${afterRefreshUrl}`
        );
      }

      console.log("✅ Page refresh authentication test completed");
    } catch (error) {
      console.error("❌ Post-refresh authentication check failed:", error);
      await page.screenshot({
        path: "test-results/screenshots/refresh-auth-error.png",
      });
      throw error;
    }
  });

  test("Simplified performance benchmark", async ({ page }) => {
    console.log("🔬 Running simplified performance benchmark");

    const testData = [
      {
        email: process.env.TEST_SUPER_ADMIN_EMAIL,
        password: process.env.TEST_SUPER_ADMIN_PASSWORD,
        role: "super_admin",
      },
      {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
        role: "user",
      },
    ];

    for (const { email, password, role } of testData) {
      if (!email || !password) continue;

      console.log(`🔍 Testing performance for ${role}: ${email}`);

      // Clear any existing auth
      await page.context().clearCookies();

      const startTime = Date.now();

      // Login flow
      await page.goto("http://localhost:3002/auth/signin");
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Wait for completion
      await page.waitForURL((url) => !url.pathname.includes("/auth/signin"), {
        timeout: 30000,
      });
      await page.waitForFunction(
        () => {
          const spinners = document.querySelectorAll(
            '[role="progressbar"], .MuiCircularProgress-root'
          );
          return spinners.length === 0;
        },
        { timeout: 30000 }
      );

      const totalTime = Date.now() - startTime;
      console.log(`📊 ${role} performance: ${totalTime}ms`);

      // Logout for next test
      await page.context().clearCookies();
    }
  });
});
