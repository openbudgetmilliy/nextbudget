import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import VariantSections from '@/components/landing/VariantSections';
import { Wordmark } from '@/components/Logo';
import { Check, Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import st from './page.module.css';

/**
 * Variant 2 — "Pop plakat" (stiker neo-brutalizm).
 *
 * `/l` bilan bir xil ma'lumot manbalari, lekin butunlay boshqa ohang:
 * qalin ink konturlar, qattiq siljigan soyalar, iliq krem fon va
 * rangli stiker-kartalar. A/B sinov varianti — indekslanmaydi.
 *
 * Sahifa `/l` kabi to'liq statik: `getSettings()` faqat build/revalidate
 * paytida chaqiriladi, foydalanuvchi so'rovida DB ishtirok etmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  // Brend nomi layout'dagi `%s · Brend` shablonidan keladi — bu yerda takrorlanmaydi
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

/**
 * 16 uchli yulduz-portlash nuqtalari — narx kartasi orqasida sekin aylanadi.
 * Build paytida bir marta hisoblanadi, sahifaga tayyor satr sifatida kiradi.
 */
const BURST_POINTS = Array.from({ length: 32 }, (_, i) => {
  const r = i % 2 === 0 ? 100 : 60;
  const a = (Math.PI * i) / 16;
  return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export default async function Variant2() {
  const s = await getSettings();
  const bot = s.bot_username || env.BOT;
  const botClean = bot.replace(/^@/, '');
  const tg = tgLink(bot, 'web');

  const vars = { narx: s.price_one_vote };
  // `|` dan keyingi qism narxni takrorlardi — narx alohida stikerda katta
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  // Lentada aylanadigan ishonch iboralari
  const ribbon = [
    'Aniq narx',
    'Humo · Uzcard · Payme',
    `${s.reviews_count} foydalanuvchi`,
    'Telegram bot orqali',
    'Yashirin komissiya yo‘q',
  ];

  return (
    <div className={st.page}>
      {/* ── Yopishqoq header: oq, qalin ink pastki chegara ── */}
      <header className={st.hdr}>
        <div className={st.hdrIn}>
          <a href="#top" className={st.brand} aria-label={SITE.brand}>
            <Wordmark size={34} />
          </a>
          <a
            href={tg}
            className={`${st.btnPop} ${st.btnSm}`}
            data-t="cta"
            data-t-id="v2_header"
            data-tg
            rel="noopener"
          >
            <Telegram size={16} />
            Botga o‘tish
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero: badge + marker-sarlavha + yulduzli narx stikeri ── */}
        <section className={st.hero}>
          {/* Fon shakllari — juda och, matn kontrastiga ta'sir qilmaydi */}
          <div className={st.blobA} aria-hidden />
          <div className={st.blobB} aria-hidden />

          <div className={st.heroIn}>
            {s.hero_badge ? (
              <p className={st.badge}>
                <span className={st.badgeWig}>
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="currentColor">
                    <path d="M12 1.8l2.9 6.2 6.8.8-5 4.6 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.6 6.8-.8z" />
                  </svg>
                  {s.hero_badge}
                </span>
              </p>
            ) : null}

            <h1 className={st.title}>
              {lines.map((line, i) => (
                <span
                  key={line}
                  className={
                    // Marker plitalar oxirgi qatorlarga tushadi — ko'z narx
                    // tomon "pastga" yetaklanadi
                    i === lines.length - 1
                      ? st.mSun
                      : i === lines.length - 2
                        ? st.mGreen
                        : undefined
                  }
                >
                  {line}
                </span>
              ))}
            </h1>

            <div className={st.priceWrap}>
              {/* Sekin aylanadigan sariq portlash — narxga sahna yaratadi */}
              <div className={st.burstBox} aria-hidden>
                <svg className={st.burst} viewBox="0 0 200 200">
                  <polygon points={BURST_POINTS} fill="#ffd23f" stroke="#08243a" strokeWidth="3" />
                </svg>
              </div>
              <div className={st.priceCard}>
                <p className={st.priceLab}>1 ovoz narxi</p>
                <p className={st.priceFig}>
                  <span className={`${st.priceNum} tnum`}>{s.price_one_vote}</span>
                  <span className={st.priceCur}>so‘m</span>
                </p>
              </div>
            </div>

            <p className={st.heroSub}>{applyVars(s.hero_sub, vars)}</p>

            <div className={st.heroAct}>
              <a
                href={tg}
                className={`${st.btnPop} ${st.btnBig}`}
                data-t="cta"
                data-t-id="v2_hero"
                data-tg
                rel="noopener"
              >
                <Telegram />
                {s.cta_primary}
              </a>
            </div>

            <ul className={st.trust}>
              <li className={`${st.chip} ${st.chipGreen}`}>
                <Check /> Aniq narx
              </li>
              <li className={`${st.chip} ${st.chipSun}`}>
                <Check /> Humo · Uzcard · Payme
              </li>
              <li className={`${st.chip} ${st.chipPaper}`}>
                <Check /> {s.reviews_count} foydalanuvchi
              </li>
            </ul>
          </div>
        </section>

        {/* ── Shaxmat qirrali yuguruvchi lenta ── */}
        <div className={st.marquee} aria-hidden>
          <div className={st.mTrack}>
            {[0, 1].map((copy) => (
              <div className={st.mRow} key={copy}>
                {ribbon.map((t) => (
                  <span key={t} className={st.mItem}>
                    {t}
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                      <path d="M12 1.8l2.9 6.2 6.8.8-5 4.6 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.6 6.8-.8z" />
                    </svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <VariantSections
          prefix="v2"
          tg={tg}
          botClean={botClean}
          s={s}
          c={{
            statsSec: st.stats,
            stats: st.statGrid,
            stat: st.stat,
            statNum: st.statNum,
            statLab: st.statLab,
            secSteps: st.how,
            secRewards: st.prices,
            secFaq: st.faq,
            secHead: st.secHead,
            kicker: st.kicker,
            secTitle: st.secTitle,
            secSub: st.secSub,
            secAct: st.secAct,
            steps: st.stepGrid,
            step: st.step,
            stepNum: st.stepNum,
            stepTitle: st.stepTitle,
            stepText: st.stepText,
            grid: st.grid,
            card: st.card,
            cardHot: st.cardGreen,
            cardBadge: st.cardBadge,
            cardAmt: st.cardFig,
            cardNum: st.cardNum,
            cardCur: st.cardCur,
            cardTitle: st.cardTitle,
            per: st.per,
            faqList: st.faqList,
            faqItem: st.faqItem,
            faqSum: st.faqSum,
            faqBody: st.faqBody,
            faqIcon: st.faqIcon,
            finalSec: st.finalWrap,
            final: st.final,
            finEyebrow: st.finEyebrow,
            finalTitle: st.finalTitle,
            finalSub: st.finalSub,
            finalList: st.finalList,
            btnPop: st.btnPop,
            btnBig: st.btnBig,
            btnSun: st.btnSun,
            foot: st.foot,
            footIn: st.footIn,
            footBrand: st.footBrand,
            footLogo: st.footLogo,
            footName: st.footName,
            footNote: st.footNote,
            footBot: st.footBot,
          }}
        />
      </main>

      {/* ── Variant almashtirgich — ichki sinov uchun, foydalanuvchiga xalaqit bermaydi ── */}
      <nav className={st.switcher} aria-label="Dizayn variantlari">
        <a href="/1" className={st.swLink}>
          1
        </a>
        <a href="/2" className={`${st.swLink} ${st.swActive}`} aria-current="page">
          2
        </a>
        <a href="/3" className={st.swLink}>
          3
        </a>
        <a href="/4" className={st.swLink}>
          4
        </a>
        <a href="/5" className={st.swLink}>
          5
        </a>
        <a href="/l" className={st.swLink}>
          asl
        </a>
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
