import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load env files from the app directory for app-specific configuration
  envDir: resolve(__dirname, "./"),

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    // Proxy API calls to Supabase local instance
    proxy: {
      "/api": {
        target: "http://localhost:54321",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // Preview server configuration
  preview: {
    port: 3000,
    host: true,
    open: true,
  },

  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: true,
    // Optimize chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          router: ["react-router-dom"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    // Increase chunk size warning limit for MUI
    chunkSizeWarningLimit: 1000,
  },

  // Module resolution
  resolve: {
    alias: {
      // Path aliases for cleaner imports
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/pages": resolve(__dirname, "./src/pages"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/types": resolve(__dirname, "./src/types"),

      // Workspace package aliases
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
    // Ensure single copies across the monorepo during dev
    dedupe: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/system",
    ],
  },

  // Environment variables
  // Only expose VITE_ to client to avoid leaking server-only secrets
  envPrefix: ["VITE_"],

  // Define global constants
  define: {
    // Ensure process.env is available for Node.js compatibility
    "process.env": process.env,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
      "date-fns",
    ],
    // Pre-bundle workspace packages
    exclude: [
      "@masjid-suite/auth",
      "@masjid-suite/supabase-client",
      "@masjid-suite/shared-types",
      "@masjid-suite/ui-components",
      "@masjid-suite/ui-theme",
    ],
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      // CSS Modules configuration for component-specific styles
      localsConvention: "camelCase",
    },
  },
});
