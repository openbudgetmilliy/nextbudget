'use client';

import { useEffect, useState } from 'react';
import { CAMPAIGN_END } from '@/lib/campaign';
import c from './page.module.css';

/**
 * Muddat taymeri (katta karta ko'rinishi) — mijoz tomonida sanaydi.
 *
 * `/8` dagi `Countdown` ning nusxasi: kadrlar mustaqil bo'lsin deb ataylab
 * ko'chirilgan (uslub sinflari SHU kadrning CSS modulidan olinadi). Umumiy
 * `components/Timer.tsx` bu yerga to'g'ri kelmaydi — undagi karkas boshqa
 * (izoh quti ichida), bu yerda esa izoh kartochkada, plitkalar alohida.
 *
 * SSR birinchi kadrda «00 00 00 00» chizadi (server soati bilan mijoz soati
 * farq qilishi mumkin, gidratatsiya to'qnashmasin), mount bo'lgach har
 * soniyada yangilanadi. Muddat o'tsa plitkalar o'rniga «muddat tugadi»
 * chiqadi.
 *
 * Sana — `lib/campaign.ts` da (barcha kadrlar bilan bitta).
 */
const END = CAMPAIGN_END;

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export default function Countdown() {
  const [t, setT] = useState<{ d: string; h: string; m: string; s: string } | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = END - Date.now();
      if (diff <= 0) {
        setOver(true);
        return;
      }
      setT({
        d: pad(Math.floor(diff / 86_400_000)),
        h: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
        m: pad(Math.floor((diff % 3_600_000) / 60_000)),
        s: pad(Math.floor((diff % 60_000) / 1_000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (over) {
    return <p className={c.cdOver}>Ovoz berish muddati tugadi.</p>;
  }

  const cells = [
    { v: t?.d ?? '00', l: 'kun' },
    { v: t?.h ?? '00', l: 'soat' },
    { v: t?.m ?? '00', l: 'daq' },
    { v: t?.s ?? '00', l: 'son' },
  ];

  return (
    <div className={c.cd} role="timer" aria-label="Ovoz berish tugashiga qolgan vaqt">
      {cells.map((x) => (
        <div key={x.l} className={c.cdCell}>
          <div className={`${c.cdNum} tnum`}>{x.v}</div>
          <div className={c.cdLab}>{x.l}</div>
        </div>
      ))}
    </div>
  );
}
