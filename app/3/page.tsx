import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { FALLBACK_PRICES, SITE, applyVars, kindOf, pricePerLine, uzs } from '@/lib/content';
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
  title: 'Ovoz paketlari',
  robots: { index: false, follow: false },
};

/** Qadamlar statik — rasmiy openbudget.uz ovoz berish jarayoni, o'zgarmaydi */
const STEPS = [
  {
    n: '1',
    t: 'Tashabbus raqamini oling',
    d: 'Har tashabbusning o‘z raqami bor. Qo‘llab-quvvatlamoqchi bo‘lgan loyiha raqamini yozib oling.',
  },
  {
    n: '2',
    t: 'openbudget.uz’da toping',
    d: 'Portalga kirib qidiruvga raqamni yozing va tashabbus sahifasida «Ovoz berish» tugmasini bosing.',
  },
  {
    n: '3',
    t: 'SMS bilan tasdiqlang',
    d: 'Telefon raqamingizni kiriting — kelgan kodni yozganingizda ovoz hisobga o‘tadi. To‘lov ham, hujjat ham kerak emas.',
  },
] as const;

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

  const prices = FALLBACK_PRICES.filter((p) => kindOf(p.sku) === 'ovoz');

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
                <a href="#narxlar" className={st.btnGhost}>
                  Narxlarni ko‘rish
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
            <div className={st.stat}>
              <span className={`${st.statNum} tnum`}>{s.reviews_count}</span>
              <span className={st.statLab}>foydalanuvchi tanlagan</span>
            </div>
            <div className={st.stat}>
              {/* Soni ro'yxatdan olinadi — paket qo'shilsa raqam o'zi yangilanadi */}
              <span className={`${st.statNum} tnum`}>{prices.length}</span>
              <span className={st.statLab}>tayyor paket</span>
            </div>
            <div className={st.stat}>
              <span className={`${st.statNum} tnum`}>3</span>
              <span className={st.statLab}>to‘lov usuli — Humo · Uzcard · Payme</span>
            </div>
            <div className={st.stat}>
              <span className={`${st.statNum} tnum`}>
                ≈1<span className={st.statUnit}> daqiqa</span>
              </span>
              <span className={st.statLab}>to‘lov tasdig‘i</span>
            </div>
          </div>
        </section>

        {/* ── Narx paketlari ── */}
        <section className={st.prices} id="narxlar">
          <h2 className={st.h2}>
            Ovoz <span className={st.gradWord}>paketlari</span>
          </h2>
          <p className={st.sectionSub}>Paket qancha katta bo‘lsa, bir ovoz shuncha arzon.</p>

          <div className={st.grid}>
            {prices.map((p) => {
              const featured = p.badge === 'Eng foydali';
              return (
                <a
                  key={p.id}
                  href={tg}
                  className={featured ? st.cardFeat : st.card}
                  data-t="cta"
                  data-t-id="v3_price"
                  data-tg
                  rel="noopener"
                >
                  {p.badge && (
                    <span className={featured ? st.badgeFeat : st.badge}>{p.badge}</span>
                  )}
                  <span className={st.cardTitle}>{p.title}</span>
                  <span className={st.cardPrice}>
                    <span className="tnum">{uzs(p.priceUzs)}</span>
                    <small> so‘m</small>
                  </span>
                  {p.oldPriceUzs !== null && (
                    <s className={`${st.cardOld} tnum`}>{uzs(p.oldPriceUzs)} so‘m</s>
                  )}
                  <span className={st.cardPer}>{pricePerLine('ovoz', p.priceUzs / p.amount)}</span>
                  <span className={st.cardGo} aria-hidden="true">
                    Tanlash
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── Qanday ishlaydi: gorizontal timeline ── */}
        <section className={st.how}>
          <h2 className={st.h2}>
            Qanday ovoz <span className={st.gradWord}>beriladi</span>
          </h2>
          <p className={st.sectionSub}>
            Uch qadam — telefon qo‘lingizda bo‘lsa, bir daqiqa kifoya. Ovoz berish bepul,
            muddatlar openbudget.uz’da.
          </p>

          <ol className={st.timeline}>
            {STEPS.map((step) => (
              <li key={step.n} className={st.step}>
                <span className={st.stepNum} aria-hidden="true">
                  <span className={st.stepNumIn}>{step.n}</span>
                </span>
                <h3 className={st.stepTitle}>{step.t}</h3>
                <p className={st.stepDesc}>{step.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Savol-javob: shisha akkordeon ──
            Native <details> — client JS'siz ochilib-yopiladi, sahifa server
            component bo'lib qoladi. Belgi (+/×) faqat CSS'da buriladi. */}
        <section className={st.faq}>
          <p className={st.faqKick}>Savol-javob</p>
          <h2 className={st.h2}>
            Savollarga <span className={st.gradWord}>javob</span>
          </h2>

          <div className={st.faqList}>
            <details className={st.faqItem}>
              <summary className={st.faqQ}>Bot qanday ishlaydi?</summary>
              <p className={st.faqA}>
                Telegram’da @{bot} ni ochasiz, /start bosasiz, paketni tanlab
                to‘laysiz. Hammasi bot ichida — saytga qaytish shart emas.
              </p>
            </details>

            <details className={st.faqItem}>
              <summary className={st.faqQ}>Ro‘yxatdan o‘tish kerakmi?</summary>
              <p className={st.faqA}>
                Yo‘q. Telegram hisobingiz yetarli — parol ham, email ham,
                hujjat ham so‘ralmaydi.
              </p>
            </details>

            <details className={st.faqItem}>
              <summary className={st.faqQ}>Qaysi kartalar bilan to‘lash mumkin?</summary>
              <p className={st.faqA}>
                Humo, Uzcard va Payme. To‘lov bot ichida rasmiy to‘lov tizimi
                orqali o‘tadi.
              </p>
            </details>

            <details className={st.faqItem}>
              <summary className={st.faqQ}>Narx qancha?</summary>
              <p className={st.faqA}>
                1 ovoz — {s.price_one_vote} so‘mdan. Katta paketlarda bir ovoz
                narxi arzonroq — yuqoridagi paketlar bo‘limiga qarang.
              </p>
            </details>

            <details className={st.faqItem}>
              <summary className={st.faqQ}>
                Savolim bor yoki muammo chiqdi — kimga yozaman?
              </summary>
              <p className={st.faqA}>
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
        </section>

        {/* ── Yakuniy CTA: aurora panel ichida oq tugma ── */}
        <section className={st.finale}>
          <div className={st.finaleIn}>
            <h2 className={st.finaleTitle}>Ovozingiz tayyor — faqat tanlash qoldi</h2>
            <p className={st.finaleSub}>{SITE.tgline}. Narx oldindan ma’lum, ortiqcha to‘lov yo‘q.</p>
            <a href={tg} className={st.btnLight} data-t="cta" data-t-id="v3_final" data-tg rel="noopener">
              {s.cta_primary}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            {/* Bot manzili ochiq matnda — tugmani emas, manzilni izlagan ham topsin */}
            <a
              href={tg}
              className={st.finaleHandle}
              data-t="cta"
              data-t-id="v3_bot_handle"
              data-tg
              rel="noopener"
            >
              @{bot}
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer: majburiy huquqiy izoh ── */}
      <footer className={st.foot}>
        <div className={st.footIn}>
          <div className={st.footBrand}>
            <Logo size={28} className={st.brandMark} />
            <span className={st.brandName}>{SITE.brand}</span>
          </div>
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
