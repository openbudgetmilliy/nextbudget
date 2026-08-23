import type { Metadata, Viewport } from 'next';

import Logo from '@/components/Logo';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Countdown from '@/components/landing/Countdown';

import { CAMPAIGN, campaignLeft, deadlineLabel, isOpen } from '@/lib/campaign';
import { SITE } from '@/lib/content';
import { getSettings, pageCta, pagePixels } from '@/lib/data';
import { env, GATE_ON } from '@/lib/env';
import { pageAt } from '@/lib/pages';
import { botUsername } from '@/lib/tg';

import c from './page.module.css';

/**
 * `/8` — «Neon» kadri.
 *
 * milliyjamosimiz.uz loyihasidagi `/8` dan ko'chirilgan. Yondashuv: BITTA
 * GAP, IKKI EKRAN. Bo'lim yo'q, menyu yo'q — sarlavha, tugma va bitta
 * karta. Sovuq trafik uchun qisqa kadr: o'qish kam bo'lsa, tugmagacha
 * yo'l ham qisqa.
 *
 * Bu kadr ilgari «Taymer» (yorug' ko'k-firuza) edi. O'sha dizayn YO'QOLMADI
 * — u `/10` da turibdi va o'z pixeli bilan alohida o'lchanadi.
 *
 * MATN AKSIYAGA BOG'LANGAN, narx sozlamasiga emas. Qolgan kadrlar bitta
 * ovoz narxini ko'rsatadi; bu sahifa esa aksiyaning yuqori chegarasini va
 * sovrinni aytadi — ikkalasi boshqa gap, shuning uchun matn
 * `lib/campaign.ts` da.
 *
 * Muddat o'tsa taymer o'rniga ko'rsatkichlar chiqadi: nol turgan taymer
 * «aksiya tugagan» degan xabar bo'lardi va reklama trafigini bekorga
 * yoqib yuborardi.
 *
 * Sahifa statik (SSG); client kod — Tracker, taymer va Turnstile.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

const PAGE = pageAt('/8');

/**
 * Muddat o'tganda ko'rsatiladigan raqamlar.
 *
 * Uchtasi qat'iy (loyiha bo'yicha umumiy hisobot), to'rtinchisi admin
 * sozlamasidan — shu sabab u yerda o'zgartirilsa sahifada ham o'zgaradi.
 */
const liveStats = (reviews: string) => [
  { num: '12 500+', lab: 'Ovoz berildi' },
  { num: '437 mln+', lab: 'So‘m to‘landi' },
  { num: reviews, lab: 'Qatnashuvchi' },
  { num: '97%', lab: 'To‘lovni oldi' },
];

/** A/B kadri — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: `Ovoz bering va ${CAMPAIGN.ceiling} pul oling`,
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05060c',
  colorScheme: 'dark',
};

/** Tugmadagi strelka — matn rangini `currentColor` orqali oladi */
function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={c.arrow}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function NeonPage() {
  const s = await getSettings();
  // Tugma manzili: kadrga xos havola bo'lsa (`link_p8`) o'sha, bo'lmasa
  // umumiy bot sozlamasi. `stamp` — UTM yopishtiriladimi
  const { href: tg, stamp: tgStamp } = pageCta(s, PAGE.slug);
  // botUsername(): admin to'liq havola yozsa ham toza username chiqsin
  const bot = botUsername(s.bot_username || env.BOT);
  const channel = (s.tg_channel || '').replace(/^@/, '');

  // Serverdagi boshlang'ich qiymat — client birinchi renderda AYNAN shuni
  // chizadi, ya'ni gidratatsiya mos keladi
  const left = campaignLeft();
  const open = isOpen();

  const cta = (
    <a
      href={tg}
      className={c.cta}
      data-t="cta"
      data-t-id="ovoz"
      data-tg={tgStamp ? '' : undefined}
      rel="noopener"
    >
      Ovoz berish
      <Arrow />
    </a>
  );

  return (
    <div className={c.page}>
      {/* Global body foni oq — bu kadr to'q, overscroll mos tursin */}
      <style>{'body{background:#05060c}'}</style>

      {/* Fon: tepada ko'k-moviy, karta atrofida siyoh-binafsha yog'du.
          Alohida qatlam — matn ustiga tushmasin. */}
      <div className={c.sky} aria-hidden />

      <main className={c.wrap}>
        <header className={c.head}>
          <div className={c.brandRow}>
            <span className={c.mark}>
              <Logo size={28} className={c.markImg} />
            </span>
            <span className={c.brand}>{SITE.brand}</span>
          </div>

          <h1 className={c.title}>
            Ovoz bering va <span className={c.grad}>{CAMPAIGN.ceiling}</span> pul oling
          </h1>

          <p className={c.sub}>
            Open Budgetga ovoz berib {CAMPAIGN.ceiling} pul oling. Undan tashqari {CAMPAIGN.prize}{' '}
            g‘olibiga ham aylanishingiz mumkin.
          </p>
        </header>

        {open ? (
          <section className={c.card} aria-label="Ovoz berish muddati">
            <h2 className={c.h2}>Ovozingizni hoziroq bering</h2>

            <Countdown
              initial={left}
              lead=""
              classes={{
                grid: `${c.tiles} ${c.tiles4}`,
                cell: c.tile,
                num: `${c.tileNum} ${c.grad} ${c.tnum}`,
                lab: c.tileLab,
              }}
            />

            {cta}

            <p className={c.micro}>100% bepul · Muddat {deadlineLabel()} da tugaydi.</p>
          </section>
        ) : (
          <section className={c.card} aria-label="Ko‘rsatkichlar">
            <h2 className={c.h2}>Hozirgacha qanday ketyapti</h2>
            <p className={c.cardSub}>Loyiha bo‘yicha joriy ko‘rsatkichlar:</p>

            <ul className={c.tiles}>
              {liveStats(s.reviews_count).map((it) => (
                <li key={it.lab} className={c.tile}>
                  <span className={`${c.tileNum} ${c.grad}`}>{it.num}</span>
                  <span className={c.tileLab}>{it.lab}</span>
                </li>
              ))}
            </ul>

            {cta}

            <p className={c.micro}>Komissiyasiz · Uzcard va Humo{bot ? ` · @${bot}` : ''}</p>
          </section>
        )}
      </main>

      <Tracker />
      <MetaPixel ids={pagePixels(s, PAGE.slug)} />
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
            sameAs: [bot, channel].filter(Boolean).map((u) => `https://t.me/${u}`),
            // `<` qochiriladi: qiymatlar admin formasidan keladi
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
