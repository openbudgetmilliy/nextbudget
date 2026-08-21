'use client';

import Link from 'next/link';
import { adLink, pageOf } from '@/lib/pages';
import type { MergedRow } from '@/lib/stats';
import CopyLink from './CopyLink';
import { useSort, type Getters } from './useSort';

/**
 * SAHIFALAR KESIMI — analitikaning asosiy jadvali.
 *
 * Har bir kadr alohida reklama qilinadi, shuning uchun bitta jadvalda uch
 * savolga birdan javob bo'lishi kerak:
 *
 *   1. qaysi kadrga qancha odam kirdi va uni qanchasi ko'rdi,
 *   2. o'sha kadrdagi tugma necha marta va necha odam tomonidan bosildi,
 *   3. reklamaga qo'yiladigan havola qaysi (`showLinks`).
 *
 * Uch joyda ko'rsatiladi: Dashboard va Reklama'da havolasiz (u yerda
 * havolalar alohida panelda), Analitika'da havolasi bilan.
 *
 * Trafigi bo'lmagan kadr ham ATAYIN ko'rsatiladi (nol bilan): reklama
 * yoqilgan-yoqilmagani shu yerdan bilinadi (`mergePageRows`, lib/stats.ts).
 * Ro'yxatda yo'q, lekin statistikada uchragan yo'llar ham yo'qolmaydi.
 *
 * Ustun sarlavhalari — tugma: bosilsa o'sha ustun bo'yicha saralanadi, yana
 * bosilsa teskarisiga (`useSort`). Boshlang'ich tartib — «Bosildi» bo'yicha
 * ko'pdan ozga.
 */
const GET: Getters<MergedRow> = {
  name: (r) => r.name,
  sessions: (r) => r.sessions,
  viewers: (r) => r.viewers,
  clicks: (r) => r.clicks,
  clickUsers: (r) => r.clickUsers,
  cr: (r) => r.cr,
};

export default function PageStats({
  rows,
  siteUrl,
  showLinks = false,
}: {
  rows: MergedRow[];
  /** `showLinks` bo'lsa shart — reklama havolasi shu manzildan yasaladi */
  siteUrl?: string;
  showLinks?: boolean;
}) {
  const { rows: sorted, th } = useSort(rows, GET, 'clicks');

  // Ko'rsatkichlar BUTUN jadvaldan olinadi — saralash ularni o'zgartirmaydi
  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);
  const totalEntries = rows.reduce((a, r) => a + r.sessions, 0);
  const totalClicks = rows.reduce((a, r) => a + r.clicks, 0);

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Sahifalar bo’yicha — kim keldi, kim bosdi</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
          {totalEntries} kirish · {totalClicks} bosish
        </span>
      </div>
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              {th('name', 'Sahifa')}
              {th('sessions', 'Kirdi', { num: true })}
              {th('viewers', 'Ko’rdi', { num: true })}
              {th('clicks', 'Bosildi', { num: true })}
              {th('clickUsers', 'Bosgan odam', { num: true })}
              {th('cr', 'CR', { num: true })}
              <th style={{ width: 120 }} />
              {showLinks && <th>Reklama havolasi</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.page}>
                <td>
                  {/* Nom — KADR ANALITIKASIGA, yo'l esa jonli sahifaga.
                      Ikkisi ikki xil ish: biri raqamlarni ochadi, ikkinchisi
                      sahifaning o'zini yangi oynada. */}
                  {r.slug ? (
                    <Link href={`/admin/kadr/${r.slug}`} style={{ fontWeight: 650 }}>
                      {r.name}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: 650 }}>{r.page}</span>
                  )}
                  <div className="muted" style={{ fontSize: 12 }}>
                    {r.known ? (
                      <>
                        <a href={r.page} target="_blank" rel="noopener" className="muted">
                          {r.page}
                        </a>{' '}
                        · {r.note}
                      </>
                    ) : (
                      'ro’yxatda yo’q'
                    )}
                  </div>
                </td>
                <td className="num">{r.sessions}</td>
                <td className="num">{r.viewers}</td>
                <td className="num" style={{ fontWeight: 700 }}>
                  {r.clicks}
                </td>
                <td className="num">{r.clickUsers}</td>
                <td
                  className="num"
                  style={{ fontWeight: 700, color: r.cr > 0 ? '#34d399' : undefined }}
                >
                  {r.cr}%
                </td>
                <td>
                  <span className="a-bar-t" style={{ display: 'block' }}>
                    <span
                      className="a-bar-f"
                      style={{ width: `${Math.round((r.clicks / maxClicks) * 100)}%` }}
                    />
                  </span>
                </td>
                {showLinks && (
                  <td>
                    {siteUrl ? <AdCell siteUrl={siteUrl} path={r.page} /> : null}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showLinks && (
        <div className="a-panel-b" style={{ borderTop: '1px solid #1b2331' }}>
          <p style={{ fontSize: 12.5, color: '#59637a', lineHeight: 1.65, margin: 0 }}>
            Har kadr uchun havola alohida — reklamani qaysi biriga qo’ysangiz, kirganlar shu
            qatorda sanaladi. Manba va kampaniya nomini o’zgartirish kerak bo’lsa,{' '}
            <Link href="/admin/reklama">Reklama</Link> tabidan oling — u yerda <code>utm_source</code>,{' '}
            <code>utm_medium</code> va <code>utm_campaign</code> ni o’zingiz tanlaysiz.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Reklama havolasi katagi.
 *
 * Kadr YO'L bo'yicha topiladi (`pageOf` — topilmasa `undefined` qaytaradi,
 * yiqilmaydi). Ro'yxatda yo'q yo'llar — o'chirilgan kadr yoki eski havola —
 * uchun havola yasashning ma'nosi yo'q, katak bo'sh qoladi.
 */
function AdCell({ siteUrl, path }: { siteUrl: string; path: string }) {
  const page = pageOf(path);
  if (!page) return <span className="muted">—</span>;

  const url = adLink(siteUrl, page);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <code style={{ fontSize: 11.5, color: '#93a1b8', whiteSpace: 'nowrap' }}>
        {url.replace(/^https?:\/\//, '')}
      </code>
      <CopyLink url={url} />
    </div>
  );
}
