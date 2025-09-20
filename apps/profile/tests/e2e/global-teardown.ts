import fs from "fs";
import path from "path";

async function globalTeardown() {
  console.log("🧹 Starting global teardown for E2E tests...");

  try {
    // Clean up authentication storage files
    const storageDir = path.join(__dirname, "../../../test-results/storage");
    if (fs.existsSync(storageDir)) {
      const files = fs.readdirSync(storageDir);
      files.forEach((file) => {
        if (file.endsWith("-auth.json")) {
          const filePath = path.join(storageDir, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up authentication file: ${file}`);
        }
      });
    }

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
