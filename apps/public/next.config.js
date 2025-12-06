/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Set workspace root to avoid lockfile warnings
  outputFileTracingRoot: process.cwd().replace('/apps/public', ''),
  
  // ISR revalidation - 1 hour default
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 3600,
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/**',
      },
    ],
    domains: ['127.0.0.1', 'localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 75, 80, 85, 90, 100],
    minimumCacheTTL: 86400, // 24 hours cache
  },

  // Compression
  compress: true,
  
  // Optimize bundle
  poweredByHeader: false,

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_HUB_URL: process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3000',
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/tambah-iklan',
        destination: `${process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3000'}/register`,
        permanent: false,
      },
    ];
  },

  // Headers for SEO, security, and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
