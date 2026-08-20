import { Space_Grotesk } from 'next/font/google';
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
 * `/3` — bitta ekranli «Gradient» slayd (stories uslubi).
 *
 * Yashil–ko‘k gradient fon, chapda matn, o‘rta-o‘ngda hamyondan
 * chiqib turgan 10 000 so‘mlik banknotalar maketi. Manba aslida
 * `files/mobil/10-gradient.html`; vizual yangilandi.
 *
 * Reklama kampaniyalarida muqobil kadr — `/2` kabi index'lanmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Shu kadrning ro'yxatdagi o'rni — `?start=` va reklama havolasi shundan */
const PAGE = pageAt('/3');

export const metadata: Metadata = {
  // Canonical ATAYIN yo'q: noindex bilan birga o'z-o'ziga canonical qarama-
  // qarshi signal bo'lardi. Qidiruvga bosh sahifa chiqadi, bu — reklama kadri.
  robots: { index: false, follow: true },
};

/** Ildiz — yashil/ko‘k gradient, brauzer chrome shu rangga bo‘yaladi */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d9488',
  colorScheme: 'light',
};

/** Hamyondan chiqib turgan banknotalar — faqat dekor, 10 000 so'm */
const WALLET_NOTE_COUNT = 4;

/**
 * Sarlavha shrifti FAQAT shu marshrutda yuklanadi: root layout'ga qo'shilsa
 * `/` va `/2` ham ortiqcha shrift so'rovi olardi. next/font sahifa faylida
 * ham ishlaydi — preload shu marshrutga bog'lanadi.
 */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--f-sg',
  display: 'swap',
});

/**
 * Ishonch belgilari. Uchtadan oshmasin: to'rtinchisi ikkinchi qatorga
 * tushib slaydni cho'zadi va u bitta ekranga sig'may qoladi.
 */
const PILLS = ['2 daqiqa', 'Uzcard · Humo', 'Bepul'] as const;

export default async function GradientPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, PAGE.slug);
  const bot = botUsername(s.bot_username || env.BOT);
  // Admin '@' bilan saqlagan bo'lsa ham havola buzilmasin
  const channel = (s.tg_channel || '').replace(/^@/, '');
  const vars = { narx: s.price_one_vote };

  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <div className={`${display.variable} ${c.screen}`}>
      {/* Global body foni oq («Milliy») — overscroll'da gradient ortida oq
          yaltirab qolmasin. Body'ga ham xuddi shu gradient beriladi. */}
      <style>
        {'body{background:linear-gradient(165deg,#0d9488 0%,#059669 42%,#0284c7 112%)}'}
      </style>
      <div className={c.glow} aria-hidden />

      {/* O‘rta-o‘ng: hamyondan 4 ta 10 000 banknotaning yuqori o‘ng burchagi */}
      <div className={c.walletScene} aria-hidden>
        <div className={c.walletNotes}>
          {Array.from({ length: WALLET_NOTE_COUNT }, (_, i) => (
            <span key={i} className={c.walletNote}>
              <span className={c.walletNoteAmt}>10 000</span>
              <span className={c.walletNoteSub}>so‘m</span>
            </span>
          ))}
        </div>
        <div className={c.walletBody}>
          <span className={c.walletFlap} />
        </div>
      </div>

      <div className={c.wrap}>
        <header className={c.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={26} className="" />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>{s.hero_badge || 'Bugun ochiq'}</span>
        </header>

        <div className={c.mid}>
          <h1 className={c.title}>
            {lines.map((line, i) => (
              // Indeks kalitda: titleLines ikkita bir xil qator qaytarishi mumkin
              <span key={`${i}-${line}`}>{line}</span>
            ))}
          </h1>

          <p className={c.sub}>{applyVars(s.hero_sub, vars)}</p>

          {/* Oq stiker — gradient raqam bilan, sahifadagi yagona qiyshiq element */}
          <div className={c.sticker}>
            <p className={`${c.sNum} tnum`}>{s.price_one_vote}</p>
            <p className={c.sLab}>so‘m / har bir ovoz</p>
          </div>

          <ul className={c.row}>
            {PILLS.map((p) => (
              <li key={p} className={c.pill}>
                {p}
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
