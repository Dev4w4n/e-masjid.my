import { test, expect } from "@playwright/test";

test.describe("Basic Setup Test", () => {
  test("can access the application homepage", async ({ page }) => {
    console.log("🔍 Testing basic application access");

    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that we can access the page
    const title = await page.title();
    console.log("📄 Page title:", title);

    // Take a screenshot for verification
    await page.screenshot({ path: "test-results/screenshots/homepage.png" });

    // Basic assertion - we should have a title
    expect(title).toBeTruthy();

    console.log("✅ Basic access test passed");
  });

  test("can load the sign-in page", async ({ page }) => {
    console.log("🔍 Testing sign-in page access");

    await page.goto("/auth/signin");
    await page.waitForLoadState("networkidle");

    // Check for email input field
    const emailInput = await page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check for password input field
    const passwordInput = await page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check for submit button
    const submitButton = await page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    console.log("✅ Sign-in page test passed");
  });

  test("environment variables are loaded", async ({ page }) => {
    console.log("🔍 Testing environment variables");

    // Check that our test environment variables are available
    const superAdminEmail = process.env.TEST_SUPER_ADMIN_EMAIL;
    const testSupabaseUrl = process.env.VITE_SUPABASE_URL;

    console.log("🔑 Test Super Admin Email:", superAdminEmail);
    console.log("🔌 Supabase URL:", testSupabaseUrl);

    expect(superAdminEmail).toBeTruthy();
    expect(testSupabaseUrl).toBeTruthy();

    console.log("✅ Environment variables test passed");
  });
});
