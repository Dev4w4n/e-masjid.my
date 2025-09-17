import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
        "coverage/",
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
