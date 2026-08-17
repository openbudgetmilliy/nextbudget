import type { Metadata } from 'next';

import Header from '@/components/Header';
import Poster from '@/components/Poster';
import Tracker from '@/components/Tracker';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE, FALLBACK_PRICES, kindOf } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import x from './extra.module.css';

/**
 * SSG landing — kirish darvozasidan (`/`) keyingi sahifa.
 *
 * Bu funksiya build va revalidate paytida ishlaydi, foydalanuvchi so'rovida —
 * YO'Q. Shu sabab bu yerda `cookies()`, `headers()`, `searchParams`
 * ISHLATILMASLIGI kerak: aks holda sahifa dinamikaga o'tadi va cho'qqida
 * har so'rov render'ga tushardi.
 *
 * Kirish nazorati `middleware.ts` da: `gt` cookie'siz so'rov `/` ga qaytariladi.
 *
 * Sahifa darvoza bilan BIR XIL plakatdan iborat — farqi faqat harakat uyasida:
 * u yerda tekshiruv chizig'i, bu yerda botga o'tish tugmasi.
 *
 * Tekshirish: `npm run build` chiqishida `/l` yonida `○ (Static)` bo'lishi shart.
 */
/**
 * 60 sekund, 3600 emas.
 *
 * `revalidatePath()` FAQAT o'z Node protsessining keshini bekor qiladi.
 * PM2 bir nechta instance bilan ishlaganda admin narxni saqlaganda faqat
 * so'rovni bajargan instance yangilanadi — qolganlari eski sahifani
 * `revalidate` muddati tugagunicha berib turadi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** Darvoza ortidagi sahifa — qidiruvda ko'rinmaydi (`/` indekslanadi) */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
};

export default async function Landing() {
  const s = await getSettings();
  const bot = s.bot_username || env.BOT;
  const botClean = bot.replace(/^@/, '');
  const tg = tgLink(bot, 'web');
  const packCount = FALLBACK_PRICES.filter((p) => kindOf(p.sku) === 'ovoz').length;

  return (
    <>
      <Header tg={tg} label="Botga o’tish" />

      <main>
        <Poster
          s={s}
          action={
            <div className="act">
              <a href={tg} className="btn" data-t="cta" data-t-id="hero_cta" data-tg rel="noopener">
                <Telegram />
                {s.cta_primary}
              </a>
            </div>
          }
        />

        {/* ── Halol raqamlar — faqat tekshirsa bo'ladigan faktlar ── */}
        <section className={`wrap ${x.band}`}>
          <p className="eyebrow">Raqamlar</p>
          <div className={x.facts}>
            <div className={x.fact}>
              <p className={`${x.factNum} tnum`}>{s.reviews_count}</p>
              <p className={x.factLab}>foydalanuvchi tanlagan</p>
            </div>
            <div className={x.fact}>
              <p className={`${x.factNum} tnum`}>{packCount}</p>
              <p className={x.factLab}>tayyor paket</p>
            </div>
            <div className={x.fact}>
              <p className={`${x.factNum} tnum`}>3</p>
              <p className={x.factLab}>to‘lov usuli — Humo · Uzcard · Payme</p>
            </div>
            <div className={x.fact}>
              <p className={`${x.factNum} tnum`}>≈1 daq</p>
              <p className={x.factLab}>to‘lov tasdig‘i</p>
            </div>
          </div>
        </section>

        {/* ── 3 qadam ── */}
        <section className={`wrap ${x.band}`}>
          <p className="eyebrow">Jarayon</p>
          <h2 className={x.xh2}>Qanday ishlaydi</h2>
          <ol className={x.how}>
            <li>
              <span className={`${x.hnum} tnum`}>1</span>
              <h3 className={x.howH}>Botga o‘ting</h3>
              <p className={x.howP}>
                Telegram’da @{botClean} botini oching — ro‘yxatdan o‘tish, parol, email
                so‘ralmaydi.
              </p>
            </li>
            <li>
              <span className={`${x.hnum} tnum`}>2</span>
              <h3 className={x.howH}>/start bosing</h3>
              <p className={x.howP}>Bot o‘zi yo‘l-yo‘riq beradi: paketni tanlaysiz, narx darhol ko‘rinadi.</p>
            </li>
            <li>
              <span className={`${x.hnum} tnum`}>3</span>
              <h3 className={x.howH}>To‘lang</h3>
              <p className={x.howP}>Humo, Uzcard yoki Payme — to‘lov bir daqiqada tasdiqlanadi.</p>
            </li>
          </ol>
        </section>

        {/* ── Savol-javob ── */}
        <section className={`wrap ${x.band}`}>
          <p className="eyebrow">Savol-javob</p>
          <h2 className={x.xh2}>Savollarga javob</h2>
          <div className={x.faq}>
            <details className={x.qa}>
              <summary>Bot qanday ishlaydi?</summary>
              <p className={x.qaA}>
                Telegram’da @{botClean} ni ochasiz, /start bosasiz, paketni tanlab to‘laysiz.
                Hammasi bot ichida — saytga qaytish shart emas.
              </p>
            </details>
            <details className={x.qa}>
              <summary>Ro‘yxatdan o‘tish kerakmi?</summary>
              <p className={x.qaA}>
                Yo‘q. Telegram hisobingiz yetarli — parol ham, email ham, hujjat ham so‘ralmaydi.
              </p>
            </details>
            <details className={x.qa}>
              <summary>Qaysi kartalar bilan to‘lash mumkin?</summary>
              <p className={x.qaA}>
                Humo, Uzcard va Payme. To‘lov bot ichida rasmiy to‘lov tizimi orqali o‘tadi.
              </p>
            </details>
            <details className={x.qa}>
              <summary>Narx qancha?</summary>
              <p className={x.qaA}>
                1 ovoz — {s.price_one_vote} so‘mdan. Katta paketlarda bir ovoz narxi arzonroq —
                paketlar botda ko‘rsatiladi.
              </p>
            </details>
            <details className={x.qa}>
              <summary>Savolim bor yoki muammo chiqdi — kimga yozaman?</summary>
              <p className={x.qaA}>
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

        {/* ── Yakuniy da'vat: ink plita + botning ochiq manzili ── */}
        <section className={`wrap ${x.band} ${x.bandLast}`}>
          <div className={x.finale}>
            <h2 className={x.finH}>
              Tayyor bo‘lsangiz — <span>boshlang</span>
            </h2>
            <p className={x.finP}>
              {s.reviews_count} foydalanuvchi allaqachon tanlagan. Uch qadam — bir necha daqiqa.
            </p>
            <div className={x.finRow}>
              <a href={tg} className="btn" data-t="cta" data-t-id="final_cta" data-tg rel="noopener">
                <Telegram />
                {s.cta_primary}
              </a>
              <a
                href={tg}
                className={x.finBot}
                data-t="cta"
                data-t-id="bot_handle"
                data-tg
                rel="noopener"
              >
                @{botClean}
              </a>
            </div>
          </div>
        </section>
      </main>

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
    </>
  );
}
