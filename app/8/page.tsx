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
 * Variant 8 — «Neon signal».
 *
 * Uslub manbasi: files/12-chaqir-referral.html (demo referal-bot sahifasi).
 * Undan FAQAT dizayn tili olingan — to'q binafsha fon (#0B0416), pushti-
 * siyanit neon urg'u, Orbitron sarlavhalar (katta harf, keng treking).
 * Manbadagi reyting jadvali va jonli hisoblagich kabi vidjetlar bu yerda
 * YO'Q — ular referal-bot kontentiga xos, biznikiga aloqasi yo'q.
 *
 * Manbada uch o'lchamli to'lqin-panjara fon (three.js, tashqi CDN) bor
 * edi — bu yerda YO'Q: landing sahifa tashqi skriptga muhtoj bo'lmasligi
 * kerak. Kayfiyat CSS'ning o'zi bilan — synthwave "quyosh" (radial-gradient
 * + skanerlash chizig'i) va yulduzli fon — beriladi.
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

/** Marquee bir marta aniqlanadi — ikki nusxada aynan shu ro'yxat aylanadi */
function marqueeItems(reviews: string): string[] {
  return [
    'Humo · Uzcard · Payme',
    'Aniq narx',
    `${reviews} foydalanuvchi`,
    'Yashirin komissiya yo‘q',
    'Bir necha daqiqada',
  ];
}

export default async function VariantNeon() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);
  const stats = liveStats(s);
  const faq = landingFaqItems(s);
  const ticker = marqueeItems(s.reviews_count);

  return (
    <div className={c.page}>
      {/* Fon: yulduzlar + pastda nozik perspektiv panjara. Alohida qatlam —
          matn ustiga animatsiya yuqmasin */}
      <div className={c.sky} aria-hidden>
        <span className={c.stars} />
        <span className={c.floor} />
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
            <a href="#jarayon">Qadamlar</a>
            <a href="#mukofot">Mukofot</a>
            <a href="#savol-javob">Savollar</a>
          </nav>

          <a href={tg} className={c.btnSm} data-t="cta" data-t-id="v8_header" data-tg rel="noopener">
            <Telegram size={16} />
            Botni ochish
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero: synthwave "quyosh" fonda ── */}
        <section className={c.hero}>
          <div className={c.sun} aria-hidden />
          <div className={c.heroIn}>
            {s.hero_badge ? <p className={c.chip}>{s.hero_badge}</p> : null}

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
                className={c.btnP}
                data-t="cta"
                data-t-id="v8_hero"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                {s.cta_primary}
              </a>
              <a href="#jarayon" className={c.btnC} data-t="click" data-t-id="v8_hero_steps">
                Qanday ishlaydi?
              </a>
            </div>

            {/* Narx paneli — manbadagi "jami to'landi" hisoblagichining shakli,
                bu yerda esa asosiy raqamni ko'rsatadi */}
            <div className={c.total}>
              <span>1 ovoz narxi</span>
              <b className={`${c.totalNum} tnum`}>
                {s.price_one_vote} <i>so‘m</i>
              </b>
            </div>
          </div>
        </section>

        {/* ── Yuguruvchi lenta ── */}
        <div className={c.tick} aria-hidden>
          <div className={c.tickTrack}>
            {[0, 1].map((copy) => (
              <div key={copy} className={c.tickRow}>
                {ticker.map((t) => (
                  <span key={t} className={c.tc}>
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Ko'rsatkichlar ── */}
        <section className={c.statsSec} aria-label="Ko'rsatkichlar">
          <div className={c.statsIn}>
            {stats.map((it, i) => (
              <div key={it.lab} className={`${c.stat} ${i % 2 ? c.statC : c.statP}`}>
                <span className={`${c.statNum} tnum`}>{it.num}</span>
                <span className={c.statLab}>{it.lab}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Qadamlar ── */}
        <section id="jarayon" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Qadamlar</p>
            <h2 className={c.h2}>Sarmoyasiz. Faqat ovoz</h2>
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
              <a
                href={tg}
                className={c.btnP}
                data-t="cta"
                data-t-id="v8_steps"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                Hoziroq boshlash
              </a>
            </div>
          </div>
        </section>

        {/* ── Mukofot: raqamlangan qator uslubida ── */}
        <section id="mukofot" className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Mukofot</p>
            <h2 className={c.h2}>Nima olasiz</h2>
            <p className={c.secSub}>Ovoz bergandan so'ng avtomatik to'lanadi.</p>

            <ol className={c.rList}>
              {LANDING_REWARDS.map((r, i) => (
                <li key={r.tag} className={`${c.rRow} ${i === 2 ? c.rRowHot : ''}`}>
                  <span className={`${c.rk} tnum`}>{`0${i + 1}`}</span>
                  <div className={c.rWho}>
                    <b>{r.title}</b>
                    <span>{r.tag}</span>
                  </div>
                  <p className={c.rSum}>
                    <span className="tnum">{r.amount}</span>
                    {r.unit && <i>{r.unit}</i>}
                  </p>
                </li>
              ))}
            </ol>
            <p className={c.rNote}>
              {LANDING_REWARDS.map((r) => r.desc).join(' ')}
            </p>

            <div className={c.secAct}>
              <a
                href={tg}
                className={c.btnP}
                data-t="cta"
                data-t-id="v8_rewards"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                Mukofot olishni boshlash
              </a>
            </div>
          </div>
        </section>

        {/* ── To'lov usullari ── */}
        <section className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Yechib olish</p>
            <h2 className={c.h2}>Pul qayerga tushadi?</h2>

            <ul className={c.pays}>
              <li className={c.pc}>
                <Check size={16} /> Humo
              </li>
              <li className={c.pc}>
                <Check size={16} /> Uzcard
              </li>
              <li className={c.pc}>
                <Check size={16} /> Payme
              </li>
              <li className={c.pc}>
                <Check size={16} /> {s.reviews_count} foydalanuvchi
              </li>
            </ul>
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
                className={c.btnP}
                data-t="cta"
                data-t-id="v8_final"
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
            data-t-id="v8_foot_bot"
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
        <a href="/7">7</a>
        <a href="/8" className={c.swOn} aria-current="page">
          8
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
