import { Check, Telegram } from './Icons';
import { SITE, applyVars } from '@/lib/content';
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
 * Brend belgisi — hero'ning o'ng ustuni.
 *
 * Avval bu yerda namuna chek turardi (tashabbus №12, summa, muhr). U o'ylab
 * topilgan ma'lumot edi; brend belgisi esa haqiqiy va tanilishi kerak.
 * Plita ikki rejimda ham oq — belgi rangli va oq fonda eng aniq ko'rinadi.
 */
function BrandMark() {
  return (
    <div className="hero-mark">
      <img
        src="/logo-hero.webp"
        alt={`${SITE.brand} belgisi`}
        width={300}
        height={300}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}

export default function Hero({ s, tg }: { s: Settings; tg: string }) {
  // `{narx}` → `price_one_vote`. Narx bitta joyda (/admin/prices) o'zgaradi.
  const vars = { narx: s.price_one_vote };

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

          <HeroTitle title={applyVars(s.hero_title, vars)} />

          <p className="hero-sub">{applyVars(s.hero_sub, vars)}</p>

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
            <a href="#how" className="btn btn-ghost" data-t="click" data-t-id="hero_how">
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

        <BrandMark />
      </div>
    </section>
  );
}
