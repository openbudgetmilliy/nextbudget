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
 * Variant 1 — «Neon zarba».
 *
 * Asosiy plakatning to'q-neon talqini: qora-siyoh osmon, suzuvchi neon
 * dog'lar, gradient-narx va pulsatsiyalanuvchi CTA. Maqsad — A/B sinovda
 * «energiya» yo'nalishini o'lchash: xuddi shu matn, boshqa temperatura.
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

export default async function VariantNeon() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  // Bot manzili bir joyda yasaladi — qadamlar, FAQ va yakuniy CTA bir xil ko'rsatsin
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');

  const vars = { narx: s.price_one_vote };
  // `|` dan keyingi qism narxni takrorlaydi — narx bu yerda alohida va katta
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);
  const ticker = marqueeItems(s.reviews_count);

  return (
    <div className={c.page}>
      {/* Fon qatlami: neon dog'lar + nuqtali panjara. Alohida div — matn
          qatlamiga filter/animatsiya yuqmasin */}
      <div className={c.sky} aria-hidden>
        <span className={`${c.orb} ${c.orbCyan}`} />
        <span className={`${c.orb} ${c.orbLime}`} />
        <span className={`${c.orb} ${c.orbDeep}`} />
        <span className={c.mesh} />
      </div>

      {/* ── Yopishqoq header: to'q shisha ── */}
      <header className={c.hdr}>
        <div className={c.hdrIn}>
          <span className={c.brand}>
            {/* Belgi gradienti faqat oq yuzada o'qiladi — oq plitka shart */}
            <span className={c.logoTile}>
              <Logo size={26} className={c.logoImg} />
            </span>
            {SITE.brand}
          </span>
          <a
            href={tg}
            className={c.btnSm}
            data-t="cta"
            data-t-id="v1_header"
            data-tg
            rel="noopener"
          >
            <Telegram size={16} />
            Botga o‘tish
          </a>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className={c.hero}>
          <div className={c.heroIn}>
            {s.hero_badge ? (
              <p className={c.badge}>
                <span className={c.badgeDot} />
                {s.hero_badge}
              </p>
            ) : null}

            <h1 className={c.title}>
              {lines.map((line, i) => (
                // Oxirgi qator neon gradientda — ko'z avval shunga tushadi
                <span key={line} className={i === lines.length - 1 ? c.titleHl : undefined}>
                  {line}
                </span>
              ))}
            </h1>

            <div className={c.price}>
              <p className={c.priceLab}>1 ovoz narxi</p>
              <p className={c.priceFig}>
                <span className={`${c.priceNum} tnum`}>{s.price_one_vote}</span>
                <span className={c.priceCur}>so‘m</span>
              </p>
            </div>

            <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

            <div className={c.heroAct}>
              <a
                href={tg}
                className={c.cta}
                data-t="cta"
                data-t-id="v1_hero"
                data-tg
                rel="noopener"
              >
                <Telegram size={22} />
                {s.cta_primary}
              </a>
            </div>

            <ul className={c.trust}>
              <li>
                <Check className={c.trustIco} /> Aniq narx
              </li>
              <li>
                <Check className={c.trustIco} /> Humo · Uzcard · Payme
              </li>
              <li>
                <Check className={c.trustIco} /> {s.reviews_count} foydalanuvchi
              </li>
            </ul>
          </div>
        </section>

        {/* ── Marquee lenta: cheksiz oqim, ikki nusxa — uzilishsiz halqa ── */}
        <div className={c.ticker} aria-hidden>
          <div className={c.tickerTrack}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={c.tickerRow}>
                {ticker.map((t) => (
                  <li key={t}>
                    <span className={c.tickerStar}>✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <VariantSections
          prefix="v1"
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
            sec: c.sec,
            kicker: c.kicker,
            h2: c.h2,
            secSub: c.secSub,
            secAct: c.secAct,
            steps: c.steps,
            step: c.step,
            stepNum: c.stepNum,
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
            faqIco: c.faqIco,
            finalSec: c.finalSec,
            final: c.final,
            finEyebrow: c.finEyebrow,
            finalH: c.finalH,
            finalHl: c.finalHl,
            finalP: c.finalP,
            finalList: c.finalList,
            cta: c.cta,
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
        <a href="/1" className={c.swOn} aria-current="page">
          1
        </a>
        <a href="/2">2</a>
        <a href="/3">3</a>
        <a href="/4">4</a>
        <a href="/5">5</a>
        <a href="/6">6</a>
        <a href="/7">7</a>
        <a href="/8">8</a>
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
