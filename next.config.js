/** @type {import('next').NextConfig} */
const nextConfig = {
  // PM2 + nginx uchun: node_modules'siz ishlaydigan bundle
  output: 'standalone',

  // Siqishni nginx (gzip) va Cloudflare (brotli) qiladi — Node CPU'ni band qilmaymiz
  compress: false,

  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // PM2 cluster'da 2 instance ishlaydi. In-memory ISR keshi yoqilgan bo'lsa
  // `revalidatePath('/')` faqat so'rovni bajargan instance'ga ta'sir qilardi va
  // ikkinchisi eski narxni ko'rsatib turardi. 0 — kesh faqat diskda,
  // ikki instance ham bir manbadan o'qiydi. Trafikning 97% CF edge'dan
  // kelgani uchun disk o'qish sezilmaydi (OS page cache).
  cacheMaxMemorySize: 0,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    // recharts faqat admin bundle'ida bo'lsin, landing'ga tushmasin
    optimizePackageImports: ['recharts'],
  },

  // Build vaqtida lint/type xatosi deploy'ni to'xtatmasin (CI'da alohida tekshiriladi)
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    const publicCache = {
      key: 'Cache-Control',
      value: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
    };

    return [
      // ── Statik sahifalar (darvoza `/` shu yerda: hammaga bir xil) ──
      { source: '/', headers: [publicCache] },
      { source: '/:path((?!api/|admin/|l$|l/|_next/).*)', headers: [publicCache] },

      // ── Landing: darvoza ortida ──
      // CDN'da cache'lansa `gt` cookie'siz ham berilib ketardi — shuning uchun
      // no-store. Sahifa baribir prerender qilingan, Node uni diskdan beradi.
      {
        source: '/l',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },

      // ── Immutable build assetlari ──
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },

      // ── Hech qachon cache'lanmasin ──
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },

      // ── Xavfsizlik (barcha yo'llar) ──
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
