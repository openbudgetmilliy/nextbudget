/** @type {import('next').NextConfig} */
const nextConfig = {
  // PM2 + nginx uchun: node_modules'siz ishlaydigan bundle
  output: 'standalone',

  // Siqishni nginx (gzip) va Cloudflare (brotli) qiladi — Node CPU'ni band qilmaymiz
  compress: false,

  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // PM2 bir nechta instansiyada ishlaganda in-memory ISR keshi muammo bo'ladi:
  // `revalidatePath('/')` faqat so'rovni bajargan instansiyaga ta'sir qilardi
  // va qolganlari eski narxni ko'rsatib turardi. 0 — kesh faqat diskda, barcha
  // instansiya bir manbadan o'qiydi. Trafikning katta qismi CF edge'dan
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
    /**
     * s-maxage=60 ATAYIN qisqa: CF edge'da HTML keshi yoqilgan (Cache Rule),
     * lekin serverda purge tokeni yo'q — narx/bot/pixel o'zgarishi 60
     * soniyadan oshiq kutmasligi kerak. stale-while-revalidate tufayli CF
     * baribir deyarli hamma so'rovni keshdan beradi (fonda minutiga bir
     * marta yangilab oladi) — origin yuki ~1 so'rov/daq/sahifa/PoP.
     */
    const publicCache = {
      key: 'Cache-Control',
      value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400',
    };

    return [
      // ── Landing (`/`) va qolgan ochiq sahifalar ──
      // Turnstile tekshiruvi endi sahifani to'smaydi, shuning uchun landing
      // hammaga bir xil va Cloudflare edge'da bemalol cache'lanadi.
      { source: '/', headers: [publicCache] },
      { source: '/:path((?!api/|admin/|_next/).*)', headers: [publicCache] },

      // ── Immutable build assetlari ──
      {
        source: '/_next/static/:path*',
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
