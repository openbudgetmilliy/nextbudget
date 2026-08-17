import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import { Telegram, Check } from '@/components/Icons';

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
 * Variant 7 — «Oltin tanga».
 *
 * Uslub manbasi: files/11-dostpul-referral.html (demo referal-bot sahifasi).
 * Undan FAQAT dizayn tili olingan — to'q zumrad fon (#04110B), oltin-gradient
 * urg'u, shisha (glass) panellar, Space Grotesk sarlavhalar. Manbadagi
 * referal havola, kalkulyator va jonli to'lov lentasi kabi vidjetlar bu
 * sahifada YO'Q — ular referal-bot kontentiga xos, biznikiga aloqasi yo'q.
 *
 * Manbada uch o'lchamli tanga yomg'iri (three.js, tashqi CDN) bor edi — bu
 * yerda YO'Q: landing sahifa tashqi skriptga muhtoj bo'lmasligi kerak
 * (`Logo` komponentidagi "origin'ga tegmaydi" printsipi shu yerda ham
 * amal qiladi). Kayfiyat CSS'ning o'zi bilan — suzuvchi oltin-yashil
 * nurlar va nozik nuqtali panjara — beriladi.
 *
 * MATN /3 BILAN AYNAN BIR XIL manbadan: `lib/landing-sections.ts` va admin
 * sozlamalari. Narx yoki qadam matni o'zgarsa, ikkala sahifa birga o'zgaradi.
 *
 * Sahifa to'liq statik (SSG); yagona client kod — Tracker.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasligi shart, aks holda trafik buziladi */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

