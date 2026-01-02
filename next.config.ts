import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
  experimental: {
  },
};

export default nextConfig;