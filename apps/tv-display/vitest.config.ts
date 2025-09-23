import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  // Ensure tests also load env files from the monorepo root
  envDir: resolve(__dirname, "../../"),
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [
      "../../legacy/**/*.test.{ts,tsx}",
      "tests/**/*" // Exclude all tests directory - it contains Playwright tests
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        ".next/",
        "dist/",
        "coverage/",
        "playwright-report/",
        "test-results/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@masjid-suite/auth": resolve(__dirname, "../../packages/auth/src"),
      "@masjid-suite/supabase-client": resolve(
        __dirname,
        "../../packages/supabase-client/src"
      ),
      "@masjid-suite/shared-types": resolve(
        __dirname,
        "../../packages/shared-types/src"
      ),
      "@masjid-suite/ui-components": resolve(
        __dirname,
        "../../packages/ui-components/src"
      ),
      "@masjid-suite/ui-theme": resolve(
        __dirname,
        "../../packages/ui-theme/src"
      ),
    },
  },
});