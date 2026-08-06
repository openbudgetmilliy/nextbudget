import type { Metadata } from 'next';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Tracker from '@/components/Tracker';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
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
 * Sahifa BITTA bo'limdan iborat: header va sahna. Bosqichlar, afzalliklar,
 * FAQ va takrorlovchi CTA bo'limlari olib tashlangan — ularning har biri
 * botga o'tish yo'lidagi qo'shimcha to'siq edi.
 *
 * Tekshirish: `npm run build` chiqishida `/l` yonida `○ (Static)` bo'lishi shart.
 */
/**
 * 60 sekund, 3600 emas.
 *
 * `revalidatePath()` FAQAT o'z Node protsessining keshini bekor qiladi.
 * PM2 bir nechta instance bilan ishlaganda admin narxni saqlaganda faqat
 * so'rovni bajargan instance yangilanadi — qolganlari eski sahifani
 * `revalidate` muddati tugagunicha berib turadi.
 *
 * 60s bu oynani 1 daqiqagacha qisqartiradi. Narxi: instance'iga daqiqasiga
 * bitta `getSettings()` — bitta yengil SELECT, sezilmaydi.
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
      <Header tg={tg} label="Botga o’tish" />

      <main>
        <Hero s={s} tg={tg} />
      </main>

      <Tracker />

      {/* Strukturali ma'lumot — statik HTML ichida, qo'shimcha so'rovsiz */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE.brand,
            url: env.SITE_URL,
            description: SITE.description,
            sameAs: [`https://t.me/${s.tg_channel}`],
          }),
        }}
      />
    </>
  );
}
