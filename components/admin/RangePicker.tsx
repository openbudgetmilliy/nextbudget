'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  TZ_LABEL,
  dayLabel,
  tashkentToday,
  tashkentYesterday,
  type Range,
} from '@/lib/range';

/**
 * DAVR TANLAGICH — analitikaning butun vaqt boshqaruvi shu yerda.
 *
 * Uch usul, bittasi ishlaydi:
 *
 *   1. Tayyor tugmalar — «24 soat», «3 kun», «7 kun», «30 kun». Bular
 *      HOZIRDAN orqaga sanaydi (`?h=`), ya'ni «oxirgi sutka».
 *   2. «Bugun» / «Kecha» — TOSHKENT kuni: 00:00 dan 23:59 gacha (`?d=`).
 *      Bu «oxirgi 24 soat» dan boshqa narsa: soat 14:00 da «Bugun» —
 *      bu 00:00–14:00, kechagi tun emas.
 *   3. Kun (yoki kunlar oralig'i) + SOAT OYNASI — masalan 22-avgust,
 *      09:00 dan 18:59 gacha. Reklama qaysi soatlarda ishlayotganini
 *      shu bilan ko'rasiz.
 *
 * Soat oynasining ikkala uchi ham QO'SHIB hisoblanadi: `09`–`18` — bu
 * 09:00:00 dan 18:59:59 gacha, ya'ni o'n soat. `00`–`23` — to'liq kun.
 *
 * Hisob-kitob bu yerda EMAS — `lib/range.ts` da, server bilan bitta
 * manbadan. Bu komponent faqat forma: qiymatlarni URL'ga yozadi, sahifa
 * esa o'sha URL'dan oraliqni qayta o'qiydi. Shu sabab tanlangan davr
 * havolada saqlanadi — uni yuborish ham, saqlab qo'yish ham mumkin.
 */
const PRESETS = [
  { h: 24, label: '24 soat' },
  { h: 72, label: '3 kun' },
  { h: 168, label: '7 kun' },
  { h: 720, label: '30 kun' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

export default function RangePicker({
  base,
  range,
  extra = {},
}: {
  base: string;
  range: Range;
  /** Sahifaning o'z parametrlari (masalan `conv=1`) — davr o'zgarganda yo'qolmasin */
  extra?: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const today = tashkentToday();
  const [open, setOpen] = useState(range.day !== null);
  const [d1, setD1] = useState(range.day ?? today);
  const [d2, setD2] = useState(range.day2 ?? range.day ?? today);
  const [h1, setH1] = useState(range.h1);
  const [h2, setH2] = useState(range.h2);

  function go(q: Record<string, string>) {
    const p = new URLSearchParams({ ...extra, ...q });
    startTransition(() => router.push(`${base}?${p.toString()}`, { scroll: false }));
  }

  function apply() {
    const q: Record<string, string> = { d: d1 };
    if (d2 && d2 !== d1) q.d2 = d2;
    if (h1 !== 0 || h2 !== 23) q.t = `${h1}-${h2}`;
    go(q);
  }

  const dayActive = (d: string) => range.day === d && !range.day2 && range.h1 === 0 && range.h2 === 23;

  return (
    <div className="a-range">
      <div className="a-range-top">
        <div className="a-nav" role="group" aria-label="Davr">
          {PRESETS.map((p) => (
            <button
              key={p.h}
              type="button"
              onClick={() => go({ h: String(p.h) })}
              aria-current={range.preset === p.h ? 'page' : undefined}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => go({ d: today })}
            aria-current={dayActive(today) ? 'page' : undefined}
          >
            Bugun
          </button>
          <button
            type="button"
            onClick={() => go({ d: tashkentYesterday() })}
            aria-current={dayActive(tashkentYesterday()) ? 'page' : undefined}
          >
            Kecha
          </button>
        </div>

        <button
          type="button"
          className={open ? 'a-btn sm on' : 'a-btn sm'}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Kun va soat {open ? '▴' : '▾'}
        </button>
      </div>

      {open && (
        <div className="a-range-form">
          <label className="a-range-f">
            <span>Kun</span>
            <input
              type="date"
              className="a-in"
              value={d1}
              max={today}
              onChange={(e) => {
                setD1(e.target.value);
                // Ikkinchi sana birinchisidan oldin qolib ketmasin
                if (e.target.value > d2) setD2(e.target.value);
              }}
            />
          </label>

          <label className="a-range-f">
            <span>…gacha (ixtiyoriy)</span>
            <input
              type="date"
              className="a-in"
              value={d2}
              min={d1}
              max={today}
              onChange={(e) => setD2(e.target.value)}
            />
          </label>

          <label className="a-range-f">
            <span>Soat</span>
            <span className="a-range-h">
              <select className="a-in" value={h1} onChange={(e) => setH1(Number(e.target.value))}>
                {HOURS.map((x, i) => (
                  <option key={x} value={i}>
                    {x}:00
                  </option>
                ))}
              </select>
              <i>–</i>
              <select className="a-in" value={h2} onChange={(e) => setH2(Number(e.target.value))}>
                {HOURS.map((x, i) => (
                  <option key={x} value={i}>
                    {x}:59
                  </option>
                ))}
              </select>
            </span>
          </label>

          <div className="a-range-act">
            <button className="a-btn p sm" type="button" onClick={apply} disabled={pending}>
              {pending ? '…' : 'Ko’rsatish'}
            </button>
            <button
              className="a-btn sm"
              type="button"
              onClick={() => {
                setH1(0);
                setH2(23);
                setD2(d1);
              }}
            >
              To’liq kun
            </button>
          </div>
        </div>
      )}

      <p className="a-range-now">
        {range.day ? (
          <>
            <b>{range.day2 ? `${dayLabel(range.day)} – ${dayLabel(range.day2)}` : dayLabel(range.day)}</b>
            {(range.h1 !== 0 || range.h2 !== 23) && (
              <>
                {' · '}
                {String(range.h1).padStart(2, '0')}:00–{String(range.h2).padStart(2, '0')}:59
              </>
            )}
          </>
        ) : (
          <>
            <b>{range.label}</b> — hozirdan orqaga
          </>
        )}
        <span className="muted"> · {TZ_LABEL} vaqti · {range.hours} soat</span>
      </p>
    </div>
  );
}
