import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVars } from './fonts';
import { SITE } from '@/lib/content';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.brand}`,
  },
  description: SITE.description,
  applicationName: SITE.brand,
  keywords: [
    'milliyjamoasimiz',
    'milliy jamoamiz',
    'ovoz narxi',
    'tashabbusli budjet',
    'openbudget ovoz bot',
    'ovoz sotib olish',
    'openbudget uz ovoz',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: '/',
    siteName: SITE.brand,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /**
   * Bitta ko'rinish — tizim rejimiga qarab o'zgarmaydi.
   *
   * Sababi rang tanlovida: brendning yorqin turkuazi (#22C6E8) oq fonda
   * 2.1:1 kontrast beradi, ya'ni matn sifatida yaroqsiz. To'q fonda esa
   * 8.1:1. Yorug' variant qilinsa, brend rangini urg'u sifatida ishlatib
   * bo'lmasdi — shuning uchun sahna doim to'q.
   */
  themeColor: '#04222a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={fontVars}>
      <head>
        {/* Botga o'tish tezroq bo'lsin — TLS/DNS oldindan ochiladi */}
        <link rel="preconnect" href="https://t.me" crossOrigin="" />
        <link rel="dns-prefetch" href="https://t.me" />
        {/* Darvoza captchasi birinchi paintdayoq yuklana boshlasin */}
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
