import Link from 'next/link';
import { LANDING_PAGES, pageOf } from '@/lib/pages';
import type { PageRow } from '@/lib/stats';

/**
 * «Qaysi kadrdan qancha odam keldi» jadvali.
 *
 * Uch joyda ko'rsatiladi (Dashboard, Analitika, Reklama), shuning uchun
 * alohida komponent. Server component — hech qanday holat yo'q.
 *
 * MUHIM: jadval `LANDING_PAGES` tartibida chiziladi va statistikasi NOL
 * bo'lgan kadr ham qatorda qoladi. Sababi: nol — bu ma'lumot yo'qligi emas,
 * «bu kadrga reklama umuman kelmayapti» degani, aynan shuni ko'rish kerak.
 * Faqat bazadagi qatorlarni chizsak, o'lik kadr jadvaldan yo'qolib ketardi.
 */
export type MergedRow = PageRow & { name: string; note: string; known: boolean; slug?: string };

export function mergePageRows(rows: PageRow[]): MergedRow[] {
  const byPath = new Map(rows.map((r) => [r.page, r]));

  const known: MergedRow[] = LANDING_PAGES.map((p) => {
    const r = byPath.get(p.path);
    byPath.delete(p.path);
    return {
      page: p.path,
      sessions: r?.sessions ?? 0,
      conv: r?.conv ?? 0,
      clicks: r?.clicks ?? 0,
      clickUsers: r?.clickUsers ?? 0,
      cr: r?.cr ?? 0,
      name: p.name,
      note: p.note,
      known: true,
      slug: p.slug,
    };
  });

  // Ro'yxatda yo'q yo'llar (o'chirilgan kadr, bot, `—`) — oxirida, alohida
  const rest: MergedRow[] = [...byPath.values()].map((r) => ({
    ...r,
    name: pageOf(r.page)?.name ?? '—',
    note: 'Ro’yxatda yo’q sahifa',
    known: false,
  }));

  return [...known, ...rest];
}

export default function PageStats({ rows, hours }: { rows: MergedRow[]; hours: number }) {
  const maxSessions = Math.max(...rows.map((r) => r.sessions), 1);
  const bestCr = Math.max(...rows.map((r) => (r.sessions >= 5 ? r.cr : 0)), 0);

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Sahifalar bo’yicha — qaysi kadr ishlayapti</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
          {hours} soat ichida
        </span>
      </div>
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th>Kadr</th>
              <th>Yo’l</th>
              <th className="num">Kirdi</th>
              <th className="num">Tugma bosildi</th>
              <th className="num">Bosgan odam</th>
              <th className="num">CR</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.page}>
                <td style={{ fontWeight: 600 }}>
                  {/* Qator nomi — kadrning alohida analitika sahifasiga */}
                  {r.slug ? (
                    <Link href={`/admin/kadr/${r.slug}`} style={{ textDecoration: 'none' }}>
                      {r.name} →
                    </Link>
                  ) : (
                    r.name
                  )}
                  <span className="muted" style={{ display: 'block', fontSize: 12 }}>
                    {r.note}
                  </span>
                </td>
                <td>
                  {r.known ? (
                    <a
                      className="a-tag"
                      href={r.page}
                      target="_blank"
                      rel="noopener"
                      title="Kadrni ochish"
                    >
                      {r.page} ↗
                    </a>
                  ) : (
                    <span className="a-tag no">{r.page}</span>
                  )}
                </td>
                <td className="num">{r.sessions}</td>
                {/* Asosiy ustun: aynan shu kadrdagi tugma necha marta bosilgan */}
                <td className="num" style={{ fontWeight: 700, color: r.clicks ? '#34d399' : undefined }}>
                  {r.clicks}
                </td>
                <td className="num">{r.clickUsers}</td>
                <td
                  className="num"
                  style={{ fontWeight: 700, color: bestCr > 0 && r.cr >= bestCr ? '#34d399' : undefined }}
                >
                  {r.cr}%
                </td>
                <td>
                  <span className="a-bar-t" style={{ display: 'block' }}>
                    <span
                      className="a-bar-f"
                      style={{ width: `${Math.round((r.sessions / maxSessions) * 100)}%` }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
