import { Check, Telegram } from './Icons';
import type { Settings } from '@/lib/data';

/**
 * Sarlavha: `|` dan oldingi qism — asosiy satrlar, keyingisi — stiker.
 * Har bir bo'lak alohida `block` qatorda (qo'llanmadagi H1 qoidasi).
 */
function HeroTitle({ title }: { title: string }) {
  const pipe = title.indexOf('|');
  const head = pipe === -1 ? title : title.slice(0, pipe).trim();
  const sticker = pipe === -1 ? null : title.slice(pipe + 1).trim();

  return (
    <h1>
      {head.split(' ').reduce<string[][]>(
        (rows, word, i) => {
          // Har ikki so'z bitta qatorda — juda uzun satrlar bo'linib ketmasin
          if (i % 2 === 0) rows.push([word]);
          else rows[rows.length - 1].push(word);
          return rows;
        },
        [],
      ).map((row) => (
        <span key={row.join('-')}>{row.join(' ')}</span>
      ))}
      {sticker && <span className="sticker">{sticker}</span>}
    </h1>
  );
}

/**
 * Namuna chek — mahsulotning haqiqiy artefakti: yakunlangan buyurtma.
 * Muhr CSS animatsiyasi bilan tushadi, JS yo'q.
 */
function Slip() {
  return (
    <figure className="slip" aria-label="Namuna: yakunlangan e’lon">
      <div className="slip-head">
        <span className="slip-ref tnum">Tashabbus №12</span>
        <span className="slip-org">
          Chilonzor tumani
          <br />
          Yo’l ta’miri
        </span>
      </div>

      <dl className="slip-rows">
        <div>
          <dt>Paket</dt>
          <dd className="tnum">10 ovoz</dd>
        </div>
        <div>
          <dt>Yetkazildi</dt>
          <dd className="tnum ok">10 / 10</dd>
        </div>
        <div>
          <dt>To’lov</dt>
          <dd>Humo · Uzcard</dd>
        </div>
      </dl>

      <div className="slip-total">
        <span>Jami</span>
        <b className="tnum">
          260 000<i>so’m</i>
        </b>
      </div>

      <figcaption className="slip-foot">
        <span className="slip-note">45 soniyada</span>
        <span className="stamp stamp-in">Tasdiqlandi</span>
      </figcaption>
    </figure>
  );
}

export default function Hero({ s, tg }: { s: Settings; tg: string }) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-in">
        <div>
          <ul className="hero-steps">
            <li>
              <b className="tnum">01</b> E’lon berasiz
            </li>
            <li>
              <b className="tnum">02</b> Qamrovni tanlaysiz
            </li>
            <li>
              <b className="tnum">03</b> Hisobotni ko’rasiz
            </li>
          </ul>

          <HeroTitle title={s.hero_title} />

          <p className="hero-sub">{s.hero_sub}</p>

          <div className="btn-row hero-cta">
            <a
              href={tg}
              className="btn btn-primary"
              data-t="cta"
              data-t-id="hero_cta"
              data-tg
              rel="noopener"
            >
              <Telegram />
              {s.cta_primary}
            </a>
            <a href="#prices" className="btn btn-ghost" data-t="click" data-t-id="hero_prices">
              {s.cta_secondary}
            </a>
          </div>

          <ul className="hero-trust">
            <li>
              <Check size={14} /> Aniq narx
            </li>
            <li>
              <Check size={14} /> Humo · Uzcard · Payme
            </li>
            <li>
              <Check size={14} /> {s.reviews_count} foydalanuvchi
            </li>
          </ul>
        </div>

        <Slip />
      </div>
    </section>
  );
}
