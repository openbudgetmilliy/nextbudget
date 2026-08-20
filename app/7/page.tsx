import { Space_Grotesk } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env, GATE_ON } from '@/lib/env';

import c from './page.module.css';

/**
 * `/7` — «Telegram» kadr: qora-yashil kreativ fon sifatida.
 *
 * Fon — assets/poster-tg.png (bot profili ochilgan telefon, «Open budjet
 * boshlandi» yozuvi, so'm banknotalari) dan siqilgan public/poster-7.webp.
 * Skelet `/6` bilan bir xil: sarlavha, logo va brend rasmda tayyor turibdi,
 * shuning uchun sahifada faqat narx stikeri va «Botga o'tish» tugmasi bor.
 * Farqi — kadr qorong'i, shuning uchun stiker shisha-qora, tugma yashil.
 *
 * Narx ATAYIN qo'lda yozilgan (admin sozlamasidan EMAS) — buyurtma shunday:
 * rasm ustida qat'iy «30 000 so'm» tursin. Admin narxni o'zgartirsa bu kadr
 * o'zgarmaydi; kerak bo'lsa shu yerda qo'lda yangilanadi.
 *
 * Reklama kampaniyalarida muqobil kadr — `/2`–`/6` kabi index'lanmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Poster foni qop-qora — brauzer chrome shu rangga qo'shilib ketadi
  themeColor: '#000000',
  colorScheme: 'dark',
};

/** Narx stikeri shrifti — Inter'dan ajralib tursin. FAQAT shu marshrutda
    yuklanadi (next/font sahifa faylida, /3–/4 dagi usul). */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--f-sg',
  display: 'swap',
});

/** Rasm ustidagi qo'lda yozilgan narx (yuqoridagi izohga qarang) */
const PRICE = '30 000';

export default async function TelegramPosterPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');

  return (
    <div className={`${display.variable} ${c.screen}`}>
      {/* Global body foni oq — bu kadr qora, overscroll mos tursin */}
      <style>{'body{background:#000}'}</style>

      {/* Fon rasmi — LCP, shuning uchun fetchPriority. Matni dekorativ:
          mazmun quyidagi ko'rinmas sarlavhada takrorlanadi. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/poster-7.webp"
        alt=""
        width={933}
        height={1686}
        fetchPriority="high"
        decoding="async"
        className={c.bg}
      />

      <h1 className={c.srOnly}>
        Open Budjet boshlandi — har bir ovoz {PRICE} so‘m. {SITE.brand} botida qatnashing.
      </h1>

      {/* Narx — rasmdagi bo'sh qora yo'lakda (balandlikning ~65%ida).
          Fon har doim balandlik bo'yicha o'lchanadi, shuning uchun foiz
          rasmning aynan shu joyiga tushadi — izoh CSS'da. */}
      <div className={c.price}>
        <div className={c.sticker}>
          <p className={`${c.sNum} tnum`}>{PRICE} so‘m</p>
          <p className={c.sLab}>har bir ovoz uchun</p>
        </div>
      </div>

      <div className={c.wrap}>
        <div className={c.cta}>
          <a
            href={tg}
            className={c.btn}
            data-t="cta"
            data-t-id="bot"
            data-tg
            rel="noopener"
          >
            <Telegram size={19} />
            Botga o‘tish
          </a>
        </div>
      </div>

      <Tracker />

      {/* Fonda ishlaydigan Turnstile — sahifani to'smaydi, odatda ko'rinmaydi */}
      <TurnstileGuard siteKey={GATE_ON ? env.TURNSTILE_SITE_KEY : ''} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE.brand,
            url: env.SITE_URL,
            description: SITE.description,
            sameAs: [bot, (s.tg_channel || '').replace(/^@/, '')]
              .filter(Boolean)
              .map((u) => `https://t.me/${u}`),
            // `<` qochiriladi: qiymatlar admin formasidan keladi
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
