/**
 * Test setup file for the profile app
 * This file configures the testing environment for Vitest
 */

import { beforeAll } from "vitest";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load env files from the monorepo root so process.env is populated in tests
// Priority: .env -> .env.local -> .env.test -> .env.test.local (later overrides earlier)
(() => {
  const monorepoRoot = resolve(process.cwd(), "../../");
  const files = [".env", ".env.local", ".env.test", ".env.test.local"];

  for (const file of files) {
    const path = resolve(monorepoRoot, file);
    if (existsSync(path)) {
      // Use override: true so more specific files override base values
      loadEnv({ path, override: true });
    }
  }
})();

// Environment setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";

  // Mock console methods to reduce noise in tests if needed
  // console.warn = vi.fn();
  // console.error = vi.fn();
});

// Utility function to check if backend is available
export async function isBackendAvailable(
  url: string = "http://localhost:54321",
): Promise<boolean> {
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY || "test-key",
      },
    });
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

// Global test utilities and mocks can be added here
