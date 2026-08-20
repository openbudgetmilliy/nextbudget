import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { SITE, applyVars, titleLines } from '@/lib/content';
import { botUsername, tgLink } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
import { env, GATE_ON } from '@/lib/env';

import c from './page.module.css';

/**
 * Bosh sahifa — bitta ekranli slayd, «Milliy» (oq-moviy).
 *
 * Uslub manbasi: `files/mobil/6-milliy.html`. Bayroq ranglari — moviy,
 * oq, yashil va ingichka qizil iplar; hammasi markazga terilgan. Sariq
 * «Energetik» slayd o'chirilmadi — u `/2` da muqobil reklama kadri bo'lib
 * turibdi, skelet ikkalasida bir xil.
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
const PAGE = pageAt('/');

/**
 * Ishonch belgilari. Uchtadan oshmasin: to'rtinchisi ikkinchi qatorga
 * tushib slaydni cho'zadi va u bitta ekranga sig'may qoladi.
 */
const PILLS = ['Ishtirok bepul', '2 daqiqa', 'Hujjatsiz'] as const;

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
      <div className={c.sky} aria-hidden />

      <div className={c.wrap}>
        <header className={c.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={40} className="" />
            </span>
            <span>
              <span className={c.bname}>{SITE.brand}</span>
              <span className={c.bsub}>Tashabbusli budjet</span>
            </span>
          </div>
          <span className={c.year}>{s.hero_badge || '2026'}</span>
        </header>

        <div className={c.mid}>
          {/* Bayroq lentasi — moviy / qizil ip / oq / qizil ip / yashil */}
          <div className={c.ribbon} aria-hidden>
            <i className={c.rb} />
            <i className={c.rr} />
            <i className={c.rw} />
            <i className={c.rr} />
            <i className={c.rg} />
          </div>

          <h1 className={c.title}>
            {lines.map((line, i) => (
              // Indeks kalitda: titleLines ikkita bir xil qator qaytarishi mumkin.
              // Oxirgi qator moviy urg'u oladi — mukofot qatori ajralib tursin.
              <span key={`${i}-${line}`} className={i === lines.length - 1 ? c.hl : undefined}>
                {line}
              </span>
            ))}
          </h1>

          <div className={c.sum}>
            <p className={`${c.sNum} tnum`}>{s.price_one_vote}</p>
            <p className={c.sLab}>so‘m · har bir ovoz uchun</p>
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
