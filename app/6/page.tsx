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
 * `/6` — «Poster» kadr: tayyor reklama krealtivi fon sifatida.
 *
 * Fon — assets/poster-jar.png (tanga solingan banka, «Open Budjet
 * boshlandi» yozuvi, Milliy brendi) dan siqilgan public/poster-6.webp.
 * Sarlavha, logo va brend rasmda tayyor turibdi, shuning uchun sahifada
 * faqat ikki narsa bor: narx stikeri va «Botga o'tish» tugmasi.
 *
 * Narx ATAYIN qo'lda yozilgan (admin sozlamasidan EMAS) — buyurtma shunday:
 * rasm ustida qat'iy «30 000 so'm» tursin. Admin narxni o'zgartirsa bu kadr
 * o'zgarmaydi; kerak bo'lsa shu yerda qo'lda yangilanadi.
 *
 * Reklama kampaniyalarida muqobil kadr — `/2`–`/5` kabi index'lanmaydi.
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
  // Poster fonining tepa rangi — brauzer chrome shu rangga qo'shilib ketadi
  themeColor: '#e7e6e6',
  colorScheme: 'light',
};

/** Rasm ustidagi qo'lda yozilgan narx (yuqoridagi izohga qarang) */
const PRICE = '30 000';

export default async function PosterPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');

  return (
    <div className={c.screen}>
      {/* Global body foni oq — bu kadr kulrang, overscroll mos tursin */}
      <style>{'body{background:#e7e6e6}'}</style>

      {/* Fon rasmi — LCP, shuning uchun fetchPriority. Matni dekorativ:
          mazmun quyidagi ko'rinmas sarlavhada takrorlanadi. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/poster-6.webp"
        alt=""
        width={941}
        height={1672}
        fetchPriority="high"
        decoding="async"
        className={c.bg}
      />

      <h1 className={c.srOnly}>
        Open Budjet boshlandi — har bir ovoz {PRICE} so‘m. {SITE.brand} botida qatnashing.
      </h1>

      <div className={c.wrap}>
        <div className={c.cta}>
          <div className={c.sticker}>
            <p className={`${c.sNum} tnum`}>{PRICE} so‘m</p>
            <p className={c.sLab}>har bir ovoz uchun</p>
          </div>

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
