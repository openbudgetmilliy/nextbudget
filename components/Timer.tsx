'use client';

import { useEffect, useState } from 'react';
import { CAMPAIGN_END } from '@/lib/campaign';

/**
 * Ixcham muddat taymeri — har kadrning pastki zonasida, o'sha kadr uslubida.
 *
 * Uslub sinflari chaqiruvchi sahifaning CSS modulidan keladi (`classes`),
 * shuning uchun bitta komponent yettala palitraga mos tushadi. SSR birinchi
 * kadrda «00»larni chizadi (server va mijoz soati farqi gidratatsiyani
 * buzmasin), mount bo'lgach har soniyada yangilanadi.
 *
 * Sana — `lib/campaign.ts` da, bitta joyda.
 */
type Classes = {
  box: string;
  caption: string;
  grid: string;
  cell: string;
  num: string;
  lab: string;
  over: string;
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');
const LABELS = ['kun', 'soat', 'daq', 'son'] as const;

export default function Timer({ classes: x }: { classes: Classes }) {
  const [v, setV] = useState<string[] | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = CAMPAIGN_END - Date.now();
      if (diff <= 0) {
        setOver(true);
        return;
      }
      setV([
        pad(Math.floor(diff / 86_400_000)),
        pad(Math.floor((diff % 86_400_000) / 3_600_000)),
        pad(Math.floor((diff % 3_600_000) / 60_000)),
        pad(Math.floor((diff % 60_000) / 1_000)),
      ]);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (over) {
    return <p className={x.over}>Ovoz berish muddati tugadi.</p>;
  }

  return (
    <div className={x.box} role="timer" aria-label="Ovoz berish tugashiga qolgan vaqt">
      <p className={x.caption}>Muddat tugashiga:</p>
      <div className={x.grid}>
        {LABELS.map((lab, i) => (
          <div key={lab} className={x.cell}>
            <div className={x.num}>{v?.[i] ?? '00'}</div>
            <div className={x.lab}>{lab}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
