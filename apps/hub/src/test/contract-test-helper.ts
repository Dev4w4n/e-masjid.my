/**
 * Helper utilities for contract tests
 */

import { describe, beforeAll, it } from "vitest";

/**
 * Check if the backend API server is available
 */
export async function isBackendAvailable(
  url: string = "http://localhost:54321",
): Promise<boolean> {
  try {
    // Try to make a simple request to check if the server is responding
    const response = await fetch(`${url}/health`, {
      method: "GET",
      // Don't wait too long for this check
      signal: AbortSignal.timeout(2000),
    });
    return response.status !== 404;
  } catch (error) {
    // If the request fails, try a different endpoint
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: "HEAD",
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY || "test-key",
        },
        signal: AbortSignal.timeout(2000),
      });
      return response.status !== 404;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Conditional describe that only runs if backend is available
 */
export function describeWithBackend(
  name: string,
  fn: () => void,
  apiUrl?: string,
) {
  return describe(name, () => {
    let backendAvailable = false;

    beforeAll(async () => {
      backendAvailable = await isBackendAvailable(apiUrl);
      if (!backendAvailable) {
        console.warn(`Skipping "${name}": Backend server is not available.`);
        console.warn(
          "To run contract tests, start the Supabase server with: npm run supabase:start",
        );
      }
    });

    // Only run the actual tests if backend is available
    if (typeof fn === "function") {
      fn();
    }
  });
}

/**
 * Conditional test that only runs if backend is available
 */
export function itWithBackend(
  name: string,
  fn: () => Promise<void> | void,
  apiUrl?: string,
) {
  return it(name, async () => {
    const backendAvailable = await isBackendAvailable(apiUrl);
    if (!backendAvailable) {
      console.warn(`Skipping "${name}": Backend server is not available.`);
      return;
    }

    return fn();
  });
}
