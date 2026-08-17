import type { Metadata } from 'next';

import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE, applyVars } from '@/lib/content';
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
 * Variant 6 — «Developer docs».
 *
 * Uslub api.starstg.uz hujjatlaridan olingan: chuqur siyoh #0a1538, elektr
 * ko'k #2f63ff, 18px radiusli oq kartalar #f3f6ff tusli fon ustida, juda
 * yumshoq va katta soyalar, mono yorliqlar va imzo elementi — traffic-light
 * nuqtali TO'Q PANEL. Faqat uslub olingan: bironta matn ham u yerdan emas.
 *
 * MATN /3 BILAN AYNAN BIR XIL manbadan keladi — `lib/landing-sections.ts`
 * va admin sozlamalari. Ya'ni narx yoki qadam matni o'zgarsa, ikkala sahifa
 * birga o'zgaradi.
 *
 * Nega `VariantSections` ishlatilmadi: u boshqa beshta variantning umumiy
 * skeletini beradi (sarlavha → to'r → karta). Docs uslubining o'zagi esa
 * boshqa shakllarda — jadval, callout, to'q panel va yon indeks. Ularni
 * class-xarita orqali "siqib" chiqarish uslubning suyultirilgan nusxasini
 * berardi. Shuning uchun bu yerda razmetka o'ziniki, MA'LUMOT esa umumiy.
 *
 * Sahifa to'liq statik (SSG); yagona client kod — Tracker.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasligi shart, aks holda trafik buziladi */
export const metadata: Metadata = {
  // Layout shabloni `· brend` qo'shadi — bu yerda takrorlanmaydi
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

/** To'q paneldagi «oyna» sarlavhasi — uchta chiroq nuqtasi */
function Dots() {
  return (
    <span className={c.dots} aria-hidden>
      <i /><i /><i />
    </span>
  );
}

/** O'ng tomonga uchuvchi strelka — CTA va havolalarda */
function Arrow({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Yon indeks bandlari — docs navigatsiyasidagi metod ro'yxati kabi */
const NAV = [
  { id: 'jarayon', group: 'Boshlash', label: '3 qadam, xolos', tag: '01' },
  { id: 'mukofot', group: 'Mukofot', label: 'Nima olasiz', tag: '02' },
  { id: 'savol-javob', group: 'Yordam', label: 'Savollarga javob', tag: '03' },
] as const;

export default async function VariantDocs() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  /** Bot manzili matn sifatida — «@» belgisisiz saqlanadi, UI o'zi qo'shadi */
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  /** `|` dan keyingi tarixiy qism narxni takrorlaydi — bu yerda kerak emas */
  const title = applyVars(s.hero_title, vars).split('|')[0].trim();
  /* Oxirgi so'z ko'k aksentda — ko'z sarlavhani o'qib, aksentda to'xtaydi */
  const words = title.split(/\s+/);
  const lastWord = words[words.length - 1];
  const headWords = words.slice(0, -1).join(' ');

  const stats = liveStats(s);
  const faq = landingFaqItems(s);

  return (
    <div className={c.page}>
      {/* ── Header: oq, yopishqoq, ostida soch chiziq ── */}
      <header className={c.hdr}>
        <div className={c.hdrIn}>
          <a href="#top" className={c.brand}>
            {/* Belgi gradienti faqat oq yuzada o'qiladi — oq plitka shart */}
            <span className={c.brandTile}>
              <Logo size={22} className={c.brandMark} />
            </span>
            <span className={c.brandName}>
              Milliy <b>jamoasi</b>
            </span>
          </a>

          <nav className={c.hdrNav} aria-label="Bo'limlar">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}>
                {n.label}
              </a>
            ))}
          </nav>

          <div className={c.hdrAct}>
            <a
              href={tg}
              className={c.btnGhost}
              data-t="cta"
              data-t-id="v6_header_bot"
              data-tg
              rel="noopener"
            >
              @{bot}
            </a>
            <a
              href={tg}
              className={c.btn}
              data-t="cta"
              data-t-id="v6_header"
              data-tg
              rel="noopener"
            >
              <Telegram size={16} />
              {s.cta_primary}
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ── Hero: chapda matn, o'ngda to'q «narx paneli» ── */}
        <section className={c.hero}>
          <div className={c.heroIn}>
            <div className={c.heroCopy}>
              <p className={c.eyebrow}>
                {s.hero_badge ? (
                  <>
                    {s.hero_badge} <span className={c.eyebrowDiv}>·</span>{' '}
                  </>
                ) : null}
                MUKOFOT DASTURI
              </p>

              <h1 className={c.h1}>
                {headWords && <>{headWords} </>}
                <span className={c.h1Accent}>{lastWord}</span>
              </h1>

              <p className={c.lede}>{applyVars(s.hero_sub, vars)}</p>

              <div className={c.ctaRow}>
                <a
                  href={tg}
                  className={c.btnLg}
                  data-t="cta"
                  data-t-id="v6_hero"
                  data-tg
                  rel="noopener"
                >
                  <Telegram size={18} />
                  {s.cta_primary}
                </a>
                <a
                  href="#jarayon"
                  className={c.btnQuiet}
                  data-t="click"
                  data-t-id="v6_hero_steps"
                >
                  Qanday ishlaydi
                  <Arrow className={c.btnQuietIco} />
                </a>
              </div>

              {/* Ishonch chiplari — docs'dagi mahsulot teglari kabi */}
              <ul className={c.chips}>
                <li>Aniq narx</li>
                <li>Humo · Uzcard · Payme</li>
                <li>{s.reviews_count} foydalanuvchi</li>
              </ul>
            </div>

            {/* ── Imzo element: to'q panel. Docs'da u API endpoint'ini
                ko'rsatadi, bu yerda esa asosiy raqamni — narxni ── */}
            <aside className={c.panel}>
              <div className={c.panelBar}>
                <Dots />
                <span className={c.panelName}>mukofot</span>
              </div>

              <div className={c.panelBody}>
                <p className={c.panelLab}>1 ovoz narxi</p>
                <div className={c.panelField}>
                  <span className={`${c.panelNum} tnum`}>{s.price_one_vote}</span>
                  <span className={c.panelCur}>so‘m</span>
                </div>

                <p className={c.panelLab}>To‘lov kartasi</p>
                <div className={`${c.panelField} ${c.panelFieldMono}`}>Uzcard · Humo · Payme</div>

                <div className={c.panelStats}>
                  {stats.slice(0, 3).map((it) => (
                    <div key={it.lab} className={c.panelStat}>
                      <span className={`${c.panelStatNum} tnum`}>{it.num}</span>
                      <span className={c.panelStatLab}>{it.lab}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Ko'rsatkichlar: oq kartalar tusli fonda ── */}
        <section className={c.statsBand} aria-label="Ko'rsatkichlar">
          <div className={c.statsIn}>
            {stats.map((it) => (
              <div key={it.lab} className={c.stat}>
                <span className={`${c.statNum} tnum`}>{it.num}</span>
                <span className={c.statLab}>{it.lab}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Docs tanasi: yon indeks + kontent kartalari ── */}
        <div className={c.docs}>
          <div className={c.docsIn}>
            <aside className={c.side}>
              <p className={c.sideTitle}>Boshlash</p>
              <ul className={c.sideList}>
                {NAV.map((n) => (
                  <li key={n.id}>
                    <a href={`#${n.id}`}>
                      <span className={c.sideTag}>{n.tag}</span>
                      <span className={c.sideLab}>
                        <b>{n.group}</b>
                        {n.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className={c.sideNote}>
                Savol bo‘lsa —{' '}
                <a
                  href={`https://t.me/${s.support_username}`}
                  rel="noopener"
                  data-t="click"
                  data-t-id="support"
                >
                  @{s.support_username}
                </a>
              </div>
            </aside>

            <div className={c.content}>
              {/* ── 3 qadam ── */}
              <section id="jarayon" className={c.card}>
                <p className={c.kicker}>Jarayon</p>
                <h2 className={c.h2}>3 qadam, xolos</h2>
                <p className={c.sectionSub}>
                  Ro‘yxatdan o‘tish yo‘q. Hujjat yo‘q. Faqat ovoz va to‘lov.
                </p>

                <ol className={c.steps}>
                  {LANDING_STEPS.map((step) => (
                    <li key={step.n} className={c.step}>
                      <span className={c.stepTag}>{`0${step.n}`}</span>
                      <div className={c.stepBody}>
                        <h3 className={c.stepH}>{step.title}</h3>
                        <p className={c.stepP}>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <p className={c.callout}>
                  Telegram hisobingizdan boshqa hech narsa kerak emas — parol ham, email ham
                  so‘ralmaydi.
                </p>

                <div className={c.secAct}>
                  <a
                    href={tg}
                    className={c.btnLg}
                    data-t="cta"
                    data-t-id="v6_steps"
                    data-tg
                    rel="noopener"
                  >
                    <Telegram size={18} />
                    Hoziroq boshlash
                  </a>
                </div>
              </section>

              {/* ── Mukofotlar: docs jadvali ko'rinishida ── */}
              <section id="mukofot" className={c.card}>
                <p className={c.kicker}>Mukofot</p>
                <h2 className={c.h2}>Nima olasiz</h2>
                <p className={c.sectionSub}>Ovoz bergandan so‘ng avtomatik to‘lanadi.</p>

                <div className={c.tableWrap}>
                  <table className={c.table}>
                    <thead>
                      <tr>
                        <th>Turi</th>
                        <th>Nomi</th>
                        <th>Miqdor</th>
                        <th>Izoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LANDING_REWARDS.map((r, i) => (
                        <tr key={r.tag}>
                          <td data-lab="Turi">
                            <span className={`${c.tag} ${i === 2 ? c.tagHot : ''}`}>{r.tag}</span>
                          </td>
                          <td data-lab="Nomi" className={c.tdName}>
                            {r.title}
                          </td>
                          <td data-lab="Miqdor" className={c.tdAmt}>
                            <span className="tnum">{r.amount}</span>
                            {r.unit && <span className={c.tdUnit}> {r.unit}</span>}
                          </td>
                          <td data-lab="Izoh" className={c.tdDesc}>
                            {r.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={c.secAct}>
                  <a
                    href={tg}
                    className={c.btnLg}
                    data-t="cta"
                    data-t-id="v6_rewards"
                    data-tg
                    rel="noopener"
                  >
                    <Telegram size={18} />
                    Mukofot olishni boshlash
                  </a>
                </div>
              </section>

              {/* ── Savol-javob ── */}
              <section id="savol-javob" className={c.card}>
                <p className={c.kicker}>Savol-javob</p>
                <h2 className={c.h2}>Savollarga javob</h2>

                <div className={c.faq}>
                  {faq.map((item) => (
                    <details key={item.q} className={c.faqItem}>
                      <summary className={c.faqQ}>
                        {item.q}
                        <span className={c.faqMark} aria-hidden />
                      </summary>
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
              </section>
            </div>
          </div>
        </div>

        {/* ── Yakuniy da'vat: to'q panel, hero panelining kattalashgani ── */}
        <section className={c.finaleWrap}>
          <div className={c.finale}>
            <p className={c.finEyebrow}>Hali kech emas</p>
            <h2 className={c.finaleH}>
              Ovoz bering. Pul oling. <span className={c.finaleHl}>Shu.</span>
            </h2>
            <p className={c.finaleP}>
              {s.reviews_count} dan ortiq odam allaqachon to‘lov oldi. Navbat sizda.
            </p>

            <ul className={c.finaleList}>
              {FINALE_BULLETS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <div className={c.finaleAct}>
              <a
                href={tg}
                className={c.btnLight}
                data-t="cta"
                data-t-id="v6_final"
                data-tg
                rel="noopener"
              >
                <Telegram size={18} />
                Hoziroq boshlash
              </a>
              <a
                href={tg}
                className={c.finaleBot}
                data-t="cta"
                data-t-id="v6_final_bot"
                data-tg
                rel="noopener"
              >
                @{bot}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={c.foot}>
        <div className={c.footIn}>
          <a href="#top" className={c.brand} aria-label={SITE.brand}>
            <span className={c.brandTile}>
              <Logo size={22} className={c.brandMark} />
            </span>
            <span className={c.brandName}>
              Milliy <b>jamoasi</b>
            </span>
          </a>
          <p className={c.footNote}>
            To‘lovlar Telegram bot orqali amalga oshiriladi. Barcha huquqlar himoyalangan.
          </p>
          <a
            href={tg}
            className={c.footBot}
            data-t="cta"
            data-t-id="v6_foot_bot"
            data-tg
            rel="noopener"
          >
            @{bot}
          </a>
        </div>
      </footer>

      {/* Suzuvchi variant almashtirgich — A/B taqqoslash uchun ichki navigatsiya */}
      <nav className={c.switcher} aria-label="Dizayn variantlari">
        <a href="/1">1</a>
        <a href="/2">2</a>
        <a href="/3">3</a>
        <a href="/4">4</a>
        <a href="/5">5</a>
        <a href="/6" aria-current="page" className={c.swOn}>
          6
        </a>
        <a href="/7">7</a>
        <a href="/8">8</a>
        <a href="/9">9</a>
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
