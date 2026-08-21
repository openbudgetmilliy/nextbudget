import { Space_Grotesk } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import Timer from '@/components/Timer';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import { Telegram } from '@/components/Icons';

import { getSettings, pageCta, pagePixels } from '@/lib/data';
import { SITE } from '@/lib/content';
import { botUsername } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
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
 * Narx — qolgan kadrlar bilan bitta manbadan: `price_one_vote` sozlamasi
 * (`/admin/settings`). Ilgari bu yerda narx qo'lda, kodda yozilgan edi va
 * admin uni o'zgartirganda yettita kadrdan beshtasi yangilanib, ikkitasi
 * eski narx bilan qolib ketardi — reklamada eng qimmat xato shu.
 *
 * Reklama kampaniyalarida muqobil kadr — `/2`–`/5` kabi index'lanmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Shu kadrning ro'yxatdagi o'rni — `?start=` va reklama havolasi shundan */
const PAGE = pageAt('/6');

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

/** Narx stikeri shrifti — Inter'dan ajralib tursin. FAQAT shu marshrutda
    yuklanadi (next/font sahifa faylida, /3–/4 dagi usul). */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--f-sg',
  display: 'swap',
});

export default async function PosterPage() {
  const s = await getSettings();
  // Tugma manzili: kadrga xos havola bo'lsa (`link_p…`, /admin/settings)
  // o'sha, bo'lmasa umumiy bot sozlamasi. `stamp` — UTM yopishtiriladimi:
  // qat'iy `?start=` yoki telegramdan boshqa havolada tegilmaydi (`data-tg`
  // bo'lmasa `lib/track.ts` stamping'i o'tib ketadi).
  const { href: tg, stamp: tgStamp } = pageCta(s, PAGE.slug);
  const bot = botUsername(s.bot_username || env.BOT);

  return (
    <div className={`${display.variable} ${c.screen}`}>
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
        Open Budjet boshlandi — har bir ovoz {s.price_one_vote} so‘m. {SITE.brand} botida qatnashing.
      </h1>

      {/* Narx — brend yozuvi («OPEN BUDJET BOSHLANDI», 23%da tugaydi) bilan
          banka (34%da boshlanadi) orasidagi bo'sh kulrang yo'lakda. Fon
          telefonlarda doim balandlik bo'yicha o'lchanadi, shuning uchun
          foiz rasmning aynan shu joyiga tushadi (/7 dagi usul). */}
      <div className={c.price}>
        <div className={c.sticker}>
          <span className={`${c.sNum} tnum`}>{s.price_one_vote} so‘m</span>
          <span className={c.sLab}>har bir ovoz uchun</span>
        </div>
      </div>

      <div className={c.wrap}>
        <div className={c.cta}>
          <div className={c.ctaDock}>
            <Timer
              classes={{
                box: c.tm,
                caption: c.tmCap,
                grid: c.tmGrid,
                cell: c.tmCell,
                num: `${c.tmNum} tnum`,
                lab: c.tmLab,
                over: c.tmOver,
              }}
            />

            <a
              href={tg}
              className={c.btn}
              data-t="cta"
              data-t-id="bot"
              data-tg={tgStamp ? '' : undefined}
              rel="noopener"
            >
              <Telegram size={19} />
              Botga o‘tish
            </a>
          </div>
        </div>
      </div>

      <Tracker />
      <MetaPixel ids={pagePixels(s, PAGE.slug)} />

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
