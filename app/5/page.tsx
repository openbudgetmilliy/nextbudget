import type { Metadata, Viewport } from 'next';

import Timer from '@/components/Timer';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Logo from '@/components/Logo';

import { getSettings, pagePixels } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import { botUsername, tgLink } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
import { env, GATE_ON } from '@/lib/env';

import c from './page.module.css';

/**
 * `/5` — bitta ekranli «Fintech» slayd (bank ilovasi tili).
 *
 * Uslub manbasi: `files/mobil/9-fintech.html`. Kulrang fon, oq
 * kartochkalar, moviy urg'u — Payme/Click estetikasi. Markazda «to'lov
 * tushdi» bildirishnomasi maketi: natija so'z bilan emas, tanish
 * push-xabar ko'rinishida ko'rsatiladi. Logo — sarlavha oldida, oq
 * kartochka-plitada. Matn o'sha admin sozlamalaridan.
 *
 * Reklama kampaniyalarida muqobil kadr — `/2`–`/4` kabi index'lanmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Shu kadrning ro'yxatdagi o'rni — `?start=` va reklama havolasi shundan */
const PAGE = pageAt('/5');

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#eef1f6',
  colorScheme: 'light',
};

export default async function FintechPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, PAGE.slug);
  const bot = botUsername(s.bot_username || env.BOT);
  // Admin '@' bilan saqlagan bo'lsa ham havola buzilmasin
  const channel = (s.tg_channel || '').replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <div className={c.screen}>
      {/* Global body foni oq — bu kadr esa kulrang, overscroll mos tursin */}
      <style>{'body{background:#eef1f6}'}</style>

      <div className={c.wrap}>
        <header className={c.head}>
          <span className={c.brand}>{SITE.brand}</span>
          <span className={c.safe}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3 4 6.5V12c0 4.6 3.2 7.9 8 9 4.8-1.1 8-4.4 8-9V6.5L12 3Z" />
            </svg>
            {s.hero_badge || "Xavfsiz to'lov"}
          </span>
        </header>

        <div className={c.mid}>
          {/* Logo sarlavha oldida — oq kartochka-plitada */}
          <span className={c.mark}>
            <Logo size={34} className="" />
          </span>

          <h1 className={c.title}>
            {lines.map((line, i) => (
              // Indeks kalitda: titleLines ikkita bir xil qator qaytarishi
              // mumkin. Oxirgi qator moviy urg'u oladi.
              <span key={`${i}-${line}`} className={i === lines.length - 1 ? c.hl : undefined}>
                {line}
              </span>
            ))}
          </h1>

          <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

          {/* Bildirishnoma maketi — jarayon push-xabar tilida ko'rsatiladi */}
          <div className={c.stack}>
            <div className={c.notif}>
              <span className={`${c.nIco} ${c.nVote}`} aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m20 6-11 11-5-5" />
                </svg>
              </span>
              <span className={c.nCol}>
                <span className={c.nT}>Ovoz tasdiqlandi</span>
                <span className={c.nS}>{SITE.brand} · hozirgina</span>
              </span>
              <span className={c.nOk}>✓</span>
            </div>

            <div className={c.notif}>
              <span className={`${c.nIco} ${c.nIn}`} aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14m0 0-6-6m6 6 6-6" />
                </svg>
              </span>
              <span className={c.nCol}>
                <span className={c.nT}>To‘lov tushdi</span>
                <span className={c.nS}>Uzcard •• 8600 · 2 daqiqada</span>
              </span>
              <span className={`${c.nAmt} tnum`}>+{s.price_one_vote}</span>
            </div>

            <p className={c.total}>
              Jami <b>{s.reviews_count}</b> ishtirokchiga to‘lab berildi
            </p>
          </div>
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

          <p className={c.note}>Uzcard va Humo — komissiyasiz</p>
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
