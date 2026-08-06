import type { Metadata } from 'next';

import Header from '@/components/Header';
import Poster from '@/components/Poster';
import Tracker from '@/components/Tracker';
import { Telegram } from '@/components/Icons';

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
 *
 * Sahifa darvoza bilan BIR XIL plakatdan iborat — farqi faqat harakat uyasida:
 * u yerda tekshiruv chizig'i, bu yerda botga o'tish tugmasi.
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
        <Poster
          s={s}
          action={
            <div className="act">
              <a href={tg} className="btn" data-t="cta" data-t-id="hero_cta" data-tg rel="noopener">
                <Telegram />
                {s.cta_primary}
              </a>
            </div>
          }
        />
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
