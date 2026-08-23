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
 * `/11` — «Moviy» kadri.
 *
 * milliyjamosimiz.uz loyihasidagi `/2` dan ko'chirilgan: Instagram stories
 * tili, logotip ranglarida to'liq ekranli moviy gradient, oq stiker
 * ichidagi gradient raqam. Bitta ekran, skrollsiz — reklama bosgan odam
 * uchun bitta qaror.
 *
 * Nima qayerdan keladi:
 *   summa    — `price_one_vote` sozlamasi (hamma kadr bilan bitta manba)
 *   bot      — `pageCta()`: kadrning O'Z havolasi, bo'lmasa umumiy bot
 *   sarlavha — SHU KADRGA XOS va kodda muhrlangan. A/B sinovining ma'nosi
 *              shunda: matn ham dizayn bilan birga sinaladi, shuning uchun
 *              u sozlamadan olinmaydi.
 *
 * Skelet `components/landing/adscreen.module.css` da, rang va shrift esa
 * `./page.module.css` da — `/12` bilan skeletni baham ko'radi.
 *
 * Sahifa to'liq statik (SSG); client kod faqat Tracker, taymer va
 * Turnstile.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

const PAGE = pageAt('/11');

/** A/B kadri — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: true },
};

/** Ekran moviy — brauzer paneli ham shu rangda bo'lsin */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0090d8',
  colorScheme: 'dark',
};

export default async function MoviyPage() {
  const s = await getSettings();
  // Tugma manzili: kadrga xos havola bo'lsa (`link_p11`) o'sha, bo'lmasa
  // umumiy bot sozlamasi. `stamp` — UTM yopishtiriladimi
  const { href: tg, stamp: tgStamp } = pageCta(s, PAGE.slug);
  // botUsername(): admin to'liq havola yozsa ham JSON-LD'ga toza username tushsin
  const bot = botUsername(s.bot_username || env.BOT);
  const channel = (s.tg_channel || '').replace(/^@/, '');

  const left = campaignLeft();
  const open = isOpen();

  return (
    <div className={`${a.screen} ${c.page}`}>
      {/* Global body foni oq — bu kadr ko'k, overscroll mos tursin */}
      <style>{'body{background:#0a58c4}'}</style>
      <div className={c.bg} aria-hidden />

      <div className={a.wrap}>
        <header className={a.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={26} className={c.markImg} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>Bugun ochiq</span>
        </header>

        <div className={a.mid}>
          <h1 className={c.title}>
            Bitta ovoz.
            <br />
            Naqd mukofot.
          </h1>
          <p className={c.sub}>
            Ochiq byudjet loyihasiga ovoz bering — pul kartangizga o‘sha kuni tushadi.
          </p>

          <div className={c.sticker}>
            <p className={`${c.sNum} tnum`}>{s.price_one_vote}</p>
            <p className={c.sLab}>so‘m / har bir ovoz</p>
          </div>

          <div className={c.row}>
            <span className={c.pill}>2 daqiqa</span>
            <span className={c.pill}>Uzcard / Humo</span>
            <span className={c.pill}>Bepul</span>
          </div>
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
          <p className={`${a.note} ${c.note}`}>Ro‘yxatdan o‘tish shart emas — Telegram yetarli</p>
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
