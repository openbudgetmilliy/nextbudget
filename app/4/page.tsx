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
  title: 'Ovoz paketlari',
  robots: { index: false, follow: false },
};

/**
 * Paket katagining bento o'lchami va rangi.
 *
 * DOM tartibi ataylab narx tartibidan farq qiladi: kataklar 4 ustunli
 * mozaikani BO'SH JOYSIZ to'ldiradigan qilib terilgan (5→1→3→25→10→50).
 * Tartibni o'zgartirsangiz desktop'da teshik ochiladi.
 */
const PACK_CELL: Record<string, string> = {
  ovoz_5: `${c.pk} ${c.pkWide} ${c.pkBlue}`,
  ovoz_1: `${c.pk}`,
  ovoz_3: `${c.pk}`,
  ovoz_25: `${c.pk} ${c.pkBig} ${c.pkViolet}`,
  ovoz_10: `${c.pk}`,
  ovoz_50: `${c.pk} ${c.pkWide} ${c.pkOrange}`,
};

const PACK_ORDER = ['ovoz_5', 'ovoz_1', 'ovoz_3', 'ovoz_25', 'ovoz_10', 'ovoz_50'];

export default async function VariantBento() {
  const s = await getSettings();
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const tg = tgLink(bot, 'web');

  const vars = { narx: s.price_one_vote };
  // `|` dan keyingi qism narxni takrorlaydi — narx alohida katakda katta
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  const bySku = new Map(FALLBACK_PRICES.filter((p) => kindOf(p.sku) === 'ovoz').map((p) => [p.sku, p]));
  const packs = PACK_ORDER.map((sku) => bySku.get(sku)!).filter(Boolean);

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
            <p className={c.badge}>{s.hero_badge}</p>
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

        {/* ── Statistika qatori: to'rt halol fakt, mozaika ritmini davom ettiradi.
            Manba: reviews_count sozlamadan, qolgani sahifa strukturasining o'zi
            (6 paket, 3 to'lov usuli) — hech narsa o'ylab topilmagan ── */}
        <section className={c.statRow} aria-label="Raqamlarda">
          <div className={`${c.stat} ${c.statGreen}`}>
            <p className={`${c.statNum} tnum`}>{s.reviews_count}</p>
            <p className={c.statLab}>foydalanuvchi tanlagan</p>
          </div>
          <div className={`${c.stat} ${c.statSky}`}>
            <p className={`${c.statNum} tnum`}>6</p>
            <p className={c.statLab}>tayyor paket</p>
          </div>
          <div className={`${c.stat} ${c.statLemon}`}>
            <p className={`${c.statNum} tnum`}>3</p>
            <p className={c.statLab}>to‘lov usuli</p>
            <p className={c.statNote}>Humo · Uzcard · Payme</p>
          </div>
          <div className={`${c.stat} ${c.statOrange}`}>
            <p className={c.statNum}>
              <span className="tnum">≈1</span> <span className={c.statUnit}>daqiqa</span>
            </p>
            <p className={c.statLab}>to‘lov tasdig‘i</p>
          </div>
        </section>

        {/* ── Narx paketlari: bento davom etadi ── */}
        <section className={c.sec} id="paketlar">
          <p className={c.kicker}>Paketlar</p>
          <h2 className={c.h2}>Ovoz paketini tanlang</h2>
          <p className={c.secSub}>Ko‘proq ovoz — bir ovoz narxi arzonroq. Hammasi bitta to‘lovda.</p>

          <ul className={c.pkGrid}>
            {packs.map((p) => (
              <li key={p.id} className={PACK_CELL[p.sku] ?? c.pk}>
                {p.badge && <span className={c.pkBadge}>{p.badge}</span>}
                <p className={c.pkAmt}>
                  <span className={`${c.pkNum} tnum`}>{p.amount}</span>
                  <span className={c.pkUnit}>ovoz</span>
                </p>
                <p className={c.pkPrice}>
                  <span className="tnum">{uzs(p.priceUzs)}</span> so‘m
                </p>
                {p.oldPriceUzs && (
                  <p className={c.pkOld}>
                    <s className="tnum">{uzs(p.oldPriceUzs)} so‘m</s>
                  </p>
                )}
                <p className={c.pkPer}>{pricePerLine('ovoz', p.priceUzs / p.amount)}</p>
                <a
                  href={tg}
                  className={c.pkBtn}
                  data-t="cta"
                  data-t-id={`v4_card_${p.amount}`}
                  data-tg
                  rel="noopener"
                >
                  Tanlash
                </a>
              </li>
            ))}

            {/* Mozaika to'ldiruvchi katak: bo'sh joy o'rniga yakuniy da'vat */}
            <li className={`${c.pk} ${c.pkWide} ${c.pkInk}`}>
              <p className={c.pkCtaTxt}>Qaysi paket sizniki? Botda tanlash osonroq.</p>
              <a
                href={tg}
                className={c.pkBtn}
                data-t="cta"
                data-t-id="v4_card_all"
                data-tg
                rel="noopener"
              >
                <Telegram size={15} />
                Botda ochish
              </a>
            </li>
          </ul>
        </section>

        {/* ── Qanday ishlaydi: 3 rangli qadam-katak ── */}
        <section className={c.sec}>
          <p className={c.kicker}>Jarayon</p>
          <h2 className={c.h2}>Qanday ovoz beriladi</h2>
          <p className={c.secSub}>Uch qadam — telefon qo‘lingizda bo‘lsa, bir daqiqa kifoya.</p>

          <ol className={c.steps}>
            <li className={`${c.step} ${c.stepSky}`}>
              <span className={`${c.stepNum} tnum`}>1</span>
              <h3 className={c.stepH}>Tashabbus raqamini oling</h3>
              <p className={c.stepP}>Har tashabbusning o‘z raqami bor. Qo‘llab-quvvatlamoqchi bo‘lgan loyiha raqamini yozib oling.</p>
            </li>
            <li className={`${c.step} ${c.stepLemon}`}>
              <span className={`${c.stepNum} tnum`}>2</span>
              <h3 className={c.stepH}>openbudget.uz’da toping</h3>
              <p className={c.stepP}>Portalga kirib qidiruvga raqamni yozing va tashabbus sahifasida «Ovoz berish» tugmasini bosing.</p>
            </li>
            <li className={`${c.step} ${c.stepGreen}`}>
              <span className={`${c.stepNum} tnum`}>3</span>
              <h3 className={c.stepH}>SMS bilan tasdiqlang</h3>
              <p className={c.stepP}>Telefon raqamingizni kiriting — kelgan kodni yozganingizda ovoz hisobga o‘tadi. To‘lov ham, hujjat ham kerak emas.</p>
            </li>
          </ol>
          <p className={c.secSub}>
            Ovoz berish bepul, mavsum ochiq paytida ishlaydi — muddatlar openbudget.uz’da.
          </p>
        </section>

        {/* ── FAQ: eng ko'p so'raladigan 5 savol. Native <details> — client JS
            talab qilmaydi, sahifa server component bo'lib qolaveradi ── */}
        <section className={c.sec}>
          <p className={c.kicker}>Savol-javob</p>
          <h2 className={c.h2}>Savollarga javob</h2>

          <div className={c.faqList}>
            <details className={c.faq}>
              <summary className={c.faqQ}>Bot qanday ishlaydi?</summary>
              <p className={c.faqA}>
                Telegram’da @{bot} ni ochasiz, /start bosasiz, paketni tanlab to‘laysiz. Hammasi
                bot ichida — saytga qaytish shart emas.
              </p>
            </details>
            <details className={c.faq}>
              <summary className={c.faqQ}>Ro‘yxatdan o‘tish kerakmi?</summary>
              <p className={c.faqA}>
                Yo‘q. Telegram hisobingiz yetarli — parol ham, email ham, hujjat ham so‘ralmaydi.
              </p>
            </details>
            <details className={c.faq}>
              <summary className={c.faqQ}>Qaysi kartalar bilan to‘lash mumkin?</summary>
              <p className={c.faqA}>
                Humo, Uzcard va Payme. To‘lov bot ichida rasmiy to‘lov tizimi orqali o‘tadi.
              </p>
            </details>
            <details className={c.faq}>
              <summary className={c.faqQ}>Narx qancha?</summary>
              <p className={c.faqA}>
                1 ovoz — {s.price_one_vote} so‘mdan. Katta paketlarda bir ovoz narxi arzonroq —
                yuqoridagi paketlar bo‘limiga qarang.
              </p>
            </details>
            <details className={c.faq}>
              <summary className={c.faqQ}>Savolim bor yoki muammo chiqdi — kimga yozaman?</summary>
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
        </section>

        {/* ── Yakuniy CTA: ink panel, aylanuvchi gradient halqali tugma ── */}
        <section className={`${c.cell} ${c.finalPanel}`}>
          <h2 className={c.finalH}>
            Ovozingiz <span className={c.finalHl}>hal qiladi</span>
          </h2>
          <p className={c.finalP}>
            {s.reviews_count} foydalanuvchi allaqachon tanladi. Narx — {s.price_one_vote} so‘mdan.
          </p>
          <div className={c.ctaRing}>
            <a href={tg} className={c.cta} data-t="cta" data-t-id="v4_final" data-tg rel="noopener">
              <Telegram size={20} />
              {s.cta_primary}
              <span className={c.ctaArrow} aria-hidden>
                →
              </span>
            </a>
          </div>
          {/* Bot manzili matn ko'rinishida — tugmani emas, manzilni qidirgan odam ham topsin */}
          <p className={c.finalHandleRow}>
            Bot manzili —{' '}
            <a
              href={tg}
              className={c.finalHandle}
              data-t="cta"
              data-t-id="v4_bot_handle"
              data-tg
              rel="noopener"
            >
              @{bot}
            </a>
          </p>
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
        <a href="/4" className={c.swOn} aria-current="page">
          4
        </a>
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