export default async function VariantGold() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);
  const stats = liveStats(s);
  const faq = landingFaqItems(s);

  return (
    <div className={c.page}>
      {/* Fon qatlami: suzuvchi oltin tangalar + nurlar + nuqtali panjara.
          Alohida div — matn qatlamiga filter/animatsiya yuqmasin.
          Tangalar manbadagi 3D tanga yomg'irining (three.js) CSS-only
          ishorasi: variant nomi "Oltin tanga" shu motivdan olingan,
          shuning uchun fonda haqiqatan tanga ko'rinishi kerak. */}
      <div className={c.sky} aria-hidden>
        <span className={`${c.orb} ${c.orbGold}`} />
        <span className={`${c.orb} ${c.orbEm}`} />
        <span className={c.mesh} />
        <span className={`${c.coin} ${c.coin1}`} />
        <span className={`${c.coin} ${c.coin2}`} />
        <span className={`${c.coin} ${c.coin3}`} />
        <span className={`${c.coin} ${c.coin4}`} />
        <span className={`${c.coin} ${c.coin5}`} />
        <span className={`${c.coin} ${c.coin6}`} />
        <span className={`${c.coin} ${c.coin7}`} />
      </div>

      {/* ── Yopishqoq header: to'q shisha ── */}
      <header className={c.hdr}>
        <div className={c.hdrIn}>
          <a href="#top" className={c.brand}>
            <span className={c.brandTile}>
              <Logo size={22} className={c.brandMark} />
            </span>
            <span className={c.brandName}>{SITE.brand}</span>
          </a>

          <nav className={c.hdrNav} aria-label="Bo'limlar">
            <a href="#jarayon">Qanday ishlaydi</a>
            <a href="#mukofot">Mukofot</a>
            <a href="#savol-javob">Savollar</a>
          </nav>

          <a href={tg} className={c.btnSm} data-t="cta" data-t-id="v7_header" data-tg rel="noopener">
            <Telegram size={16} />
            Botni ochish
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero ── */}
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
                  className={c.btnG}
                  data-t="cta"
                  data-t-id="v7_hero"
                  data-tg
                  rel="noopener"
                >
                  <Telegram size={18} />
                  {s.cta_primary}
                </a>
                <a href="#jarayon" className={c.btnO} data-t="click" data-t-id="v7_hero_steps">
                  Qanday ishlaydi?
                </a>
              </div>

              <ul className={c.pay}>
                <li>
                  <Check size={13} /> Aniq narx
                </li>
                <li>
                  <Check size={13} /> Humo · Uzcard · Payme
                </li>
                <li>
                  <Check size={13} /> {s.reviews_count} foydalanuvchi
                </li>
              </ul>
            </div>

            {/* Narx paneli — manbadagi "referal havola" qutisining shakli,
                bu yerda esa asosiy raqamni ko'rsatadi */}
            <div className={c.priceCard}>
              <p className={c.priceLab}>1 ovoz narxi</p>
              <p className={c.priceFig}>
                <span className={`${c.priceNum} tnum`}>{s.price_one_vote}</span>
                <span className={c.priceCur}>so‘m</span>
              </p>
              <p className={c.priceHint}>Katta paketlarda bir ovoz arzonroq</p>
            </div>
          </div>
        </section>

        {/* ── Ko'rsatkichlar: manbadagi `.num` qator uslubida ── */}
        <section className={c.statsSec} aria-label="Ko'rsatkichlar">
          <div className={c.statsIn}>
            {stats.map((it) => (
              <div key={it.lab} className={c.stat}>
                <span className={c.statLab}>{it.lab}</span>
                <span className={`${c.statNum} tnum`}>{it.num}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3 qadam ── */}
        <section id="jarayon" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Jarayon</p>
            <h2 className={c.h2}>3 qadam, xolos</h2>
            <p className={c.secSub}>Ro'yxatdan o'tish yo'q. Hujjat yo'q. Faqat ovoz va to'lov.</p>

            <ol className={c.grid3}>
              {LANDING_STEPS.map((step) => (
                <li key={step.n} className={c.sc}>
                  <span className={`${c.scNo} tnum`}>{`0${step.n}`}</span>
                  <h3 className={c.scH}>{step.title}</h3>
                  <p className={c.scP}>{step.text}</p>
                </li>
              ))}
            </ol>

            <div className={c.secAct}>
              <a href={tg} className={c.btnG} data-t="cta" data-t-id="v7_steps" data-tg rel="noopener">
                <Telegram size={18} />
                Hoziroq boshlash
              </a>
            </div>
          </div>
        </section>

        {/* ── Mukofot ── */}
        <section id="mukofot" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Mukofot</p>
            <h2 className={c.h2}>Nima olasiz</h2>
            <p className={c.secSub}>Ovoz bergandan so'ng avtomatik to'lanadi.</p>

            <ul className={c.rGrid}>
              {LANDING_REWARDS.map((r, i) => (
                <li key={r.tag} className={`${c.rCard} ${i === 2 ? c.rCardHot : ''}`}>
                  <span className={c.rTag}>{r.tag}</span>
                  <p className={c.rTitle}>{r.title}</p>
                  <p className={c.rFig}>
                    <span className={`${c.rNum} tnum`}>{r.amount}</span>
                    {r.unit && <span className={c.rUnit}>{r.unit}</span>}
                  </p>
                  <p className={c.rDesc}>{r.desc}</p>
                </li>
              ))}
            </ul>

            <div className={c.secAct}>
              <a
                href={tg}
                className={c.btnG}
                data-t="cta"
                data-t-id="v7_rewards"
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
                className={c.btnG}
                data-t="cta"
                data-t-id="v7_final"
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
            data-t-id="v7_foot_bot"
            data-tg
            rel="noopener"
          >
            @{bot}
          </a>
        </div>
      </footer>

      {/* ── Variant almashtirgich: A/B ni qo'lda solishtirish uchun ── */}
      <nav className={c.switcher} aria-label="Dizayn variantlari">
        <a href="/1">1</a>
        <a href="/2">2</a>
        <a href="/3">3</a>
        <a href="/4">4</a>
        <a href="/5">5</a>
        <a href="/6">6</a>
        <a href="/7" className={c.swOn} aria-current="page">
          7
        </a>
        <a href="/8">8</a>
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
