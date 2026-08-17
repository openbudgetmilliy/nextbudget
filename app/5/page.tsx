import type { Metadata } from 'next';

import Logo from '@/components/Logo';
import Tracker from '@/components/Tracker';
import VariantSections from '@/components/landing/VariantSections';
import { Telegram, Check } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import c from './page.module.css';

/**
 * Variant 5 — «Candy suyuq».
 *
 * Shirin-pastel talqin: morph qiluvchi suyuq bloblar, rezina «squish»
 * tugmalar, gradient-matn. Maqsad — A/B sinovda «yumshoq va do'stona»
 * yo'nalishini o'lchash: jiddiy plakat o'rniga o'ynoqi muloyimlik.
 *
 * `/l` bilan bir xil qoidalar: SSG, so'rov paytida hech narsa hisoblanmaydi,
 * yagona client kod — Tracker.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasligi shart, aks holda trafik buziladi */
export const metadata: Metadata = {
  // Layout shablon `· brend` qo'shadi — brend bu yerda takrorlanmaydi
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

/** Uchqun — sparkle bezak. Emoji emas: rang va o'lcham CSS'dan boshqariladi */
function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 0c.8 6.5 4.7 10.4 12 12-7.3 1.6-11.2 5.5-12 12-.8-6.5-4.7-10.4-12-12C7.3 10.4 11.2 6.5 12 0z" />
    </svg>
  );
}

/** Marquee bir marta aniqlanadi — ikki nusxada aynan shu ro'yxat aylanadi */
function marqueeItems(reviews: string): string[] {
  return [
    'Humo · Uzcard · Payme',
    'Aniq narx',
    `${reviews} foydalanuvchi`,
    'SMS tasdiqlash',
    'Yashirin komissiya yo‘q',
  ];
}

export default async function VariantCandy() {
  const s = await getSettings();
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const tg = tgLink(bot, 'web');

  const vars = { narx: s.price_one_vote };
  // `|` dan keyingi qism narxni takrorlaydi — narx alohida blob-kartada
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);
  const ticker = marqueeItems(s.reviews_count);

  return (
    <div className={c.page}>
      {/* Fon qatlami: morph bloblar. Alohida div — matn qatlamiga
          animatsiya yuqmasin */}
      <div className={c.goo} aria-hidden>
        <span className={`${c.blob} ${c.blobPink}`} />
        <span className={`${c.blob} ${c.blobBlue}`} />
        <span className={`${c.blob} ${c.blobMint}`} />
      </div>

      {/* ── Header: oq shisha, pill CTA ── */}
      <header className={c.hdr}>
        <div className={c.hdrIn}>
          <span className={c.brand}>
            <Logo size={30} className={c.logoImg} />
            {SITE.brand}
          </span>
          <a href={tg} className={c.btnSm} data-t="cta" data-t-id="v5_header" data-tg rel="noopener">
            <Telegram size={15} />
            Botga o‘tish
          </a>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className={c.hero}>
          <div className={c.heroIn}>
            <p className={c.badge}>{s.hero_badge}</p>

            <h1 className={c.title}>
              {lines.map((line, i) => (
                // Oxirgi qator candy gradientda — shirinlikning markazi
                <span key={line} className={i === lines.length - 1 ? c.titleHl : undefined}>
                  {line}
                </span>
              ))}
              <Spark className={`${c.spark} ${c.spark1}`} />
              <Spark className={`${c.spark} ${c.spark2}`} />
            </h1>

            <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

            {/* Narx — oq super-ellips karta, orqasida morph halo */}
            <div className={c.priceWrap}>
              <span className={c.priceHalo} aria-hidden />
              <div className={c.priceCard}>
                <p className={c.priceLab}>1 ovoz narxi</p>
                <p className={c.priceFig}>
                  <span className={`${c.priceNum} tnum`}>{s.price_one_vote}</span>
                </p>
                <p className={c.priceCur}>so‘m</p>
              </div>
            </div>

            <div className={c.heroAct}>
              <a href={tg} className={c.cta} data-t="cta" data-t-id="v5_hero" data-tg rel="noopener">
                <Telegram size={20} className={c.ctaIco} />
                {s.cta_primary}
              </a>
            </div>

            <ul className={c.trust}>
              <li className={c.chipBlue}>
                <Check size={14} /> Aniq narx
              </li>
              <li className={c.chipPink}>
                <Check size={14} /> Humo · Uzcard · Payme
              </li>
              <li className={c.chipMint}>
                <Check size={14} /> {s.reviews_count} foydalanuvchi
              </li>
            </ul>
          </div>
        </section>

        {/* ── Marquee: pastel lenta, yulduzcha ajratgichlar ── */}
        <div className={c.ticker} aria-hidden>
          <div className={c.tickerTrack}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={c.tickerRow}>
                {ticker.map((t) => (
                  <li key={t}>
                    <Spark className={c.tickerStar} />
                    {t}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <VariantSections
          prefix="v5"
          tg={tg}
          botClean={bot}
          s={s}
          c={{
            statsSec: c.statsSec,
            secIn: c.secIn,
            stats: c.stats,
            stat: c.stat,
            statNum: c.statNum,
            statLab: c.statLab,
            trustRow: c.trustRow,
            trustChip: c.trustChip,
            sec: c.sec,
            kicker: c.kicker,
            h2: c.h2,
            secSub: c.secSub,
            secAct: c.secAct,
            steps: c.steps,
            step: c.step,
            stepNum: c.stepBall,
            stepH: c.stepH,
            stepP: c.stepP,
            grid: c.grid,
            card: c.card,
            cardHot: c.cardHot,
            cardBadge: c.cardBadge,
            cardAmt: c.cardAmt,
            cardNum: c.cardNum,
            cardUnit: c.cardUnit,
            cardPrice: c.cardPrice,
            cardPer: c.cardPer,
            faq: c.faq,
            faqItem: c.faqItem,
            faqQ: c.faqQ,
            faqA: c.faqA,
            faqMark: c.faqMark,
            finalSec: c.finalSec,
            final: c.final,
            finEyebrow: c.finEyebrow,
            finalH: c.finalH,
            finalP: c.finalP,
            finalList: c.finalList,
            cta: c.cta,
            btnLight: c.ctaLight,
            foot: c.foot,
            footIn: c.footIn,
            footBrand: c.footBrand,
            footLogo: c.footLogo,
            footName: c.footName,
            footNote: c.footNote,
            footBot: c.footBot,
          }}
        />
      </main>

      {/* ── Variant almashtirgich: A/B ni qo'lda solishtirish uchun ── */}
      <nav className={c.switcher} aria-label="Dizayn variantlari">
        <a href="/1">1</a>
        <a href="/2">2</a>
        <a href="/3">3</a>
        <a href="/4">4</a>
        <a href="/5" className={c.swOn} aria-current="page">
          5
        </a>
        <a href="/l">asl</a>
      </nav>

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
    </div>
  );
}
