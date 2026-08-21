import type { Metadata, Viewport } from 'next';

import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Logo from '@/components/Logo';

import { getSettings, pagePixels } from '@/lib/data';
import { SITE } from '@/lib/content';
import { botUsername, fixedStart, tgLink } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
import { env, GATE_ON } from '@/lib/env';

import Countdown from './Countdown';
import c from './page.module.css';

/**
 * `/8` — «Taymer» kadri: yorug' ko'k-firuza, muddat taymeri bilan.
 *
 * Uslub manbasi — foydalanuvchi ko'rsatgan namuna (openbudget.lol/enter,
 * «variant 4»): oq-havorang fon, xiralashgan ko'k-firuza dog'lar, qora
 * qalin sarlavhaning gradient bo'lagi, katta gradient CTA va muddat
 * taymeri kartochkasi. Rasm-kod ko'chirilmagan — faqat dizayn tili;
 * matn odatdagidek admin sozlamalaridan, tugma bot havolasiga boradi.
 *
 * Boshqa kadrlardan farqi: bu BITTA ekran emas — hero + taymer kartasi,
 * sahifa ozgina skroll bo'ladi (namunadagi tuzilish shunday).
 *
 * Taymer sanasi `Countdown.tsx` da QO'LDA yozilgan — kampaniya oynasi
 * tugaganda o'sha yerda yangilanadi.
 *
 * MATNLAR HAM QO'LDA — buyurtma shunday: bu kadr namunaning kampaniya
 * matnini so'zma-so'z takrorlaydi (100 000 so'mgacha, iPhone 17 Pro Max,
 * 30-avgust muddati). Admin sozlamalari bu kadr matniga ta'sir qilmaydi;
 * faqat bot havolasi odatdagidek sozlamadan olinadi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

const PAGE = pageAt('/8');

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8fafc',
  colorScheme: 'light',
};

export default async function TaymerPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, PAGE.slug);
  // Sozlamada qat'iy `?start=` bo'lsa UTM qo'shimchasi yopishmasin —
  // kod botga toza yetib borishi kerak (`data-tg` bo'lmasa stamping tegmaydi)
  const tgStamp = fixedStart(s.bot_username || env.BOT) === null;
  // botUsername(): admin to'liq havola yozsa ham JSON-LD'ga toza username tushsin
  const bot = botUsername(s.bot_username || env.BOT);
  const channel = (s.tg_channel || '').replace(/^@/, '');

  return (
    <div className={c.page}>
      <style>{'body{background:#f8fafc}'}</style>

      {/* ── Hero ── */}
      <section className={c.hero}>
        <div className={`${c.blob} ${c.blobA}`} aria-hidden />
        <div className={`${c.blob} ${c.blobB}`} aria-hidden />

        <div className={c.heroIn}>
          <div className={c.brand}>
            <Logo size={30} className="" />
            {SITE.brand}
          </div>

          <p className={c.pill}>
            <span className={c.dot} aria-hidden />
            21–30-avgust, 23:59 gacha · Ishonchli
          </p>

          {/* Gradient faqat summa bo'lagida — namunadagidek */}
          <h1 className={c.title}>
            Ovoz bering va <b className={c.grad}>100 000 so‘mgacha</b> pul oling
          </h1>

          <p className={c.sub}>
            Open Budgetga ovoz berib 100 000 so‘mgacha pul oling. Undan tashqari iPhone 17 Pro
            Max g‘olibiga ham aylanishingiz mumkin.
          </p>

          <a
            href={tg}
            className={c.btn}
            data-t="cta"
            data-t-id="ovoz"
            data-tg={tgStamp ? '' : undefined}
            rel="noopener"
          >
            Ovoz berish
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m13 7 5 5m0 0-5 5m5-5H6" />
            </svg>
          </a>
          <p className={c.note}>Ishtirok butunlay bepul · Ovoz berish 30 soniya</p>
        </div>
      </section>

      {/* ── Taymer kartasi ── */}
      <section className={c.cdSec}>
        <div className={c.card}>
          <h2 className={c.h2}>Ovozingizni hoziroq bering</h2>
          <p className={c.cdHint}>Ovoz berish tugashiga qolgan vaqt:</p>

          <Countdown />

          <a
            href={tg}
            className={c.btn}
            data-t="cta"
            data-t-id="yakun"
            data-tg={tgStamp ? '' : undefined}
            rel="noopener"
          >
            Ovoz berish
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m13 7 5 5m0 0-5 5m5-5H6" />
            </svg>
          </a>

          <p className={c.note}>100% bepul · Muddat 30-avgust, 23:59 da tugaydi</p>
        </div>
      </section>

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
