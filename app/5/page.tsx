import type { Metadata } from 'next';

import Logo from '@/components/Logo';
import Tracker from '@/components/Tracker';
import { Telegram, Check } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE, FALLBACK_PRICES, applyVars, kindOf, titleLines, uzs, pricePerLine } from '@/lib/content';
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
  title: 'Ovoz paketlari',
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
  const packs = FALLBACK_PRICES.filter((p) => kindOf(p.sku) === 'ovoz');
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

        {/* ── Statistika: pastel pill kartalar ──
            Faqat strukturaviy faktlar — tekshirib bo'ladigan raqamlar,
            hech qanday natija yoki daromad va'dasi yo'q */}
        <section className={c.statsSec} aria-label="Xizmat ko‘rsatkichlari">
          <ul className={c.stats}>
            <li className={`${c.stat} ${c.stBlue}`}>
              <span className={`${c.statNum} tnum`}>{s.reviews_count}</span>
              <span className={c.statLab}>foydalanuvchi tanlagan</span>
            </li>
            <li className={`${c.stat} ${c.stPink}`}>
              {/* packs.length — raqam paketlar to'ri bilan doim sinxron */}
              <span className={`${c.statNum} tnum`}>{packs.length}</span>
              <span className={c.statLab}>tayyor paket</span>
            </li>
            <li className={`${c.stat} ${c.stMint}`}>
              <span className={`${c.statNum} tnum`}>3</span>
              <span className={c.statLab}>to‘lov usuli</span>
              <span className={c.statNote}>Humo · Uzcard · Payme</span>
            </li>
            <li className={`${c.stat} ${c.stPeach}`}>
              <span className={`${c.statNum} tnum`}>
                ≈1<span className={c.statUnit}>daqiqa</span>
              </span>
              <span className={c.statLab}>to‘lov tasdig‘i</span>
            </li>
          </ul>
        </section>

        {/* ── Narx paketlari ── */}
        <section className={c.sec} id="paketlar">
          <div className={c.secIn}>
            <p className={c.kicker}>Paketlar</p>
            <h2 className={c.h2}>
              Ovoz paketini <span className={c.h2Hl}>tanlang</span>
            </h2>
            <p className={c.secSub}>Ko‘proq ovoz — bir ovoz narxi arzonroq. Hammasi bitta to‘lovda.</p>

            <ul className={c.grid}>
              {packs.map((p, i) => (
                <li
                  key={p.id}
                  className={`${c.card} ${c[`cap${i % 4}` as keyof typeof c]} ${p.badge ? c.cardHot : ''}`}
                >
                  {p.badge && (
                    <span className={c.cardBadge}>
                      <Spark className={c.cardBadgeStar} />
                      {p.badge}
                    </span>
                  )}
                  <p className={c.cardAmt}>
                    <span className={`${c.cardNum} tnum`}>{p.amount}</span>
                    <span className={c.cardUnit}>ovoz</span>
                  </p>
                  <p className={c.cardPrice}>
                    <span className="tnum">{uzs(p.priceUzs)}</span> so‘m
                  </p>
                  {p.oldPriceUzs && (
                    <p className={c.cardOld}>
                      <s className="tnum">{uzs(p.oldPriceUzs)} so‘m</s>
                    </p>
                  )}
                  <p className={c.cardPer}>{pricePerLine('ovoz', p.priceUzs / p.amount)}</p>
                  <a
                    href={tg}
                    className={c.cardBtn}
                    data-t="cta"
                    data-t-id={`v5_card_${p.amount}`}
                    data-tg
                    rel="noopener"
                  >
                    Tanlash
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Qanday ishlaydi: uch gradient shar ── */}
        <section className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Jarayon</p>
            <h2 className={c.h2}>Qanday ishlaydi</h2>

            <ol className={c.steps}>
              <li className={c.step}>
                <span className={`${c.stepBall} ${c.ballBlue} tnum`}>1</span>
                <h3 className={c.stepH}>Botga o‘ting</h3>
                <p className={c.stepP}>Telegram’da @{bot} botini oching — ro‘yxatdan o‘tish shart emas.</p>
              </li>
              <li className={c.step}>
                <span className={`${c.stepBall} ${c.ballPink} tnum`}>2</span>
                <h3 className={c.stepH}>Ovoz sonini tanlang</h3>
                <p className={c.stepP}>Paketni bosing — narx darhol ko‘rinadi, yashirin komissiya yo‘q.</p>
              </li>
              <li className={c.step}>
                <span className={`${c.stepBall} ${c.ballMint} tnum`}>3</span>
                <h3 className={c.stepH}>To‘lang</h3>
                <p className={c.stepP}>Humo, Uzcard yoki Payme — to‘lov bir daqiqada tasdiqlanadi.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ── FAQ: native details/summary ──
            Client JS yo'q — sahifa server component bo'lib qoladi.
            Ochish belgisi (+/–) faqat CSS: details[open] holatida
            vertikal chiziq yotib, plus minusga aylanadi */}
        <section className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Savol-javob</p>
            <h2 className={c.h2}>
              Savollarga <span className={c.h2Hl}>javob</span>
            </h2>

            <div className={c.faq}>
              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Bot qanday ishlaydi?
                  <span className={c.faqMark} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  Telegram’da @{bot} ni ochasiz, /start bosasiz, paketni tanlab to‘laysiz. Hammasi
                  bot ichida — saytga qaytish shart emas.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Ro‘yxatdan o‘tish kerakmi?
                  <span className={c.faqMark} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  Yo‘q. Telegram hisobingiz yetarli — parol ham, email ham, hujjat ham so‘ralmaydi.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Qaysi kartalar bilan to‘lash mumkin?
                  <span className={c.faqMark} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  Humo, Uzcard va Payme. To‘lov bot ichida rasmiy to‘lov tizimi orqali o‘tadi.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Narx qancha?
                  <span className={c.faqMark} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  1 ovoz — {s.price_one_vote} so‘mdan. Katta paketlarda bir ovoz narxi arzonroq —
                  yuqoridagi paketlar bo‘limiga qarang.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Savolim bor yoki muammo chiqdi — kimga yozaman?
                  <span className={c.faqMark} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  <a
                    href={`https://t.me/${s.support_username}`}
                    rel="noopener"
                    data-t="click"
                    data-t-id="support"
                  >
                    @{s.support_username}
                  </a>{' '}
                  ga yozing — tez javob beramiz.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ── Yakuniy CTA: gradient panel, oq squish tugma ── */}
        <section className={c.finalSec}>
          <div className={c.final}>
            <Spark className={`${c.spark} ${c.sparkFinal}`} />
            <h2 className={c.finalH}>Ovozingiz hal qiladi</h2>
            <p className={c.finalP}>
              {s.reviews_count} foydalanuvchi allaqachon tanladi. Narx — {s.price_one_vote} so‘mdan.
            </p>
            <a
              href={tg}
              className={`${c.cta} ${c.ctaLight}`}
              data-t="cta"
              data-t-id="v5_final"
              data-tg
              rel="noopener"
            >
              <Telegram size={20} className={c.ctaIco} />
              {s.cta_primary}
            </a>
            {/* Bot manzili tugma ostida ochiq turadi — odam tugmani emas,
                @manzilni qidirsa ham shu yerdan topadi */}
            <a
              href={tg}
              className={c.finalHandle}
              data-t="cta"
              data-t-id="v5_bot_handle"
              data-tg
              rel="noopener"
            >
              @{bot}
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer: majburiy huquqiy izoh ── */}
      <footer className={c.foot}>
        <p className={c.legal}>
          {SITE.brand} — mustaqil vositachi xizmat. Rasmiy openbudget.uz portali bilan bog‘liq
          emas. Savol bo‘lsa —{' '}
          <a href={`https://t.me/${s.support_username}`} rel="noopener" data-t="click" data-t-id="support">
            @{s.support_username}
          </a>
        </p>
      </footer>

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
