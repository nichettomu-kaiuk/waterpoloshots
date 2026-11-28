/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
    // AVIF/WebP instead of the original JPEG/PNG.
    formats: ['image/avif', 'image/webp'],
    // Uploaded files get a unique name (timestamp), so an optimized copy
    // never goes stale: keep it for a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Fewer sizes = fewer variants to generate and a better cache hit rate.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
