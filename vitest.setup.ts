// Vitest setup file for environment variables
import dotenv from "dotenv";
import { resolve } from "path";

// Load test environment variables from .env.test
dotenv.config({ path: resolve(process.cwd(), ".env.test") });

// Ensure NODE_ENV is set to test
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = "test";
}

// Global setup for all test files
export {};
