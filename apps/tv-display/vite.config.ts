import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    host: '0.0.0.0',
    port: 3001,
    proxy: {
      '/functions': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
      },
      '^/api/zones$': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
        rewrite: () => '/functions/v1/zones-index',
      },
      '^/api/zones/[^/]+$': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
        rewrite: (path) => {
          const zoneCode = path.split('/').pop();
          return `/functions/v1/zones-by-code?zone_code=${zoneCode}`;
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@masjid-suite/auth': resolve(__dirname, '../../packages/auth/src'),
      '@masjid-suite/supabase-client': resolve(__dirname, '../../packages/supabase-client/src/index.ts'),
      '@masjid-suite/shared-types': resolve(__dirname, '../../packages/shared-types/src'),
      '@masjid-suite/ui-components': resolve(__dirname, '../../packages/ui-components/src'),
      '@masjid-suite/ui-theme': resolve(__dirname, '../../packages/ui-theme/src'),
    },
  },
});