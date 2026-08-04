import type { Metadata } from 'next';

import Header from '@/components/Header';
import Intro from '@/components/Intro';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Prices from '@/components/Prices';
import Steps from '@/components/Steps';
import Advantages from '@/components/Advantages';
import TrustStrip from '@/components/TrustStrip';
import Faq from '@/components/Faq';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';
import StickyCta from '@/components/StickyCta';
import Tracker from '@/components/Tracker';

import { getPrices, getSettings } from '@/lib/data';
import { FAQ, SITE, kindOf, uzs } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

/**
 * SSG landing — kirish darvozasidan (`/`) keyingi sahifa.
 *
 * Bu funksiya build va revalidate paytida ishlaydi, foydalanuvchi so'rovida —
 * YO'Q. Shu sabab bu yerda `cookies()`, `headers()`, `searchParams`
 * ISHLATILMASLIGI kerak: aks holda sahifa dinamikaga o'tadi va cho'qqida
 * har so'rov render'ga tushardi.
 *
 * Kirish nazorati `middleware.ts` da: `gt` cookie'siz so'rov `/` ga qaytariladi.
 * Shu sabab HTML CDN'da cache'lanmaydi (`next.config.js` → `private, no-store`),
 * lekin Node baribir tayyor HTML'ni diskdan beradi — render qaytadan bo'lmaydi.
 *
 * Tekshirish: `npm run build` chiqishida `/l` yonida `○ (Static)` bo'lishi shart.
 */
export const revalidate = 3600; // zaxira: soatiga bir marta
export const dynamic = 'force-static';

/** Darvoza ortidagi sahifa — qidiruvda ko'rinmaydi (`/` indekslanadi) */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
};

export default async function Landing() {
  const [prices, s] = await Promise.all([getPrices(), getSettings()]);
  const bot = s.bot_username || env.BOT;
  const tg = tgLink(bot, 'web');

  const cheapestOvoz = prices
    .filter((p) => kindOf(p.sku) === 'ovoz')
    .reduce<number | null>((min, p) => (min === null || p.priceUzs < min ? p.priceUzs : min), null);

  const cheapestAny = prices.reduce<number | null>(
    (min, p) => (min === null || p.priceUzs < min ? p.priceUzs : min),
    null,
  );
  const lowPrice = cheapestOvoz ?? cheapestAny;

  return (
    <>
      {/* Skip link faqat shu sahifada — `#prices` darvoza sahifasida yo'q */}
      <a href="#prices" className="skip">
        Narxlarga o’tish
      </a>

      <Header tg={tg} />

      <main>
        <Intro tg={tg} />
        <Hero s={s} tg={tg} />
        <Marquee />
        <TrustStrip reviews={s.reviews_count} />
        <Prices prices={prices} bot={bot} />
        <Steps />
        <Advantages />
        <Faq />
        <FinalCta tg={tg} />
      </main>

      <Footer s={s} />
      <StickyCta tg={tg} label={s.cta_primary} />

      <Tracker />

      {/* Strukturali ma'lumot — organik trafik uchun, statik HTML ichida */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE.brand,
              url: env.SITE_URL,
              description: SITE.description,
              sameAs: [`https://t.me/${s.tg_channel}`],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'Tashabbusli budjet ovoz paketlari',
              description: SITE.description,
              brand: { '@type': 'Brand', name: SITE.brand },
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'UZS',
                lowPrice: lowPrice ?? undefined,
                offerCount: prices.length,
                availability: 'https://schema.org/InStock',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQ.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ]),
        }}
      />
      <span className="sr">
        Eng arzon ovoz paketi: {lowPrice ? `${uzs(lowPrice)} so’m` : '—'}
      </span>
    </>
  );
}
