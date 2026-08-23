import type { Metadata, Viewport } from 'next';

import Logo from '@/components/Logo';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Countdown from '@/components/landing/Countdown';

import { campaignLeft, isOpen } from '@/lib/campaign';
import { SITE } from '@/lib/content';
import { getSettings, pageCta, pagePixels } from '@/lib/data';
import { env, GATE_ON } from '@/lib/env';
import { pageAt } from '@/lib/pages';
import { botUsername } from '@/lib/tg';

import a from '@/components/landing/adscreen.module.css';
import c from './page.module.css';

/**
 * `/12` — «Karta» kadri.
 *
 * milliyjamosimiz.uz loyihasidagi `/3` dan ko'chirilgan. Yondashuv: mukofot
 * MATN emas, BUYUM — studiya yorug'ligida turgan bank kartasi va uning
 * ustiga tushayotgan to'lov. Katta sarlavha ataylab yo'q: kadrning markazi
 * kartaning o'zi.
 *
 * Kartadagi «8600» — Uzcard raqamlarining OCHIQ prefiksi (barcha Uzcard
 * shu bilan boshlanadi), ya'ni birovning kartasi emas, kartaning turi.
 *
 * Karta ostidagi qator ATAYIN admin sozlamasidan (`reviews_count`):
 * manbadagi «Oxirgi to'lov: 2 daqiqa oldin · Humo •• 4211» aniq, tekshirib
 * bo'lmaydigan va sodir bo'lmagan hodisani da'vo qilardi. Vizual element
 * (jonli nuqta + bitta qator) saqlandi, matn haqiqiy ma'lumotga almashdi.
 *
 * Skelet `components/landing/adscreen.module.css` da — `/11` bilan bitta.
 *
 * Sahifa to'liq statik (SSG); client kod faqat Tracker, taymer va
 * Turnstile.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

const PAGE = pageAt('/12');

/** A/B kadri — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: true },
};

/** Ekran to'q — brauzer paneli ham to'q bo'lsin */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080d14',
  colorScheme: 'dark',
};

export default async function KartaPage() {
  const s = await getSettings();
  // Tugma manzili: kadrga xos havola bo'lsa (`link_p12`) o'sha, bo'lmasa
  // umumiy bot sozlamasi. `stamp` — UTM yopishtiriladimi
  const { href: tg, stamp: tgStamp } = pageCta(s, PAGE.slug);
  // botUsername(): admin to'liq havola yozsa ham JSON-LD'ga toza username tushsin
  const bot = botUsername(s.bot_username || env.BOT);
  const channel = (s.tg_channel || '').replace(/^@/, '');

  const left = campaignLeft();
  const open = isOpen();

  return (
    <div className={`${a.screen} ${c.page}`}>
      {/* Global body foni oq — bu kadr to'q, overscroll mos tursin */}
      <style>{'body{background:#080d14}'}</style>
      <div className={c.bg} aria-hidden />

      <div className={a.wrap}>
        <header className={a.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={22} className={c.markImg} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>Ovoz → pul</span>
        </header>

        <div className={a.mid}>
          <div className={c.stage}>
            <span className={c.drop} aria-hidden>
              +{s.price_one_vote} so‘m
            </span>

            <div className={c.card}>
              <div className={c.cTop}>
                <span className={c.cBrand}>{SITE.brand}</span>
                <span className={c.cChip} aria-hidden />
              </div>

              <div>
                <p className={`${c.cAmt} tnum`}>
                  {s.price_one_vote}
                  <span>so‘m</span>
                </p>
                <p className={c.cLab}>har bir ovoz uchun</p>
              </div>

              <div className={c.cBot}>
                <span className={c.cNum}>
                  <i>●●●●</i> <i>●●●●</i> <i>●●●●</i> 8600
                </span>
                <span className={c.cNet}>UZCARD</span>
              </div>
            </div>

            <span className={c.shadow} aria-hidden />
          </div>

          <h1 className={c.title}>
            Pul to‘g‘ri <b>kartangizga</b> tushadi
          </h1>
          <p className={c.sub}>
            Hamyon ham, ilova ham kerak emas. Uzcard yoki Humo raqamini kiritasiz — qolganini bot
            qiladi.
          </p>
          <p className={c.last}>
            <span className={c.pulse} aria-hidden />
            {s.reviews_count} foydalanuvchi allaqachon to‘lov oldi
          </p>
        </div>

        <div className={a.cta}>
          {open ? (
            <Countdown
              initial={left}
              lead=""
              classes={{
                root: c.cd,
                lead: c.cdLead,
                grid: c.cdGrid,
                cell: c.cdCell,
                num: c.cdNum,
                lab: c.cdLab,
                note: c.cdNote,
              }}
            />
          ) : null}
          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="ovoz"
            data-tg={tgStamp ? '' : undefined}
            rel="noopener"
          >
            Ovoz berish
          </a>
          <p className={`${a.note} ${c.note}`}>Komissiyasiz · 2 daqiqada</p>
        </div>
      </div>

      <Tracker />
      <MetaPixel ids={pagePixels(s, PAGE.slug)} />
      <TurnstileGuard siteKey={GATE_ON ? env.TURNSTILE_SITE_KEY : ''} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE.brand,
            url: env.SITE_URL,
            description: SITE.description,
            sameAs: [bot, channel].filter(Boolean).map((u) => `https://t.me/${u}`),
            // `<` qochiriladi: qiymatlar admin formasidan keladi
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
