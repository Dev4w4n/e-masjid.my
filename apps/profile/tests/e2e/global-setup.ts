import { chromium, FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for E2E tests...");

  // Load test environment variables
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
    console.log("✅ Test environment variables loaded");
  } else {
    console.warn("⚠️ Test environment file not found:", envPath);
  }

  // Verify Supabase connection
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    console.log("✅ Supabase configuration verified");
    console.log("📍 Supabase URL:", supabaseUrl);
  } catch (error) {
    console.error("❌ Supabase configuration error:", error);
    throw error;
  }

  // Create a browser instance to pre-authenticate users for tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the dev server to be ready
    console.log("⏳ Waiting for development server...");
    const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3002";

    // Try to access the server with retries
    let retries = 0;
    const maxRetries = 30; // 30 seconds

    while (retries < maxRetries) {
      try {
        const response = await page.goto(baseURL, { waitUntil: "networkidle" });
        if (response && response.ok()) {
          console.log("✅ Development server is ready");
          break;
        }
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(
            `Development server not ready after ${maxRetries} attempts: ${error}`
          );
        }
        await page.waitForTimeout(1000); // Wait 1 second before retry
      }
    }

    // Pre-authenticate test users and store authentication state
    const storageDir = path.join(__dirname, "../../../test-results/storage");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Test user credentials from .env.test.local
    const testUsers = [
      {
        email: process.env.TEST_SUPER_ADMIN_EMAIL,
        password: process.env.TEST_SUPER_ADMIN_PASSWORD,
        role: "super_admin",
        storageFile: "super-admin-auth.json",
      },
      {
        email: process.env.TEST_MASJID_ADMIN_EMAIL,
        password: process.env.TEST_MASJID_ADMIN_PASSWORD,
        role: "masjid_admin",
        storageFile: "masjid-admin-auth.json",
      },
      {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
        role: "registered",
        storageFile: "user-auth.json",
      },
    ];

    for (const user of testUsers) {
      if (user.email && user.password) {
        console.log(`🔐 Pre-authenticating ${user.role} user: ${user.email}`);

        try {
          // Start fresh for each user
          await context.clearCookies();
          await page.goto(`${baseURL}/auth/signin`);

          // Wait for the sign-in form to load
          await page.waitForSelector('input[type="email"]', { timeout: 10000 });

          // Fill in credentials
          await page.fill('input[type="email"]', user.email);
          await page.fill('input[type="password"]', user.password);

          // Submit the form
          await page.click('button[type="submit"]');

          // Wait for successful authentication (redirect to home or profile)
          await page.waitForURL(
            (url) =>
              url.pathname === "/" ||
              url.pathname.includes("/profile") ||
              url.pathname.includes("/admin"),
            { timeout: 30000 }
          );

          // Save the authentication state
          const authState = await context.storageState();
          const storageFile = path.join(storageDir, user.storageFile);
          fs.writeFileSync(storageFile, JSON.stringify(authState, null, 2));

          console.log(
            `✅ ${user.role} authentication state saved to ${user.storageFile}`
          );
        } catch (error) {
          console.warn(
            `⚠️ Failed to pre-authenticate ${user.role} user:`,
            error
          );
          // Don't fail the entire setup for authentication issues
        }
      }
    }
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

export default globalSetup;
