import { pageLabel } from '@/lib/pages';
import type { RecentCta as Row } from '@/lib/stats';

/**
 * «Oxirgi CTA bosishlar» — Dashboard va Analitikada bir xil panel.
 *
 * Vaqt TOSHKENT mintaqasida chiziladi. Bu muhim: `ts` ustunida UTC
 * devor-soati yotibdi va uni to'g'ridan-to'g'ri `toLocaleTimeString` ga
 * bersak, brauzer uni O'Z mintaqasida o'qib, besh soat siljitardi.
 * Shuning uchun serverda +5 qo'shib, UTC sifatida chizamiz — natija
 * admin qayerda o'tirganidan qat'i nazar bir xil.
 */
const TZ_MS = 5 * 3_600_000;

function tashkentClock(ts: Date | string): string {
  const t = new Date(new Date(ts).getTime() + TZ_MS);
  return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
}

export default function RecentCta({ rows }: { rows: Row[] }) {
  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Oxirgi CTA bosishlar</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>Toshkent vaqti</span>
      </div>
      {rows.length ? (
        <div className="a-tw">
          <table className="a-t">
            <thead>
              <tr>
                <th>Vaqt</th>
                <th>Sahifa</th>
                <th>Tugma</th>
                <th>Kreativ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={`${c.sessionId}-${i}`}>
                  <td className="muted">{tashkentClock(c.ts)}</td>
                  <td>
                    <span className="a-tag">{pageLabel(c.page)}</span>
                  </td>
                  <td className="muted">{c.elId ?? '—'}</td>
                  <td className="muted">{c.utmContent ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="a-empty">Bu davrda CTA bosilmagan</div>
      )}
    </div>
  );
}
