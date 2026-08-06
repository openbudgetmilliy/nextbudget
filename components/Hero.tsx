import { Check, Telegram } from './Icons';
import { SITE, applyVars } from '@/lib/content';
import type { Settings } from '@/lib/data';

/**
 * Sahifadagi yagona bo'lim — plakat.
 *
 * Tartib: yorliq → sarlavha → narx → izoh → tugma. Hammasi chapga
 * tekislangan, hech bir plita butun kenglikni egallamaydi.
 */

/**
 * Sarlavhani qatorlarga bo'ladi — har bir so'z alohida qatorda turadi va
 * shu sabab harflar juda katta bo'la oladi.
 *
 * Admin uzun sarlavha yozsa (masalan 6 so'z) har biri alohida qator bo'lsa
 * ekranga sig'masdi — shuning uchun 3 tadan ko'p so'z uchta qatorga tekis
 * taqsimlanadi.
 */
function toLines(title: string): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 3) return words;

  const per = Math.ceil(words.length / 3);
  return [0, 1, 2].map((i) => words.slice(i * per, (i + 1) * per).join(' ')).filter(Boolean);
}

export default function Hero({ s, tg }: { s: Settings; tg: string }) {
  const vars = { narx: s.price_one_vote };

  /**
   * `hero_title` da tarixan `|` ajratgichi bor edi: undan keyingi qism narxni
   * takrorlardi. Narx endi alohida va katta, shuning uchun faqat
   * ajratgichgacha bo'lgan qism olinadi — eski sozlama ham buzilmaydi.
   */
  const lines = toLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <section className="stage" id="top">
      <div className="wrap stage-in">
        <p className="eyebrow">{s.hero_badge}</p>

        <h1>
          {lines.map((line, i) => (
            // Oxirgi qator yashil plitada — ko'z avval shunga tushadi
            <span key={line} className={i === lines.length - 1 ? 'hl' : undefined}>
              {line}
            </span>
          ))}
        </h1>

        <div className="slab">
          <p className="slab-lab">1 ovoz narxi</p>
          <p className="slab-fig">
            <span className="slab-num tnum">{s.price_one_vote}</span>
            <span className="slab-cur">so‘m</span>
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
          <a
            href={`https://t.me/${s.support_username}`}
            rel="noopener"
            data-t="click"
            data-t-id="support"
          >
            @{s.support_username}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
