import { Check, Telegram } from './Icons';
import { SITE, applyVars } from '@/lib/content';
import type { Settings } from '@/lib/data';

/**
 * Sahifadagi yagona bo'lim.
 *
 * Tuzilishi savol-javob tartibida: bu nima (sarlavha) → qancha turadi (narx)
 * → qanday to'layman (izoh) → harakat (tugma). Narx ikkinchi o'rinda, chunki
 * foydalanuvchi shu yerga aynan shuni bilish uchun keladi.
 */

/** Narxni o'rab turuvchi to'rtta romb — logotipdagi to'rtta romb kabi */
const DIAMONDS = ['tl', 'tr', 'bl', 'br'] as const;

export default function Hero({ s, tg }: { s: Settings; tg: string }) {
  const vars = { narx: s.price_one_vote };

  /**
   * `hero_title` da tarixan `|` ajratgichi bor edi: undan keyingi qism narxni
   * takrorlardi. Endi narx alohida va katta ko'rsatiladi, shuning uchun faqat
   * ajratgichgacha bo'lgan qism olinadi — eski sozlama ham buzilmaydi.
   */
  const title = applyVars(s.hero_title, vars).split('|')[0].trim();

  return (
    <section className="stage" id="top">
      <div className="wrap stage-in">
        <p className="eyebrow">{s.hero_badge}</p>

        <h1>{title}</h1>

        <div className="price">
          {DIAMONDS.map((d) => (
            <span key={d} className={`price-dia price-dia-${d}`} aria-hidden="true" />
          ))}
          <p className="price-lab">1 ovoz narxi</p>
          <p className="price-fig">
            <span className="price-num tnum">{s.price_one_vote}</span>
            <span className="price-cur">so‘m</span>
          </p>
        </div>

        <p className="stage-sub">{applyVars(s.hero_sub, vars)}</p>

        <a href={tg} className="btn" data-t="cta" data-t-id="hero_cta" data-tg rel="noopener">
          <Telegram />
          {s.cta_primary}
        </a>

        <ul className="trust">
          <li>
            <Check /> Aniq narx
          </li>
          <li>
            <Check /> Humo · Uzcard · Payme
          </li>
          <li>
            <Check /> {s.reviews_count} foydalanuvchi
          </li>
        </ul>

        <p className="note">
          {SITE.brand} — mustaqil vositachi xizmat. Rasmiy{' '}
          <a href="https://openbudget.uz" rel="noopener nofollow" target="_blank">
            openbudget.uz
          </a>{' '}
          portali bilan bog‘liq emas. Savol bo‘lsa —{' '}
          <a href={`https://t.me/${s.support_username}`} rel="noopener" data-t="click" data-t-id="support">
            @{s.support_username}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
