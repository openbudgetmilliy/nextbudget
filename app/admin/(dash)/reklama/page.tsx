import AdLinks from '@/components/admin/AdLinks';
import DbDown from '@/components/admin/DbDown';
import PageStats, { mergePageRows } from '@/components/admin/PageStats';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import { env } from '@/lib/env';
import { LANDING_PAGES } from '@/lib/pages';
import { pageButtons, pageStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reklama' };

/**
 * «Reklama» — yettita kadrni alohida yuritish uchun bitta joy.
 *
 * Yuqorida: har kadr uchun tayyor havola (utm bilan).
 * Pastida: o'sha havolalar nima olib kelayotgani — kirgan odam soni va
 * tugma bosilishi. Ikkalasi bir ekranda turishi ataylab: havolani ko'chirib
 * qo'yib, ertasiga shu yerdan natijani ko'rish kerak.
 */
export default async function AdsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const hours = parseHours((await searchParams).h, 168);

  let rows;
  let btns;
  try {
    [rows, btns] = await Promise.all([pageStats(hours), pageButtons(hours)]);
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Reklama</h1>
        {/* Havolalar DB'siz ham kerak — ular faqat ro'yxatdan yasaladi */}
        <AdLinks siteUrl={env.SITE_URL} pages={LANDING_PAGES} />
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const merged = mergePageRows(rows);

  return (
    <>
      <h1 className="a-h1">Reklama</h1>
      <p className="a-sub">Har kadr — alohida havola, alohida statistika</p>

      <AdLinks siteUrl={env.SITE_URL} pages={LANDING_PAGES} />

      <div className="a-row">
        <RangePicker base="/admin/reklama" hours={hours} />
      </div>

      <PageStats rows={merged} hours={hours} />

      <div className="a-panel">
        <div className="a-panel-h">Sahifa × tugma</div>
        {btns.length ? (
          <div className="a-tw">
            <table className="a-t">
              <thead>
                <tr>
                  <th>Sahifa</th>
                  <th>Tugma</th>
                  <th>Matn</th>
                  <th className="num">Bosish</th>
                  <th className="num">Foydalanuvchi</th>
                </tr>
              </thead>
              <tbody>
                {btns.map((b, i) => (
                  <tr key={`${b.page}-${b.elId}-${i}`}>
                    <td>
                      <span className="a-tag">{b.page}</span>
                    </td>
                    <td>{b.elId ?? '—'}</td>
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
          <div className="a-empty">Hali birorta tugma bosilmagan</div>
        )}
      </div>
    </>
  );
}
