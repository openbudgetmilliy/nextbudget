import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import PhoneTelegramMock from '@/components/PhoneTelegramMock';
import MoneyRain from './MoneyRain';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import {
  FINALE_BULLETS,
  LANDING_REWARDS,
  LANDING_STEPS,
  landingFaqItems,
  liveStats,
} from '@/lib/landing-sections';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import c from './page.module.css';

/**
 * Variant 9 — «Barakat».
 *
 * Uslub manbasi: files/14-barakat-referral.html (demo referal-bot sahifasi).
 * Undan FAQAT dizayn tili olingan — to'q zumrad fon (#03201C), mint-oltin
 * urg'u (#34D399 / #F2C14E), shisha panellar, Sora sarlavhalar. Manbadagi
 * referal havola va reyting kabi vidjetlar YO'Q — referal-bot kontentiga
 * xos, biznikiga aloqasi yo'q.
 *
 * Fon — manbadagi haqiqiy 3D pul yomg'iri (`MoneyRain.tsx`, three.js,
 * `npm install three` bilan o'zimiz bilan qadoqlangan, tashqi CDN emas).
 * `/7` dagi tajriba: CSS-only taqlid o'rniga chin sahna, chunki variant
 * nomi va uslubi buni va'da qiladi.
 *
 * Manbadagi "chat" paneli (bot bilan xayoliy suhbat) o'rniga — statusli
 * panel: sarlavha (bot onlayn holati — umumiy, hech qanday soxta voqea
 * emas) va real ma'lumot (narx, bosh mukofot). Manbada bo'lgani kabi
 * bitta ismli foydalanuvchi va aniq summa misoli ("Aziz +30 000 oldi")
 * KIRITILMADI — bu haqiqatda sodir bo'lmagan voqeani da'vo qilardi.
 *
 * MATN /3 BILAN AYNAN BIR XIL manbadan: `lib/landing-sections.ts` va admin
 * sozlamalari. Narx yoki qadam matni o'zgarsa, ikkala sahifa birga o'zgaradi.
 *
 * Sahifa to'liq statik (SSG) — pul yomg'iri client komponent bo'lsa ham,
 * u faqat vizual bezak, server render qilingan matnga bog'liq emas.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasligi shart, aks holda trafik buziladi */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

