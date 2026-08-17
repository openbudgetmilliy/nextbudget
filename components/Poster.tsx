import type { ReactNode } from 'react';

import { Check } from './Icons';
import { SITE, applyVars, titleLines } from '@/lib/content';
import type { Settings } from '@/lib/data';

/**
 * Plakat — saytdagi YAGONA kompozitsiya.
 *
 * Darvoza (`/`) va landing (`/l`) shu bitta komponentdan quriladi va faqat
 * bitta joyi bilan farq qiladi: `action` uyasi. Darvozada u jarayon chizig'i,
 * landingda esa botga o'tish tugmasi.
 *
 * Nega shunday: darvoza tekshiruvi bir necha soniya oladi va bu vaqtni bo'sh
 * kutish ekranida o'tkazish — yo'qotilgan vaqt. Ikkala sahifa bir xil
 * ko'ringanda foydalanuvchi tekshiruv paytida narxni allaqachon o'qiydi, o'tish
 * esa sezilmaydi: joyida faqat chiziq tugmaga almashadi.
 */
export default function Poster({
  s,
  action,
}: {
  s: Settings;
  /** Tugma yoki tekshiruv holati — sahifaning yagona farqi */
  action: ReactNode;
}) {
  const vars = { narx: s.price_one_vote };

  /**
   * `hero_title` da tarixan `|` ajratgichi bor edi: undan keyingi qism narxni
   * takrorlardi. Narx endi alohida va katta, shuning uchun faqat
   * ajratgichgacha bo'lgan qism olinadi — eski sozlama ham buzilmaydi.
   */
  const lines = titleLines(applyVars(s.hero_title, vars).split('|')[0]);

  return (
    <section className="stage" id="top">
      <div className="wrap stage-in">
        {s.hero_badge ? <p className="eyebrow">{s.hero_badge}</p> : null}

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

        {action}

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
