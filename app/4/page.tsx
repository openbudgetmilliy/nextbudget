import { Space_Grotesk } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

import Timer from '@/components/Timer';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Logo from '@/components/Logo';

import { getSettings, pagePixels } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import { botUsername, fixedStart, tgLink } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
import { env, GATE_ON } from '@/lib/env';

import c from './page.module.css';

/**
 * `/4` — bitta ekranli «Zamonaviy» slayd (to'q, gradient, shisha panellar).
 *
 * Uslub manbasi: `files/mobil/2-zamonaviy.html`. To'q fonda binafsha-moviy
 * yorug'lik, shisha (glass) kartochkalar — ilova estetikasi, yosh
 * auditoriya uchun. Boshqa kadrlar bilan skelet bir xil, matn o'sha admin
 * sozlamalaridan. Logo — sarlavha tepasida, oq plitada (belgining to'q
 * xaritasi qora fonda yo'qolmasin).
 *
 * Reklama kampaniyalarida muqobil kadr — `/2`, `/3` kabi index'lanmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Shu kadrning ro'yxatdagi o'rni — `?start=` va reklama havolasi shundan */
const PAGE = pageAt('/4');

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** To'q kadr — brauzer chrome'i ham to'q bo'yaladi */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080b12',
  colorScheme: 'dark',
};

/** Sarlavha shrifti FAQAT shu marshrutda yuklanadi (/3 dagi kabi) */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--f-sg',
  display: 'swap',
});

/** Shisha plitkalar qatori — uchtadan oshmasin, slayd cho'zilib ketadi */
const TILES = [
  { k: '2 daq', l: "O'tkazma" },
  { k: 'Uzcard', l: 'Humo ham' },
  { k: '24/7', l: 'Yordam' },
] as const;

export default async function ZamonaviyPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, PAGE.slug);
  // Sozlamada qat'iy `?start=` bo'lsa UTM qo'shimchasi yopishmasin —
  // kod botga toza yetib borishi kerak (`data-tg` bo'lmasa stamping tegmaydi)
  const tgStamp = fixedStart(s.bot_username || env.BOT) === null;
  const bot = botUsername(s.bot_username || env.BOT);
  // Admin '@' bilan saqlagan bo'lsa ham havola buzilmasin
  const channel = (s.tg_channel || '').replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <div className={`${display.variable} ${c.screen}`}>
      {/* Global body foni oq («Milliy») — overscroll'da to'q kadr ortida
          oq yaltirab qolmasin */}
      <style>{'body{background:#080b12}'}</style>
      <div className={c.glow} aria-hidden />

      <div className={c.wrap}>
        <header className={c.head}>
          <span className={c.brand}>{SITE.brand}</span>
          <span className={c.live}>
            <span className={c.dot} aria-hidden />
            {s.hero_badge || "To'lovlar avtomatik"}
          </span>
        </header>

        <div className={c.mid}>
          {/* Logo sarlavha oldida — oq plitada, to'q fonda ham ko'rinadi */}
          <span className={c.mark}>
            <Logo size={36} className="" />
          </span>

          <h1 className={c.title}>
            {lines.map((line, i) => (
              // Indeks kalitda: titleLines ikkita bir xil qator qaytarishi
              // mumkin. Oxirgi qator gradient urg'u oladi.
              <span key={`${i}-${line}`} className={i === lines.length - 1 ? c.grad : undefined}>
                {line}
              </span>
            ))}
          </h1>

          <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

          {/* Shisha narx kartochkasi */}
          <div className={c.amount}>
            <p className={c.aLab}>Har bir ovoz uchun</p>
            <p className={c.aNum}>
              <span className="tnum">{s.price_one_vote}</span>
              <span className={c.aUnit}>so‘m</span>
            </p>
          </div>

          <ul className={c.tiles}>
            {TILES.map((t) => (
              <li key={t.k} className={c.tile}>
                <p className={c.tK}>{t.k}</p>
                <p className={c.tL}>{t.l}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={c.cta}>
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
            data-tg={tgStamp ? '' : undefined}
            rel="noopener"
          >
            {s.cta_primary}
          </a>
          <a
            href={tg}
            className={`${c.btn} ${c.ghost}`}
            data-t="cta"
            data-t-id="pul"
            data-tg={tgStamp ? '' : undefined}
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
            // `<` qochiriladi: qiymatlar admin formasidan keladi
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
