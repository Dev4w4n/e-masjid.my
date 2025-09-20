import { Page, expect } from "@playwright/test";
import path from "path";

/**
 * Test utilities for authentication and common operations
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Navigate to a page and wait for it to load completely
   */
  async navigateAndWait(url: string, waitForSelector?: string) {
    console.log(`🧭 Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: "networkidle" });

    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
    }

    // Wait for any loading spinners to disappear
    await this.page
      .waitForFunction(
        () => {
          const spinners = document.querySelectorAll(
            '[role="progressbar"], .MuiCircularProgress-root'
          );
          return spinners.length === 0;
        },
        { timeout: 15000 }
      )
      .catch(() => {
        console.warn("⚠️ Loading spinners still visible after timeout");
      });
  }

  /**
   * Sign in with provided credentials
   */
  async signIn(email: string, password: string) {
    console.log(`🔐 Signing in as: ${email}`);

    await this.navigateAndWait("/auth/signin", 'input[type="email"]');

    // Fill in credentials
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);

    // Submit the form
    await this.page.click('button[type="submit"]');

    // Wait for successful authentication (redirect away from signin page)
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/auth/signin"),
      { timeout: 30000 }
    );

    console.log("✅ Sign in successful");
  }

  /**
   * Load authentication state from file
   */
  async loadAuthState(role: "super_admin" | "masjid_admin" | "registered") {
    const storageFiles = {
      super_admin: "super-admin-auth.json",
      masjid_admin: "masjid-admin-auth.json",
      registered: "user-auth.json",
    };

    const storageFile = path.join(
      __dirname,
      "../../../test-results/storage",
      storageFiles[role]
    );

    try {
      console.log(
        `🔑 Loading authentication state for ${role} from ${storageFile}`
      );
      const context = this.page.context();
      await context.addCookies(require(storageFile).cookies || []);
      await context.addInitScript(() => {
        const storage = require(storageFile);
        if (storage.localStorage) {
          for (const [key, value] of storage.localStorage) {
            localStorage.setItem(key, value);
          }
        }
        if (storage.sessionStorage) {
          for (const [key, value] of storage.sessionStorage) {
            sessionStorage.setItem(key, value);
          }
        }
      });
      console.log(`✅ Authentication state loaded for ${role}`);
    } catch (error) {
      console.warn(
        `⚠️ Could not load authentication state for ${role}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Measure page load performance
   */
  async measurePageLoadPerformance(url: string) {
    console.log(`📊 Measuring performance for: ${url}`);

    const startTime = Date.now();

    // Start performance measurement
    await this.page.goto(url, { waitUntil: "networkidle" });

    const loadTime = Date.now() - startTime;

    // Get additional performance metrics
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType("paint");

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint:
          paintEntries.find((p) => p.name === "first-paint")?.startTime || 0,
        firstContentfulPaint:
          paintEntries.find((p) => p.name === "first-contentful-paint")
            ?.startTime || 0,
        networkRequests: performance.getEntriesByType("resource").length,
      };
    });

    console.log("📈 Performance metrics:", {
      totalLoadTime: loadTime,
      ...performanceMetrics,
    });

    return {
      totalLoadTime: loadTime,
      ...performanceMetrics,
    };
  }

  /**
   * Monitor console messages and capture authentication-related logs
   */
  async captureAuthLogs() {
    const authLogs: string[] = [];

    this.page.on("console", (msg) => {
      const text = msg.text();
      // Capture logs related to authentication and profile loading
      if (
        text.includes("🔍") ||
        text.includes("📊") ||
        text.includes("👤") ||
        text.includes("✅") ||
        text.includes("❌") ||
        text.includes("⏰") ||
        text.includes("profile") ||
        text.includes("auth") ||
        text.includes("user")
      ) {
        authLogs.push(`[${msg.type()}] ${text}`);
        console.log(`📝 Captured log: ${text}`);
      }
    });

    return authLogs;
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuthComplete(timeoutMs: number = 30000) {
    console.log("⏳ Waiting for authentication to complete...");

    const startTime = Date.now();

    // Wait for either:
    // 1. Loading state to be false (successful auth)
    // 2. Error state to appear
    // 3. Timeout

    try {
      await this.page.waitForFunction(
        () => {
          // Check if there's an auth loading spinner
          const loadingSpinners = document.querySelectorAll(
            '[role="progressbar"], .MuiCircularProgress-root'
          );
          return loadingSpinners.length === 0;
        },
        { timeout: timeoutMs }
      );

      const authTime = Date.now() - startTime;
      console.log(`✅ Authentication completed in ${authTime}ms`);
      return authTime;
    } catch (error) {
      const authTime = Date.now() - startTime;
      console.error(`❌ Authentication timeout after ${authTime}ms`);
      throw error;
    }
  }

  /**
   * Check if user is authenticated by looking for auth-specific elements
   */
  async isAuthenticated() {
    try {
      // Look for authenticated user indicators (profile menu, logout button, etc.)
      const authIndicators = [
        '[data-testid="user-menu"]',
        '[data-testid="profile-menu"]',
        'button:has-text("Sign Out")',
        'button:has-text("Profile")',
        'nav a:has-text("Profile")',
      ];

      for (const selector of authIndicators) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          console.log(`✅ Authentication confirmed with selector: ${selector}`);
          return true;
        } catch {
          continue;
        }
      }

      console.log("❌ No authentication indicators found");
      return false;
    } catch (error) {
      console.error("❌ Error checking authentication status:", error);
      return false;
    }
  }

  /**
   * Force a page refresh and measure reload performance
   */
  async refreshAndMeasure() {
    console.log("🔄 Refreshing page and measuring performance...");

    const startTime = Date.now();
    await this.page.reload({ waitUntil: "networkidle" });
    const refreshTime = Date.now() - startTime;

    console.log(`📊 Page refresh took ${refreshTime}ms`);
    return refreshTime;
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    const screenshot = await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
    console.log(`📸 Screenshot saved: ${name}`);
    return screenshot;
  }

  /**
   * Get current URL and state information
   */
  async getCurrentState() {
    const url = this.page.url();
    const title = await this.page.title();

    return {
      url,
      title,
      timestamp: new Date().toISOString(),
    };
  }
}
