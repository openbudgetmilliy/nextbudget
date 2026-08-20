import Timer from '@/components/Timer';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Logo from '@/components/Logo';
import { ArrowDown } from '@/components/Icons';

import { getSettings, pagePixels } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import { botUsername, tgLink } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
import { env, GATE_ON } from '@/lib/env';
import type { Metadata, Viewport } from 'next';

import c from './page.module.css';

/**
 * `/2` — bitta ekranli sariq «Energetik» slayd.
 *
 * Ilgari bosh sahifa edi; ildizga 6-«Milliy» dizayni kelgach bu yerga
 * ko'chdi. Reklama kampaniyalarida muqobil kadr sifatida ishlatiladi —
 * shu sabab index'lanmaydi (bosh sahifa bilan kontenti bir xil, qidiruvda
 * dublikat bo'lib qolmasin).
 *
 * Uslub manbasi: `files/mobil/3-energetik.html`. Sayt bundan oldin ko'p
 * bo'limli landing edi (hero, qadamlar, mukofotlar, savol-javob, yakuniy
 * da'vat, tanga yomg'iri). Endi u BITTA ekran: sariq fon, qora qalin
 * sarlavha, narx stikeri va ikkita tugma. Skroll yo'q — reklamadan kelgan
 * odam birinchi kadrdayoq nima taklif qilinayotganini ko'radi va bosadi.
 *
 * Nima yo'qoldi va nega: uzun bo'limlar Instagram trafigida deyarli
 * o'qilmasdi (skroll chuqurligi statistikasi shuni ko'rsatgan), ular esa
 * sahifani og'irlashtirardi. Uch o'lchamli tanga yomg'iri (three.js) ham
 * shu bilan birga olib tashlandi — sariq tekislikda uning o'rni yo'q.
 *
 * Matn manbai — admin sozlamalari (`getSettings`): sarlavha, tavsif, narx
 * va tugma yozuvi `/admin/settings` dan o'zgaradi va keyingi revalidate'da
 * sahifaga tushadi.
 *
 * Sahifa to'liq statik (SSG) — Turnstile tekshiruvi va analitika client
 * tomonda ishlaydi, server render qilgan matnga ta'sir qilmaydi. Shu sabab
 * sahifani Cloudflare edge'da cache'lash mumkin.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Shu kadrning ro'yxatdagi o'rni — `?start=` va reklama havolasi shundan */
const PAGE = pageAt('/2');

export const metadata: Metadata = {
  // Canonical ATAYIN yo'q: noindex bilan birga o'z-o'ziga canonical qarama-
  // qarshi signal bo'lardi. Qidiruvga bosh sahifa chiqadi, bu — reklama kadri.
  robots: { index: false, follow: true },
};

/** Ildiz endi oq — bu marshrut brauzer chrome'ini o'zi sariqqa bo'yaydi */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffd400',
  colorScheme: 'light',
};

/**
 * Ishonch belgilari. Uchtadan oshmasin: to'rtinchisi ikkinchi qatorga
 * tushib slaydni cho'zadi va u bitta ekranga sig'may qoladi.
 */
const PILLS = ['2 daqiqa', 'Uzcard · Humo', 'Hujjat kerak emas'] as const;

export default async function HomePage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, PAGE.slug);
  const bot = botUsername(s.bot_username || env.BOT);
  // Admin '@' bilan saqlagan bo'lsa ham havola buzilmasin
  const channel = (s.tg_channel || '').replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <div className={c.screen}>
      {/* Global body foni endi oq («Milliy») — iOS overscroll'da sariq slayd
          ortida oq yaltirab qolmasin. Marshrutga bog'langan yagona yo'l —
          shu yerda kichik style tegi. */}
      <style>{'body{background:#ffd400}'}</style>
      <div className={c.dots} aria-hidden />

      <div className={c.wrap}>
        <header className={c.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={22} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>{s.hero_badge || 'Bepul'}</span>
        </header>

        <div className={c.mid}>
          <h1 className={c.title}>
            {lines.map((line, i) => (
              // Indeks kalitda: titleLines ikkita bir xil qator qaytarishi mumkin
              <span key={`${i}-${line}`}>{line}</span>
            ))}
          </h1>

          <div className={c.sticker}>
            <p className={`${c.sNum} tnum`}>{s.price_one_vote}</p>
            <p className={c.sLab}>so‘m / 1 ovoz</p>
          </div>

          <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

          <ul className={c.row}>
            {PILLS.map((p) => (
              <li key={p} className={c.pill}>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className={c.cta}>
          <span className={c.arrow} aria-hidden>
            <ArrowDown size={26} />
          </span>

          <Timer
            classes={{
              box: c.tm,
              caption: c.tmCap,
              grid: c.tmGrid,
              cell: c.tmCell,
              num: `${c.tmNum} tnum`,
              lab: c.tmLab,
              over: c.tmOver,
            }}
          />

          {/* Ikkala tugma ham bitta botga olib boradi — matn boshqa, chunki
              odam o'zini "ovoz beruvchi" yoki "pul oluvchi" deb ko'rishi
              mumkin. `data-t-id` ajratilgan: qaysi so'z ko'proq bosilishini
              analitika ko'rsatadi. */}
          <a
            href={tg}
            className={`${c.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="ovoz"
            data-tg
            rel="noopener"
          >
            {s.cta_primary}
          </a>
          <a
            href={tg}
            className={`${c.btn} ${c.ghost}`}
            data-t="cta"
            data-t-id="pul"
            data-tg
            rel="noopener"
          >
            Pulni olish
          </a>

          <p className={c.note}>{s.reviews_count} kishi allaqachon to‘lov oldi</p>
        </div>
      </div>

      <Tracker />
      <MetaPixel ids={pagePixels(s, PAGE.slug)} />

      {/* Fonda ishlaydigan Turnstile — sahifani to'smaydi, odatda ko'rinmaydi */}
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
            // `<` qochiriladi: qiymatlar admin formasidan keladi, "</script>"
            // saqlanib qolsa xom holicha sahifaga tushmasin
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
