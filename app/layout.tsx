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
    'milliyjamoasi',
    'milliy jamoasi',
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
   * Bitta ko'rinish — to'q. Landing to'q zumrad fonda yashaydi, oltin urg'u
   * aynan shunda kuchli chiqadi. Mobil brauzer chrome'i ham shu rangga
   * bo'yaladi, aks holda sahifa tepasida oq chiziq qolardi.
   */
  themeColor: '#04110b',
  colorScheme: 'dark',
};

/**
 * Meta Pixel ID'lari — vergul bilan bir nechtasi berilishi mumkin
 * (har reklama akkauntiga o'z pixeli). Barcha pixellar bir xil eventlarni
 * oladi: PageView shu yerda, Lead — lib/track.ts dagi CTA delegation'ida.
 *
 * NEXT_PUBLIC_* build paytida kodga muhrlanadi: ID qo'shilsa/o'zgarsa
 * `npm run build` qayta ishlatilishi shart. ID berilmasa skript umuman
 * chiqmaydi — lokal ish Meta'ga hech narsa yubormaydi.
 */
const PIXEL_IDS = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => /^\d{5,20}$/.test(s));

/** Bazaviy fbq kodi bir marta, init esa har ID uchun — rasmiy multi-pixel usul */
const PIXEL_SNIPPET =
  PIXEL_IDS.length > 0
    ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
      PIXEL_IDS.map((id) => `fbq('init','${id}');`).join('') +
      `fbq('track','PageView');`
    : '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={fontVars}>
      <head>
        {/* Botga o'tish tezroq bo'lsin — TLS/DNS oldindan ochiladi */}
        <link rel="preconnect" href="https://t.me" crossOrigin="" />
        <link rel="dns-prefetch" href="https://t.me" />
        {/* Fondagi Turnstile tekshiruvi tezroq boshlansin */}
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="" />
        {PIXEL_SNIPPET && (
          <>
            {/* Pixel skripti ham shu hostdan keladi — ulanishni oldindan ochamiz */}
            <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
            <script dangerouslySetInnerHTML={{ __html: PIXEL_SNIPPET }} />
          </>
        )}
      </head>
      <body>
        {children}
        {PIXEL_IDS.length > 0 && (
          <noscript>
            {/* JS o'chirilgan brauzer uchun zaxira — hech bo'lmasa PageView yetib borsin */}
            {PIXEL_IDS.map((id) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={id}
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
                alt=""
              />
            ))}
          </noscript>
        )}
      </body>
    </html>
  );
}
