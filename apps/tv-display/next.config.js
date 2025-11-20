/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for React 19
  experimental: {
    ppr: false,
    reactCompiler: true,
  },
  
  // Image optimization for TV displays
  images: {
    domains: [
      'img.youtube.com', // YouTube thumbnails
      'i.ytimg.com',     // Alternative YouTube thumbnails
      'yt3.ggpht.com',   // YouTube channel images
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Optimize for TV display performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Environment variables validation
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DISPLAY_NAME: process.env.NEXT_PUBLIC_DISPLAY_NAME,
    NEXT_PUBLIC_MASJID_ID: process.env.NEXT_PUBLIC_MASJID_ID,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },

  // Headers for TV display optimization
  async headers() {
    return [
      {
        // Preview routes: Allow embedding in iframes for preview functionality
        source: '/preview/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://*.emasjid.my", // Allow hub app domains
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate', // Don't cache previews
          },
        ],
      },
      {
        // API routes for preview: Allow cross-origin requests
        source: '/api/preview/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow from any origin (preview is token-protected)
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        // All other routes: Protect with SAMEORIGIN
        source: '/((?!preview).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=30',
          },
        ],
      },
      {
        source: '/display/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Transpile workspace packages
  transpilePackages: [
    '@masjid-suite/auth',
    '@masjid-suite/shared-types',
    '@masjid-suite/supabase-client', 
    '@masjid-suite/ui-components',
    '@masjid-suite/ui-theme',
  ],

  // Output standalone for potential Docker deployment
  output: 'standalone',

  // Webpack configuration for TV display optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations for TV displays
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;