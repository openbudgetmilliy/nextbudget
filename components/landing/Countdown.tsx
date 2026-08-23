'use client';

import { useEffect, useState } from 'react';

import { CAMPAIGN_END } from '@/lib/campaign';

import k from './countdown.module.css';

/**
 * Ovoz berish muddati — `/11` va `/12` kadrlarining pastidagi taymer.
 *
 * BITTA MANTIQ, KO'P KO'RINISH. Komponent faqat vaqtni sanaydi va
 * doim bir xil DOM chizadi; rang, shrift va o'lcham esa har kadrning
 * O'Z modulidan `classes` orqali keladi. Shu sabab `/11` da u ko'k
 * gradientdagi shisha katakka, `/12` da to'q kartaga o'xshaydi — lekin
 * kod bitta joyda turadi.
 *
 * `components/Timer.tsx` dan farqi: u kadrning pastki zonasidagi ixcham
 * taymer (izoh quti ICHIDA), bu esa izohsiz, to'rt katakli va serverdan
 * boshlang'ich qiymat oladi — shuning uchun ikkalasi alohida turadi.
 *
 * NEGA CLIENT: qolgan vaqtni serverda hisoblab bo'lmaydi. Sahifalar SSG
 * va keshdan keladi, ya'ni server bergan qiymat allaqachon eskirgan.
 * Landing'lardagi Tracker'dan boshqa yagona client element shu.
 *
 * HYDRATION: birinchi render `initial` (serverdan) bilan chiziladi, ya'ni
 * server va client HTML'i bir xil bo'ladi. Vaqt `useEffect` ichida —
 * hydration tugagandan keyin — to'g'irlanadi.
 *
 * `Date.now()` render paytida CHAQIRILMAYDI: u har renderda boshqa
 * natija berib, React'ni chalg'itardi.
 */

const UNITS = [
  { lab: 'kun', ms: 86_400_000 },
  { lab: 'soat', ms: 3_600_000 },
  { lab: 'daq', ms: 60_000 },
  { lab: 'son', ms: 1_000 },
] as const;

/** Qolgan millisekundni kun/soat/daqiqa/soniyaga bo'ladi */
function split(left: number): string[] {
  let rest = Math.max(0, left);
  return UNITS.map(({ ms }) => {
    const v = Math.floor(rest / ms);
    rest -= v * ms;
    return String(v).padStart(2, '0');
  });
}

export type CountdownClasses = {
  /** Tashqi o'ram — fon, chegara, tashqi bo'shliq */
  root?: string;
  /** Yuqoridagi qator: «Ovoz berish tugashiga qolgan vaqt» */
  lead?: string;
  /** To'rt katakning tori */
  grid?: string;
  /** Bitta katak */
  cell?: string;
  /** Katakdagi raqam */
  num?: string;
  /** Raqam ostidagi yorliq */
  lab?: string;
  /** Pastdagi izoh (masalan «Muddat 30-avgust, 23:59 da tugaydi») */
  note?: string;
};

export default function Countdown({
  initial,
  lead = '',
  note,
  classes = {},
}: {
  /** Serverda hisoblangan qolgan millisekund */
  initial: number;
  lead?: string;
  note?: string;
  classes?: CountdownClasses;
}) {
  const [left, setLeft] = useState(initial);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, CAMPAIGN_END - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const parts = split(left);

  return (
    <div className={cx(k.root, classes.root)}>
      {lead ? <p className={cx(k.lead, classes.lead)}>{lead}</p> : null}

      <ul className={cx(k.grid, classes.grid)}>
        {UNITS.map((u, i) => (
          <li key={u.lab} className={cx(k.cell, classes.cell)}>
            {/* `tabular-nums` skeletda: busiz raqam har soniyada kengligini
                o'zgartirib, kataklarni sakratib turardi */}
            <span className={cx(k.num, classes.num)}>{parts[i]}</span>
            <span className={cx(k.lab, classes.lab)}>{u.lab}</span>
          </li>
        ))}
      </ul>

      {note ? <p className={cx(k.note, classes.note)}>{note}</p> : null}
    </div>
  );
}

function cx(base: string, extra?: string): string {
  return extra ? `${base} ${extra}` : base;
}
