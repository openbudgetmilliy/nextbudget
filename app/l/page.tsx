import type { Metadata } from 'next';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Steps from '@/components/Steps';
import Advantages from '@/components/Advantages';
import TrustStrip from '@/components/TrustStrip';
import Faq from '@/components/Faq';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';
import StickyCta from '@/components/StickyCta';
import Tracker from '@/components/Tracker';

import { getSettings } from '@/lib/data';
import { FAQ, SITE } from '@/lib/content';
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
 * Narx bo'limi olib tashlangan: sahifa endi narx ko'rsatmaydi, tanlov botda
 * qilinadi. Shu sabab `getPrices()` ham chaqirilmaydi va Product/AggregateOffer
 * strukturali ma'lumoti yo'q — bo'lmagan narx haqida da'vo qilmaymiz.
 *
 * Tekshirish: `npm run build` chiqishida `/l` yonida `○ (Static)` bo'lishi shart.
 */
/**
 * 60 sekund, 3600 emas.
 *
 * `revalidatePath()` FAQAT o'z Node protsessining keshini bekor qiladi.
 * PM2 cluster'da 2 instance bor (`ecosystem.config.js`), ya'ni admin narxni
 * saqlaganda faqat so'rovni bajargan instance yangilanadi — ikkinchisi eski
 * sahifani `revalidate` muddati tugagunicha berib turadi.
 *
 * 60s bu oynani 1 daqiqagacha qisqartiradi. Narxi: instance'iga daqiqasiga
 * bitta `getSettings()` — bitta yengil SELECT, sezilmaydi.
 *
 * To'liq yechim — Redis'ga asoslangan umumiy `cacheHandler` (next.config.js).
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Darvoza ortidagi sahifa — qidiruvda ko'rinmaydi (`/` indekslanadi) */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
};

export default async function Landing() {
  const s = await getSettings();
  const bot = s.bot_username || env.BOT;
  const tg = tgLink(bot, 'web');

  return (
    <>
      <a href="#how" className="skip">
        Asosiy mazmunga o’tish
      </a>

      <Header tg={tg} />

      <main>
        <Hero s={s} tg={tg} />
        <Marquee />
        <TrustStrip reviews={s.reviews_count} />
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
    </>
  );
}
