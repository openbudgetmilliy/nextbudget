'use client';

import { pageLabel } from '@/lib/pages';
import type { PageButtonRow } from '@/lib/stats';
import { useSort, type Getters } from './useSort';

/**
 * «Tugmalar reytingi» — qaysi kadrda qaysi tugma necha marta bosilgan.
 *
 * Analitika sahifasidan alohida komponentga chiqarilgan: ustun sarlavhalari
 * saralash tugmasi bo'lishi uchun mijoz tomonida kerak (`useSort`).
 * Boshlang'ich tartib — bosish bo'yicha ko'pdan ozga.
 *
 * Sahifa ustuni YO'L bo'yicha emas, KO'RINADIGAN nom bo'yicha saralanadi —
 * jadvalda odam nimani ko'rsa, o'sha tartibda chiqadi.
 */
const GET: Getters<PageButtonRow> = {
  page: (r) => pageLabel(r.page),
  el: (r) => r.elId ?? '',
  text: (r) => r.elText ?? '',
  clicks: (r) => r.clicks,
  users: (r) => r.users,
};

export default function ButtonStats({ rows }: { rows: PageButtonRow[] }) {
  const { rows: sorted, th } = useSort(rows, GET, 'clicks');

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Tugmalar reytingi</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
          sahifa + tugma kesimida
        </span>
      </div>
      {rows.length ? (
        <div className="a-tw">
          <table className="a-t">
            <thead>
              <tr>
                {th('page', 'Sahifa')}
                {th('el', 'Tugma')}
                {th('text', 'Matn')}
                {th('clicks', 'Bosish', { num: true })}
                {th('users', 'Foydalanuvchi', { num: true })}
              </tr>
            </thead>
            <tbody>
              {/* `elId` kadrlarda takrorlanadi (`/6` va `/7` da ham `bot`),
                  shuning uchun qator kaliti sahifa bilan birga */}
              {sorted.map((b, i) => (
                <tr key={`${b.page}-${b.elId}-${i}`}>
                  <td className="muted">{pageLabel(b.page)}</td>
                  <td>
                    <span className="a-tag">{b.elId ?? '—'}</span>
                  </td>
                  <td className="muted">{b.elText ?? '—'}</td>
                  <td className="num" style={{ fontWeight: 700 }}>
                    {b.clicks}
                  </td>
                  <td className="num">{b.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="a-empty">CTA bosilmagan</div>
      )}
    </div>
  );
}
