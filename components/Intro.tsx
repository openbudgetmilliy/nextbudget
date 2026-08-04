import { Telegram } from './Icons';
import { SITE } from '@/lib/content';

/**
 * Tanishtiruv banneri — sahifaning birinchi bandi.
 *
 * Tashabbus muallifi loyihasini Tashabbusli budjetga qo'ygan; endi uni
 * tumandagi odamlarga yetkazishi kerak. Shu tizim aynan buni qiladi.
 *
 * Uchta xizmat raqamlangan — bu HAQIQIY ketma-ketlik emas, lekin qo'llanmadagi
 * feature kartasi retsepti (katta tartib raqami + uppercase sarlavha) shu
 * uslubning asosiy strukturaviy belgisi.
 */

const OFFERS = [
  {
    n: '01',
    title: 'Tanishtiruv sahifasi',
    text: 'Loyiha nomi, byudjeti va manzili bitta havolada. Telegram va Instagram’da ulashishga tayyor.',
  },
  {
    n: '02',
    title: 'Maqsadli e’lon',
    text: 'E’lon sizning tuman va mahallangizdagi odamlarga ko’rsatiladi — boshqa hududga emas.',
  },
  {
    n: '03',
    title: 'Qamrov hisoboti',
    text: 'Nechta odam ko’rdi, nechtasi havolani ochdi. Hisobot har kuni yangilanadi.',
  },
];

export default function Intro({ tg }: { tg: string }) {
  return (
    <section className="intro" id="intro" aria-labelledby="intro-t">
      <div className="wrap">
        {/* Brend logotipi oq plitada. Logotipdagi nom to'q ko'k — qorong'i
            rejimda fonga qo'shilib ketardi, shu sabab plita ikki rejimda ham
            oq qoladi. Brutalist tilda bu bosma yorliqday o'qiladi. */}
        <div className="intro-plate">
          <img
            src="/logo-brand.webp"
            alt={`${SITE.brand} logotipi`}
            width={300}
            height={218}
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <span className="eyebrow">Tanishtiruv</span>

        <h2 className="intro-title" id="intro-t">
          Tashabbusingizni mahallangiz eshitsin
        </h2>

        <p className="intro-sub">
          Tashabbusli budjetga loyiha qo’ygansiz. Endi uni tumaningizdagi odamlarga yetkazish
          kerak — tanishtiruv sahifasi, maqsadli e’lon va qamrov hisoboti shu tizimda.
        </p>

        <ul className="grid-lines intro-grid">
          {OFFERS.map((o) => (
            <li className="intro-item" key={o.n}>
              <span className="intro-n tnum">{o.n}</span>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </li>
          ))}
        </ul>

        <div className="btn-row intro-cta">
          <a
            href={tg}
            className="btn btn-primary"
            data-t="cta"
            data-t-id="intro_cta"
            data-tg
            rel="noopener"
          >
            <Telegram />
            Tizimni ochish
          </a>
          <a href="#how" className="btn btn-ghost" data-t="click" data-t-id="intro_how">
            Qanday ishlaydi
          </a>
        </div>

        <p className="intro-note">
          E’lon tashabbusni ko’rinadigan qiladi. Ovoz berish qarori har doim fuqaroning o’zida
          qoladi. Rasmiy portal — openbudget.uz.
        </p>
      </div>
    </section>
  );
}
