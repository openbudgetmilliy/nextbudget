'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { TZ_LABEL, dayLabel, tashkentToday, tashkentYesterday, type Range } from '@/lib/range';

/**
 * DAVR TANLAGICH — analitikaning butun vaqt boshqaruvi.
 *
 * Ikki xil narsa ATAYIN ikki guruhga ajratilgan, chunki ular boshqa-boshqa
 * savolga javob beradi va aralashtirilsa chalkashlik chiqadi:
 *
 *   «Oxirgi» — HOZIRDAN orqaga siljiydigan oyna (24 soat, 3/7/30 kun).
 *              Soat 14:00 da «24 soat» — bu kechagi 14:00 dan beri.
 *   «Kun»    — TAQVIM kuni, Toshkent bo'yicha 00:00 dan 23:59 gacha.
 *              Soat 14:00 da «Bugun» — bu 00:00 dan 14:00 gacha.
 *
 * Kun tanlanganda yonida «‹ ›» chiqadi — kunma-kun orqaga/oldinga yurish
 * uchun. Kelajakka o'tilmaydi: `nextDay` bugundan keyin `null` bo'ladi.
 *
 * Soat oynasi ikkala uchi bilan qo'shib hisoblanadi: `09`–`18` — bu
 * 09:00:00 dan 18:59:59 gacha, o'n soat.
 *
 * Hisob-kitob bu yerda EMAS — `lib/range.ts` da, server bilan bitta
 * manbadan. Bu komponent faqat forma: qiymatni URL'ga yozadi, sahifa esa
 * URL'dan oraliqni qayta o'qiydi. Shu sabab tanlangan davr havolada
 * qoladi — yuborish ham, saqlab qo'yish ham mumkin.
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
  const yesterday = tashkentYesterday();

  const [open, setOpen] = useState(range.day !== null && (range.day2 !== null || range.h1 !== 0 || range.h2 !== 23));
  const [d1, setD1] = useState(range.day ?? today);
  const [d2, setD2] = useState(range.day2 ?? range.day ?? today);
  const [h1, setH1] = useState(range.h1);
  const [h2, setH2] = useState(range.h2);

  /**
   * Forma URL bilan mos tursin.
   *
   * Tugmalar (Bugun / Kecha / ‹ ›) URL'ni o'zgartiradi, komponent esa qayta
   * ULANMAYDI — holat eski qiymatda qolib ketardi va formani ochganda
   * butunlay boshqa sana ko'rinardi. Bu React'ning «propdan holatni
   * to'g'irlash» naqshi: renderda solishtirib, farq bo'lsa yangilaymiz.
   */
  const sig = `${range.day ?? ''}|${range.day2 ?? ''}|${range.h1}|${range.h2}|${range.preset ?? ''}`;
  const [seen, setSeen] = useState(sig);
  if (seen !== sig) {
    setSeen(sig);
    setD1(range.day ?? today);
    setD2(range.day2 ?? range.day ?? today);
    setH1(range.h1);
    setH2(range.h2);
  }

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

  /** Shu kun to'liq holda tanlanganmi (soat oynasisiz, bitta kun) */
  const isDay = (d: string) =>
    range.day === d && !range.day2 && range.h1 === 0 && range.h2 === 23;

  /** Kunma-kun siljish — soat oynasi saqlanadi */
  function step(day: string | null) {
    if (!day) return;
    const q: Record<string, string> = { d: day };
    if (range.h1 !== 0 || range.h2 !== 23) q.t = `${range.h1}-${range.h2}`;
    go(q);
  }

  const custom = range.day !== null && !isDay(today) && !isDay(yesterday);

  return (
    <div className="a-range">
      <div className="a-range-top">
        <span className="a-range-g">
          <b>Oxirgi</b>
          <span className="a-nav" role="group" aria-label="Oxirgi davr">
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
          </span>
        </span>

        <span className="a-range-g">
          <b>Kun</b>
          <span className="a-nav" role="group" aria-label="Taqvim kuni">
            <button
              type="button"
              className="a-range-step"
              onClick={() => step(range.prevDay)}
              disabled={!range.prevDay}
              title="Oldingi kun"
              aria-label="Oldingi kun"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go({ d: today })}
              aria-current={isDay(today) ? 'page' : undefined}
            >
              Bugun
            </button>
            <button
              type="button"
              onClick={() => go({ d: yesterday })}
              aria-current={isDay(yesterday) ? 'page' : undefined}
            >
              Kecha
            </button>
            <button
              type="button"
              className="a-range-step"
              onClick={() => step(range.nextDay)}
              disabled={!range.nextDay}
              title="Keyingi kun"
              aria-label="Keyingi kun"
            >
              ›
            </button>
          </span>
        </span>

        <button
          type="button"
          className={open || custom ? 'a-btn sm on' : 'a-btn sm'}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Sana va soat {open ? '▴' : '▾'}
        </button>
      </div>

      {open && (
        <div className="a-range-form">
          <label className="a-range-f">
            <span>Sana</span>
            <input
              type="date"
              className="a-in"
              value={d1}
              max={today}
              onChange={(e) => {
                setD1(e.target.value);
                if (e.target.value > d2) setD2(e.target.value);
              }}
            />
          </label>

          <label className="a-range-f">
            <span>…gacha</span>
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
              disabled={h1 === 0 && h2 === 23 && d1 === d2}
            >
              To’liq kun
            </button>
          </div>
        </div>
      )}

      <p className="a-range-now">
        <b>{range.fromLabel}</b> → <b>{range.isToday ? 'hozirgacha' : range.toLabel}</b>
        <span className="muted">
          {' · '}
          {TZ_LABEL} vaqti
          {range.day && (range.h1 !== 0 || range.h2 !== 23) ? ' · soat oynasi' : ''}
          {range.isToday ? ` · ${dayLabel(range.day!)} hali tugamagan` : ` · ${range.hours} soat`}
        </span>
      </p>
    </div>
  );
}
