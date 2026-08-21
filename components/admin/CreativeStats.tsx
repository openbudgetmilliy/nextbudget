'use client';

import type { CreativeRow } from '@/lib/stats';
import { useSort, type Getters } from './useSort';

/**
 * «Instagram kreativlari bo'yicha konversiya» jadvali.
 *
 * Analitika sahifasidan alohida komponentga chiqarilgan — ustun sarlavhalari
 * saralash tugmasiga aylanishi uchun mijoz tomonida bo'lishi kerak
 * (`useSort`). Boshlang'ich tartib — sessiya bo'yicha ko'pdan ozga, ya'ni
 * eng ko'p trafik olib kelgan kreativ tepada. CR sarlavhasini bosib
 * «eng samarali kreativ» tartibiga bir bosishda o'tiladi.
 */
const GET: Getters<CreativeRow> = {
  content: (r) => r.utmContent ?? '',
  campaign: (r) => r.utmCampaign ?? '',
  sessions: (r) => r.sessions,
  conv: (r) => r.conv,
  cr: (r) => r.cr,
};

export default function CreativeStats({ rows }: { rows: CreativeRow[] }) {
  const { rows: sorted, th } = useSort(rows, GET, 'sessions');
  const bestCr = Math.max(...rows.map((c) => c.cr), 0);

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Instagram kreativlari bo’yicha konversiya</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
          kamida 3 sessiya bo’lganlar
        </span>
      </div>
      {rows.length ? (
        <div className="a-tw">
          <table className="a-t">
            <thead>
              <tr>
                {th('content', 'utm_content (kreativ)')}
                {th('campaign', 'Kampaniya')}
                {th('sessions', 'Sessiya', { num: true })}
                {th('conv', 'Botga o’tdi', { num: true })}
                {th('cr', 'CR', { num: true })}
                <th style={{ width: 160 }} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={`${c.utmContent}-${c.utmCampaign}-${i}`}>
                  <td>
                    <span className="a-tag ig">{c.utmContent ?? 'utm yo’q'}</span>
                  </td>
                  <td className="muted">{c.utmCampaign ?? '—'}</td>
                  <td className="num">{c.sessions}</td>
                  <td className="num">{c.conv}</td>
                  <td
                    className="num"
                    style={{ fontWeight: 700, color: c.cr >= bestCr && bestCr > 0 ? '#34d399' : undefined }}
                  >
                    {c.cr}%
                  </td>
                  <td>
                    <span className="a-bar-t" style={{ display: 'block' }}>
                      <span
                        className="a-bar-f"
                        style={{ width: `${bestCr ? Math.round((c.cr / bestCr) * 100) : 0}%` }}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="a-empty">
          Kreativ ma’lumoti yo’q. Har reklama havolasiga <code>utm_content</code> qo’ying:
          <br />
          <code>https://milliyjamoasi.uz/?utm_source=instagram&amp;utm_content=reel_01</code>
        </div>
      )}
    </div>
  );
}
