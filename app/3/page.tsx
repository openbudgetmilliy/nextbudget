import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import VariantSections from '@/components/landing/VariantSections';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { SITE, applyVars } from '@/lib/content';
import { LIVE_STATS, LANDING_TRUST } from '@/lib/landing-sections';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import st from './page.module.css';

/**
 * Variant 3 — «Aurora Premium».
 *
 * Yorug' fintech-uslub: deyarli oq fon, hero ortida sekin oqadigan aurora
 * gradient, shisha (glassmorphism) kartalar va gradient aksentlar. Plakat
 * varianti baqiroq; bu variant esa «premium xizmat» taassurotini sinaydi —
 * ikkalasi bir xil matn manbasidan quriladi, faqat kiyimi boshqa.
 *
 * Sahifa to'liq statik (SSG): ma'lumot faqat build/revalidate'da o'qiladi,
 * client JS — faqat Tracker (analitika delegation'i).
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmaydi, indeks faqat asosiy sahifada.
    Layout shabloni brend nomini o'zi qo'shadi — bu yerda takrorlanmaydi. */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

/** Qadamlar — umumiy matn `lib/landing-sections.ts` dan */

export default async function Aurora() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  /** Bot manzili matn sifatida — «@» belgisisiz saqlaymiz, UI o‘zi qo‘shadi */
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  /** `|` dan keyingi tarixiy qism narxni takrorlaydi — bu yerda kerak emas */
  const title = applyVars(s.hero_title, vars).split('|')[0].trim();
  /* Oxirgi so'z gradientda — ko'z sarlavhani o'qib, aksentda to'xtaydi */
  const words = title.split(/\s+/);
  const lastWord = words[words.length - 1];
  const headWords = words.slice(0, -1).join(' ');

  return (
    <div className={st.page}>
      {/* ── Yopishqoq shisha header ── */}
      <header className={st.hdr}>
        <div className={st.hdrIn}>
          <a href="#top" className={st.brand}>
            <Logo size={32} className={st.brandMark} />
            <span className={st.brandName}>{SITE.brand}</span>
          </a>
          <a href={tg} className={st.btnSm} data-t="cta" data-t-id="v3_header" data-tg rel="noopener">
            {s.cta_primary}
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero: aurora fon + shisha kartalar ── */}
        <section className={st.hero}>
          {/* Fon qatlamlari alohida div'larda — matn ustida emas, ostida oqadi */}
          <div className={st.aurora} aria-hidden="true" />
          <div className={st.grain} aria-hidden="true" />
          <div className={`${st.orb} ${st.orbA}`} aria-hidden="true" />
          <div className={`${st.orb} ${st.orbB}`} aria-hidden="true" />
          <div className={`${st.orb} ${st.orbC}`} aria-hidden="true" />

          <div className={st.heroIn}>
            <div className={st.heroCopy}>
              <p className={st.eyebrow}>
                <span className={st.eyebrowDot} aria-hidden="true" />
                {s.hero_badge}
              </p>

              <h1 className={st.h1}>
                {headWords && <>{headWords} </>}
                <span className={st.gradWord}>{lastWord}</span>
              </h1>

              <p className={st.sub}>{applyVars(s.hero_sub, vars)}</p>

              <div className={st.ctaRow}>
                <a href={tg} className={st.btn} data-t="cta" data-t-id="v3_hero" data-tg rel="noopener">
                  {s.cta_primary}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              <ul className={st.trust}>
                <li>Aniq narx</li>
                <li>Humo · Uzcard · Payme</li>
                <li>{s.reviews_count} foydalanuvchi</li>
              </ul>
            </div>

            {/* Narx aktsenti: aylanuvchi conic-gradient halqa ichida oq karta */}
            <div className={st.ring}>
              <div className={st.ringSpin} aria-hidden="true" />
              <div className={st.ringIn}>
                <p className={st.ringLab}>1 ovoz narxi</p>
                <p className={st.ringFig}>
                  <span className={`${st.ringNum} tnum`}>{s.price_one_vote}</span>
                  <span className={st.ringCur}>so‘m</span>
                </p>
                <p className={st.ringHint}>Katta paketlarda bir ovoz arzonroq</p>
              </div>
            </div>
          </div>

          {/* Statistika — shisha kartalar qatori. Faqat halol, tekshiriladigan
              faktlar: va'da emas, xizmatning o'zi haqidagi raqamlar */}
          <div className={st.stats}>
            {LIVE_STATS.map((item) => (
              <div key={item.lab} className={st.stat}>
                <span className={`${st.statNum} tnum`}>{item.num}</span>
                <span className={st.statLab}>{item.lab}</span>
              </div>
            ))}
          </div>
          <ul className={st.trustRow}>
            {LANDING_TRUST.map((t) => (
              <li key={t} className={st.trustChip}>
                {t}
              </li>
            ))}
          </ul>
        </section>

        <VariantSections
          prefix="v3"
          tg={tg}
          botClean={bot}
          s={s}
          skipStats
          c={{
            secSteps: st.how,
            secRewards: st.prices,
            secFaq: st.faq,
            kicker: st.faqKick,
            h2: st.h2,
            secSub: st.sectionSub,
            secAct: st.secAct,
            steps: st.timeline,
            step: st.step,
            stepNum: st.stepNum,
            stepH: st.stepTitle,
            stepP: st.stepDesc,
            grid: st.grid,
            card: st.card,
            cardHot: st.cardFeat,
            cardBadge: st.badge,
            cardAmt: st.cardPrice,
            cardTitle: st.cardTitle,
            cardPer: st.cardPer,
            faqList: st.faqList,
            faqItem: st.faqItem,
            faqQ: st.faqQ,
            faqA: st.faqA,
            finalSec: st.finale,
            final: st.finaleIn,
            finEyebrow: st.finEyebrow,
            finalTitle: st.finaleTitle,
            finalSub: st.finaleSub,
            finalList: st.finalList,
            btnLight: st.btnLight,
            foot: st.foot,
            footIn: st.footIn,
            footBrand: st.footBrand,
            footLogo: st.brandMark,
            footName: st.brandName,
            footNote: st.footNote,
            footBot: st.footBot,
          }}
        />
      </main>

      {/* Suzuvchi variant almashtirgich — A/B taqqoslash uchun ichki navigatsiya */}
      <nav className={st.switcher} aria-label="Dizayn variantlari">
        <a href="/1">1</a>
        <a href="/2">2</a>
        <a href="/3" aria-current="page" className={st.switcherNow}>3</a>
        <a href="/4">4</a>
        <a href="/5">5</a>
        <a href="/l">asl</a>
      </nav>

      <Tracker />
    </div>
  );
}
