import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import { Wordmark } from '@/components/Logo';
import { Check, Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import {
  FALLBACK_PRICES,
  SITE,
  applyVars,
  kindOf,
  pricePerLine,
  titleLines,
  uzs,
} from '@/lib/content';
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
  title: 'Ovoz paketlari',
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

/** 5 qirrali yulduzcha — «Ommabop» kartaning burchak stikeri */
const STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 24 : 10.5;
  const a = (Math.PI * i) / 5 - Math.PI / 2;
  return `${(26 + r * Math.cos(a)).toFixed(1)},${(26 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

/** Qadam raqami doirasining rangi — har biri boshqa stiker */
const STEP_TONES = [st.numBlue, st.numSun, st.numGreen];

const STEPS = [
  { t: 'Botga o‘ting', d: 'Telegram’da bir bosishda ochiladi — ro‘yxatdan o‘tish shart emas.' },
  { t: 'Ovoz sonini tanlang', d: 'Paketlardan mosini belgilang — narx oldindan ko‘rinib turadi.' },
  { t: 'To‘lang', d: 'Humo, Uzcard yoki Payme bilan. Yashirin komissiya yo‘q.' },
];

export default async function Variant2() {
  const s = await getSettings();
  const bot = s.bot_username || env.BOT;
  const tg = tgLink(bot, 'web');

  const vars = { narx: s.price_one_vote };
  // `|` dan keyingi qism narxni takrorlardi — narx alohida stikerda katta
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);
  const packs = FALLBACK_PRICES.filter((p) => kindOf(p.sku) === 'ovoz');

  // Lentada aylanadigan ishonch iboralari — ikki nusxada, uzluksiz halqa uchun
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
            <p className={st.badge}>
              <span className={st.badgeWig}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="currentColor">
                  <path d="M12 1.8l2.9 6.2 6.8.8-5 4.6 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.6 6.8-.8z" />
                </svg>
                {s.hero_badge}
              </span>
            </p>

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

        {/* ── Narx paketlari: burilgan stiker-kartalar ── */}
        <section className={st.prices}>
          <div className={st.secHead}>
            <p className={`${st.kicker} ${st.kickerBlue}`}>Paketlar</p>
            <h2 className={st.secTitle}>Ovoz paketini tanlang</h2>
            <p className={st.secSub}>
              Ko‘proq ovoz — bitta ovoz arzonroq. Barcha narxlar yakuniy, to‘lovda ustama yo‘q.
            </p>
          </div>

          <ul className={st.grid}>
            {packs.map((p) => {
              const hot = p.badge === 'Ommabop';
              const best = p.badge === 'Eng foydali';
              const off = p.oldPriceUzs
                ? Math.round((1 - p.priceUzs / p.oldPriceUzs) * 100)
                : 0;
              return (
                <li
                  key={p.id}
                  className={[
                    st.card,
                    hot ? st.cardSun : '',
                    best ? st.cardGreen : '',
                    p.badge && !hot && !best ? st.cardCoral : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {hot && (
                    /* Sariq yulduzcha — eng ko'p olinadigan paketni chetdan belgilaydi */
                    <svg className={st.cardStar} viewBox="0 0 52 52" aria-hidden>
                      <polygon
                        points={STAR_POINTS}
                        fill="#ffd23f"
                        stroke="#08243a"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {p.badge && <span className={st.cardBadge}>{p.badge}</span>}

                  <p className={st.cardTitle}>{p.title}</p>

                  <p className={st.cardFig}>
                    <span className={`${st.cardNum} tnum`}>{uzs(p.priceUzs)}</span>
                    <span className={st.cardCur}>so‘m</span>
                  </p>

                  <p className={st.cardMeta}>
                    {p.oldPriceUzs && (
                      <>
                        <s className={`${st.old} tnum`}>{uzs(p.oldPriceUzs)} so‘m</s>
                        <span className={st.offChip}>−{off}%</span>
                      </>
                    )}
                  </p>

                  <p className={st.per}>{pricePerLine('ovoz', p.priceUzs / p.amount)}</p>

                  <a
                    href={tg}
                    className={st.cardBtn}
                    data-t="cta"
                    data-t-id={`v2_card_${p.sku}`}
                    data-tg
                    rel="noopener"
                  >
                    Tanlash
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Qanday ishlaydi: 3 rangli doira-stiker, zigzag chiziq ── */}
        <section className={st.how}>
          <div className={st.secHead}>
            <p className={`${st.kicker} ${st.kickerCoral}`}>Uch qadam</p>
            <h2 className={st.secTitle}>Qanday ishlaydi</h2>
          </div>

          <ol className={st.stepGrid}>
            {STEPS.map((step, i) => (
              <li className={st.step} key={step.t}>
                <span className={`${st.stepNum} ${STEP_TONES[i]}`}>{i + 1}</span>
                <p className={st.stepTitle}>{step.t}</p>
                <p className={st.stepText}>{step.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Yakuniy CTA: ko'k mega-stiker ── */}
        <section className={st.finalWrap}>
          <div className={st.final}>
            <div className={st.finalBlob} aria-hidden />
            <h2 className={st.finalTitle}>Ovozingiz tayyor turibdi</h2>
            <p className={st.finalSub}>
              {s.reviews_count} foydalanuvchi allaqachon sinab ko‘rdi — endi navbat sizda.
            </p>
            <a
              href={tg}
              className={`${st.btnPop} ${st.btnBig} ${st.btnSun}`}
              data-t="cta"
              data-t-id="v2_final"
              data-tg
              rel="noopener"
            >
              <Telegram />
              {s.cta_primary}
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer: majburiy huquqiy izoh ── */}
      <footer className={st.foot}>
        <div className={st.footIn}>
          <p className={st.legal}>
            {SITE.brand} — mustaqil vositachi xizmat. Rasmiy{' '}
            <a href="https://openbudget.uz" rel="noopener nofollow" target="_blank">
              openbudget.uz
            </a>{' '}
            portali bilan bog‘liq emas. Savol bo‘lsa —{' '}
            <a
              href={`https://t.me/${s.support_username}`}
              rel="noopener"
              data-t="click"
              data-t-id="support"
            >
              @{s.support_username}
            </a>
            .
          </p>
        </div>
      </footer>

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
