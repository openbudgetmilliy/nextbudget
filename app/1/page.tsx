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
  title: 'Ovoz paketlari',
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
  const packs = FALLBACK_PRICES.filter((p) => kindOf(p.sku) === 'ovoz');
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
            <p className={c.badge}>
              <span className={c.badgeDot} />
              {s.hero_badge}
            </p>

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

        {/* ── Statistika qatori: faqat strukturaviy faktlar — va'da emas ── */}
        <section className={c.statsSec} aria-label="Xizmat ko‘rsatkichlari">
          <div className={c.secIn}>
            <ul className={c.stats}>
              <li className={c.stat}>
                <span className={`${c.statNum} tnum`}>{s.reviews_count}</span>
                <span className={c.statLab}>foydalanuvchi tanlagan</span>
              </li>
              <li className={c.stat}>
                {/* «6» qo'lda yozilmaydi — paket ro'yxati o'zgarsa raqam ham ergashadi */}
                <span className={`${c.statNum} tnum`}>{packs.length}</span>
                <span className={c.statLab}>tayyor paket</span>
              </li>
              <li className={c.stat}>
                <span className={`${c.statNum} tnum`}>3</span>
                <span className={c.statLab}>to‘lov usuli</span>
                <span className={c.statNote}>Humo · Uzcard · Payme</span>
              </li>
              <li className={c.stat}>
                <span className={`${c.statNum} tnum`}>
                  ≈1 <span className={c.statUnit}>daqiqa</span>
                </span>
                <span className={c.statLab}>to‘lov tasdig‘i</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Narx paketlari ── */}
        <section className={c.sec} id="paketlar">
          <div className={c.secIn}>
            <p className={c.kicker}>Paketlar</p>
            <h2 className={c.h2}>Ovoz paketini tanlang</h2>
            <p className={c.secSub}>Ko‘proq ovoz — bir ovoz narxi arzonroq. Hammasi bitta to‘lovda.</p>

            <ul className={c.grid}>
              {packs.map((p) => (
                <li key={p.id} className={p.badge ? `${c.card} ${c.cardHot}` : c.card}>
                  {p.badge && <span className={c.cardBadge}>{p.badge}</span>}
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
                    data-t-id={`v1_card_${p.amount}`}
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

        {/* ── Qanday ishlaydi: 3 qadam ── */}
        <section className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Jarayon</p>
            <h2 className={c.h2}>Qanday ovoz beriladi</h2>
            <p className={c.secSub}>Uch qadam — telefon qo‘lingizda bo‘lsa, bir daqiqa kifoya.</p>

            <ol className={c.steps}>
              <li className={c.step}>
                <span className={c.stepNum}>1</span>
                <h3 className={c.stepH}>Tashabbus raqamini oling</h3>
                <p className={c.stepP}>Har tashabbusning o‘z raqami bor. Qo‘llab-quvvatlamoqchi bo‘lgan loyiha raqamini yozib oling.</p>
              </li>
              <li className={c.step}>
                <span className={c.stepNum}>2</span>
                <h3 className={c.stepH}>openbudget.uz’da toping</h3>
                <p className={c.stepP}>Portalga kirib qidiruvga raqamni yozing va tashabbus sahifasida «Ovoz berish» tugmasini bosing.</p>
              </li>
              <li className={c.step}>
                <span className={c.stepNum}>3</span>
                <h3 className={c.stepH}>SMS bilan tasdiqlang</h3>
                <p className={c.stepP}>Telefon raqamingizni kiriting — kelgan kodni yozganingizda ovoz hisobga o‘tadi. To‘lov ham, hujjat ham kerak emas.</p>
              </li>
            </ol>
            <p className={c.secSub}>
              Ovoz berish bepul, mavsum ochiq paytida ishlaydi — muddatlar openbudget.uz’da.
            </p>
          </div>
        </section>

        {/* ── FAQ: native details/summary — client JS'siz, sahifa server component
            bo'lib qoladi. Ochish belgisi (+/–) faqat CSS bilan almashadi ── */}
        <section className={c.sec}>
          <div className={c.secIn}>
            <p className={c.kicker}>Savol-javob</p>
            <h2 className={c.h2}>Savollarga javob</h2>

            <div className={c.faq}>
              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Bot qanday ishlaydi?
                  <span className={c.faqIco} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  Telegram’da @{bot} ni ochasiz, /start bosasiz, paketni tanlab to‘laysiz. Hammasi
                  bot ichida — saytga qaytish shart emas.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Ro‘yxatdan o‘tish kerakmi?
                  <span className={c.faqIco} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  Yo‘q. Telegram hisobingiz yetarli — parol ham, email ham, hujjat ham so‘ralmaydi.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Qaysi kartalar bilan to‘lash mumkin?
                  <span className={c.faqIco} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  Humo, Uzcard va Payme. To‘lov bot ichida rasmiy to‘lov tizimi orqali o‘tadi.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Narx qancha?
                  <span className={c.faqIco} aria-hidden />
                </summary>
                <p className={c.faqA}>
                  1 ovoz — {s.price_one_vote} so‘mdan. Katta paketlarda bir ovoz narxi arzonroq —
                  yuqoridagi paketlar bo‘limiga qarang.
                </p>
              </details>

              <details className={c.faqItem}>
                <summary className={c.faqQ}>
                  Savolim bor yoki muammo chiqdi — kimga yozaman?
                  <span className={c.faqIco} aria-hidden />
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

        {/* ── Yakuniy CTA ── */}
        <section className={c.finalSec}>
          <div className={c.final}>
            <h2 className={c.finalH}>
              Ovozingiz <span className={c.finalHl}>hal qiladi</span>
            </h2>
            <p className={c.finalP}>
              {s.reviews_count} foydalanuvchi allaqachon tanladi. Narx — {s.price_one_vote} so‘mdan.
            </p>
            <a
              href={tg}
              className={c.cta}
              data-t="cta"
              data-t-id="v1_final"
              data-tg
              rel="noopener"
            >
              <Telegram size={22} />
              {s.cta_primary}
            </a>
            {/* Bot manzili matn ko'rinishida ham — tugmani emas, manzilni
                qidirgan odam ham shu yerda topsin */}
            <p className={c.finalBot}>
              Bot manzili —{' '}
              <a href={tg} data-t="cta" data-t-id="v1_bot_handle" data-tg rel="noopener">
                @{bot}
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer: majburiy huquqiy izoh ── */}
      <footer className={c.foot}>
        <div className={c.footIn}>
          <p className={c.legal}>
            {SITE.brand} — mustaqil vositachi xizmat. Rasmiy openbudget.uz portali bilan bog‘liq
            emas. Savol bo‘lsa —{' '}
            <a
              href={`https://t.me/${s.support_username}`}
              rel="noopener"
              data-t="click"
              data-t-id="support"
            >
              @{s.support_username}
            </a>
          </p>
        </div>
      </footer>

      {/* ── Variant almashtirgich: A/B ni qo'lda solishtirish uchun ── */}
      <nav className={c.switcher} aria-label="Dizayn variantlari">
        <a href="/1" className={c.swOn} aria-current="page">
          1
        </a>
        <a href="/2">2</a>
        <a href="/3">3</a>
        <a href="/4">4</a>
        <a href="/5">5</a>
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
