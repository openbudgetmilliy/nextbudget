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
 * Variant 4 — «Bento yorqin».
 *
 * Butun sahifa asimmetrik rangli mozaika: har mazmun bo'lagi o'z to'yingan
 * katagida yashaydi. Maqsad — A/B sinovda «tartibli o'yin» yo'nalishini
 * o'lchash: axborot zichligi yuqori, lekin har katak bitta gapni aytadi.
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

export default async function VariantBento() {
  const s = await getSettings();
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const tg = tgLink(bot, 'web');

  const vars = { narx: s.price_one_vote };
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <div className={c.page}>
      {/* ── Header: oq, minimal — mozaika o'zi rang-barang, tepa jim tursin ── */}
      <header className={c.hdr}>
        <div className={c.hdrIn}>
          <span className={c.brand}>
            <Logo size={30} className={c.logoImg} />
            {SITE.brand}
          </span>
          <a href={tg} className={c.btnSm} data-t="cta" data-t-id="v4_header" data-tg rel="noopener">
            <Telegram size={15} />
            Botga o‘tish
          </a>
        </div>
      </header>

      <main className={c.mainCol}>
        {/* ── Hero mozaikasi: 6 katak, har biri bitta gap ── */}
        <section className={c.bento}>
          {/* Katta katak: sarlavha + CTA */}
          <div className={`${c.cell} ${c.cellHero}`}>
            {s.hero_badge ? <p className={c.badge}>{s.hero_badge}</p> : null}
            <h1 className={c.title}>
              {lines.map((line, i) => (
                // Oxirgi qator ko'k markerda — ko'z avval shunga tushadi
                <span key={line} className={i === lines.length - 1 ? c.titleHl : undefined}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

            <div className={c.ctaRing}>
              <a href={tg} className={c.cta} data-t="cta" data-t-id="v4_hero" data-tg rel="noopener">
                <Telegram size={20} />
                {s.cta_primary}
                <span className={c.ctaArrow} aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Narx katagi: sahifadagi eng katta raqam */}
          <div className={`${c.cell} ${c.cellPrice}`}>
            <p className={c.cellLab}>1 ovoz narxi</p>
            <p className={c.priceFig}>
              <span className={`${c.priceNum} tnum`}>{s.price_one_vote}</span>
              <span className={c.priceCur}>so‘m</span>
            </p>
            <p className={c.priceFoot}>Yashirin komissiya yo‘q</p>
          </div>

          {/* To'lov usullari */}
          <div className={`${c.cell} ${c.cellPay}`}>
            <p className={c.cellLab}>To‘lov</p>
            <ul className={c.chips}>
              <li>Humo</li>
              <li>Uzcard</li>
              <li>Payme</li>
            </ul>
          </div>

          {/* Foydalanuvchilar soni */}
          <div className={`${c.cell} ${c.cellRev}`}>
            <p className={`${c.revNum} tnum`}>{s.reviews_count}</p>
            <p className={c.revLab}>foydalanuvchi tanladi</p>
          </div>

          {/* Dekorativ katak: halqa to'lqinlar — mozaikaga «nafas» beradi */}
          <div className={`${c.cell} ${c.cellDeco}`}>
            <span className={c.ripple} aria-hidden />
            <span className={`${c.ripple} ${c.ripple2}`} aria-hidden />
            <span className={`${c.ripple} ${c.ripple3}`} aria-hidden />
            <p className={c.decoLab}>
              <Check size={14} className={c.decoIco} /> Aniq narx
            </p>
          </div>

          {/* Bot manzili — mozaikadan to'g'ridan-to'g'ri botga yo'l */}
          <a
            href={tg}
            className={`${c.cell} ${c.cellBot}`}
            data-t="cta"
            data-t-id="v4_cell_bot"
            data-tg
            rel="noopener"
          >
            <p className={c.cellLab}>Telegram</p>
            <p className={c.botName}>@{bot}</p>
            <span className={c.botGo} aria-hidden>
              →
            </span>
          </a>
        </section>

        <VariantSections
          prefix="v4"
          tg={tg}
          botClean={bot}
          s={s}
          c={{
            statsSec: c.sec,
            stats: c.statRow,
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
            grid: c.pkGrid,
            card: c.pk,
            cardHot: c.pkInk,
            cardBadge: c.pkBadge,
            cardAmt: c.pkAmt,
            cardNum: c.pkNum,
            cardUnit: c.pkUnit,
            cardPrice: c.pkPrice,
            cardPer: c.pkPer,
            faqList: c.faqList,
            faqItem: c.faq,
            faqQ: c.faqQ,
            faqA: c.faqA,
            finalPanel: `${c.cell} ${c.finalPanel}`,
            finEyebrow: c.finEyebrow,
            finalH: c.finalH,
            finalHl: c.finalHl,
            finalP: c.finalP,
            finalList: c.finalList,
            ctaRing: c.ctaRing,
            cta: c.cta,
            ctaArrow: c.ctaArrow,
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
        <a href="/4" className={c.swOn} aria-current="page">
          4
        </a>
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