export default async function VariantBarakat() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);
  const stats = liveStats(s);
  const faq = landingFaqItems(s);
  const voteReward = LANDING_REWARDS[0].amount;

  return (
    <div className={c.page}>
      {/* Fon: manbadagi haqiqiy 3D pul yomg'iri — `position: fixed`,
          skroll bilan siljimaydi. `.veil` matn zonasi tomon qorong'ilashadi. */}
      <div className={c.bgFixed} aria-hidden>
        <MoneyRain />
        <div className={c.veil} />
      </div>

      {/* ── Yopishqoq header ── */}
      <header className={c.hdr}>
        <div className={c.hdrIn}>
          <a href="#top" className={c.brand}>
            <span className={c.brandTile}>
              <Logo size={22} className={c.brandMark} />
            </span>
            <span className={c.brandName}>{SITE.brand}</span>
          </a>

          <nav className={c.hdrNav} aria-label="Bo'limlar">
            <a href="#jarayon">Qadamlar</a>
            <a href="#mukofot">Mukofot</a>
            <a href="#savol-javob">Savollar</a>
          </nav>

          <a href={tg} className={c.btnSm} data-t="cta" data-t-id="v9_header" data-tg rel="noopener">
            <Telegram size={16} />
            Botni ochish
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero: ikki ustun — matn + status paneli ── */}
        <section className={c.hero}>
          <div className={c.heroIn}>
            <div className={c.heroCopy}>
              {s.hero_badge ? (
                <p className={c.chip}>
                  <span className={c.dot} />
                  {s.hero_badge}
                </p>
              ) : null}

              <h1 className={c.title}>
                {lines.map((line, i) => (
                  <span key={line} className={i === lines.length - 1 ? c.titleHl : undefined}>
                    {line}
                  </span>
                ))}
              </h1>

              <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

              <div className={c.heroAct}>
                <a
                  href={tg}
                  className={c.btnM}
                  data-t="cta"
                  data-t-id="v9_hero"
                  data-tg
                  rel="noopener"
                >
                  <Telegram size={18} />
                  {s.cta_primary}
                </a>
                <a href="#jarayon" className={c.btnO} data-t="click" data-t-id="v9_hero_steps">
                  Qanday ishlaydi?
                </a>
              </div>

              <p className={c.mini}>
                Aniq narx — <b>{s.price_one_vote} so‘m</b> · Humo · Uzcard · Payme
              </p>
            </div>

            <PhoneTelegramMock botName="OpenBudget Bot" amount={voteReward} />
          </div>
        </section>

        {/* ── Ko'rsatkichlar ── */}
        <section className={c.statsSec} aria-label="Ko'rsatkichlar">
          <div className={c.statsIn}>
            {stats.map((it, i) => (
              <div key={it.lab} className={c.stat}>
                <b className={`${i % 2 ? c.statG : ''} tnum`}>{it.num}</b>
                <span>{it.lab}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Qadamlar: bog'lovchi chiziqli doiralar ── */}
        <section id="jarayon" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Jarayon</p>
            <h2 className={c.h2}>Boshlash — 2 daqiqa</h2>
            <p className={c.secSub}>
              Ro'yxatdan o'tish shart emas — hammasi Telegram ichida.
            </p>

            <ol className={c.sw}>
              {LANDING_STEPS.map((step) => (
                <li key={step.n} className={c.sc}>
                  <span className={`${c.scNo} tnum`}>{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>

            <div className={c.secAct}>
              <a
                href={tg}
                className={c.btnM}
                data-t="cta"
                data-t-id="v9_steps"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                Hoziroq boshlash
              </a>
            </div>
          </div>
        </section>

        {/* ── Mukofot: manbadagi ishonch to'ri uslubida ── */}
        <section id="mukofot" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Mukofot</p>
            <h2 className={c.h2}>Nima olasiz</h2>
            <p className={c.secSub}>Ovoz bergandan so'ng avtomatik to'lanadi.</p>

            <ul className={c.tg}>
              {LANDING_REWARDS.map((r, i) => (
                <li key={r.tag} className={`${c.tc} ${i === 2 ? c.tcHot : ''}`}>
                  <span className={c.ti}>{`0${i + 1}`}</span>
                  <h3>{r.title}</h3>
                  <p className={c.tcAmt}>
                    <span className="tnum">{r.amount}</span>
                    {r.unit && <span className={c.tcUnit}>{r.unit}</span>}
                  </p>
                  <p>{r.desc}</p>
                </li>
              ))}
            </ul>

            <div className={c.secAct}>
              <a
                href={tg}
                className={c.btnM}
                data-t="cta"
                data-t-id="v9_rewards"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                Mukofot olishni boshlash
              </a>
            </div>
          </div>
        </section>

        {/* ── Savol-javob ── */}
        <section id="savol-javob" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Savol-javob</p>
            <h2 className={c.h2}>Ko'p so'raladi</h2>

            <div className={c.faqList}>
              {faq.map((item) => (
                <details key={item.q} className={c.faqItem}>
                  <summary className={c.faqQ}>{item.q}</summary>
                  <p className={c.faqA}>
                    {'supportLink' in item && item.supportLink ? (
                      <>
                        <a
                          href={`https://t.me/${s.support_username}`}
                          rel="noopener"
                          data-t="click"
                          data-t-id="support"
                        >
                          @{s.support_username}
                        </a>{' '}
                        ga yozing — holatingizni tekshirib, tez yordam beramiz.
                      </>
                    ) : (
                      item.a
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Yakuniy da'vat ── */}
        <section className={c.finaleWrap}>
          <div className={c.finaleIn}>
            <h2 className={c.finH}>
              Ovoz bering. Pul oling. <span className={c.finHl}>Shu.</span>
            </h2>
            <p className={c.finP}>
              {s.reviews_count} dan ortiq odam allaqachon to'lov oldi. Navbat sizda.
            </p>
            <ul className={c.finList}>
              {FINALE_BULLETS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className={c.finAct}>
              <a
                href={tg}
                className={c.btnM}
                data-t="cta"
                data-t-id="v9_final"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                Hoziroq boshlash
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={c.foot}>
        <div className={c.footIn}>
          <a href="#top" className={c.footBrand} aria-label={SITE.brand}>
            <Logo size={36} className={c.footLogo} />
            <span className={c.footName}>Milliy jamoasi</span>
          </a>
          <p className={c.footNote}>
            To'lovlar Telegram bot orqali amalga oshiriladi. Barcha huquqlar himoyalangan.
          </p>
          <a
            href={tg}
            className={c.footBot}
            data-t="cta"
            data-t-id="v9_foot_bot"
            data-tg
            rel="noopener"
          >
            @{bot}
          </a>
        </div>
      </footer>

      {/* ── Variant almashtirgich ── */}
      <nav className={c.switcher} aria-label="Dizayn variantlari">
        <a href="/1">1</a>
        <a href="/2">2</a>
        <a href="/3">3</a>
        <a href="/4">4</a>
        <a href="/5">5</a>
        <a href="/6">6</a>
        <a href="/7">7</a>
        <a href="/8">8</a>
        <a href="/9" className={c.swOn} aria-current="page">
          9
        </a>
        <a href="/l">asl</a>
      </nav>

      <Tracker />

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
