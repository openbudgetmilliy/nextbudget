'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Jadval ustunlari bo'yicha saralash — Ads Manager uslubida.
 *
 * Nima qiladi: ustun sarlavhasini TUGMAGA aylantiradi. Birinchi bosishda
 * eng yaxshi natija tepada, yana bosilsa teskarisi. Ads Manager'da ish
 * shunday kechadi va bu tasodifiy emas: «eng yomon kadrni topib o'chirish»
 * ham, «eng yaxshisini topib byudjet quyish» ham bitta ustunning ikki uchi.
 *
 * «Eng yaxshi» ustun turiga qarab hal qilinadi:
 *   · raqamli ustun (bosish, sessiya, CR) — ko'pdan ozga, ya'ni `desc`
 *   · matnli ustun (kadr nomi, yo'l) — A→Z, ya'ni `asc`
 * Tur birinchi qatordagi qiymatdan aniqlanadi — alohida ro'yxat yuritish
 * shart emas va u eskirib qolmaydi.
 *
 * Nega mijoz tomonida (server emas): jadvallarda ko'pi bilan bir necha
 * o'n qator bor, saralash bir lahzada bo'ladi. Server tomonda qilinsa har
 * bosish DB so'roviga va sahifa qayta yuklanishiga aylanardi — Ads Manager
 * qulayligi aynan shu zudlikda.
 *
 * Dashboard'dagi 30 soniyalik avtoyangilanish tanlangan tartibni BUZMAYDI:
 * `router.refresh()` komponentni qaytadan ulamaydi, holat joyida qoladi.
 *
 * Ishlatilishi:
 *
 *   const GET = { nomi: (r) => r.name, bosish: (r) => r.clicks };  // modul darajasida
 *   const { rows, th } = useSort(data, GET, 'bosish');
 *   …
 *   <thead><tr>{th('nomi', 'Kadr')}{th('bosish', 'Bosildi', { num: true })}</tr></thead>
 *   <tbody>{rows.map(…)}</tbody>
 */
export type SortDir = 'asc' | 'desc';

/** Ustun kaliti → o'sha ustunning saralanadigan qiymati */
export type Getters<T> = Record<string, (row: T) => number | string>;

type ThOpts = { num?: boolean; style?: CSSProperties };

export function useSort<T>(
  rows: T[],
  get: Getters<T>,
  initialKey: string,
  initialDir: SortDir = 'desc',
): { rows: T[]; key: string; dir: SortDir; th: (k: string, label: ReactNode, o?: ThOpts) => ReactNode } {
  const [key, setKey] = useState(initialKey);
  const [dir, setDir] = useState<SortDir>(initialDir);

  const pick = get[key];
  const sign = dir === 'asc' ? 1 : -1;

  /**
   * Memo ATAYLAB yo'q: qatorlar bir necha o'nta, saralash mikrosoniyalarda
   * o'tadi. `get` obyekti har renderda yangi bo'lsa memo baribir bekor
   * bo'lardi, ya'ni foydasi yo'q, chalkashligi bor.
   *
   * `sort` barqaror (ES2019): teng qiymatli qatorlar dastlabki tartibida
   * qoladi — nol bosishli kadrlar kadr ro'yxati tartibida turadi, sakrab
   * ketmaydi.
   */
  const sorted = pick
    ? [...rows].sort((a, b) => {
        const x = pick(a);
        const y = pick(b);
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * sign;
        return String(x).localeCompare(String(y), 'uz') * sign;
      })
    : rows;

  function toggle(k: string) {
    if (k === key) {
      setDir((d) => (d === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setKey(k);
    // Yangi ustun — birinchi bosishda ENG YAXSHIsi tepada
    const sample = rows.length ? get[k]?.(rows[0]) : 0;
    setDir(typeof sample === 'number' ? 'desc' : 'asc');
  }

  function th(k: string, label: ReactNode, o?: ThOpts): ReactNode {
    const on = k === key;
    return (
      <th
        key={k}
        className={o?.num ? 'num' : undefined}
        style={o?.style}
        aria-sort={on ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}
      >
        <button
          type="button"
          className={on ? 'a-sort on' : 'a-sort'}
          onClick={() => toggle(k)}
          title={
            on
              ? dir === 'desc'
                ? 'Hozir: ko’pdan ozga · bosilsa teskarisi'
                : 'Hozir: ozdan ko’pga · bosilsa teskarisi'
              : 'Shu ustun bo’yicha saralash'
          }
        >
          {label}
          <span className="a-sort-i" aria-hidden>
            {on ? (dir === 'desc' ? '▼' : '▲') : '↕'}
          </span>
        </button>
      </th>
    );
  }

  return { rows: sorted, key, dir, th };
}
