import DbDown from '@/components/admin/DbDown';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import { breakdown, creatives, scrollFunnel, topButtons } from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analitika' };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const hours = parseHours((await searchParams).h, 168);

  let d;
  try {
    const [cre, btns, scroll, device, browser, os, source] = await Promise.all([
      creatives(hours),
      topButtons(hours),
      scrollFunnel(hours),
      breakdown('device', hours),
      breakdown('browser', hours),
      breakdown('os', hours),
      breakdown('utmSource', hours),
    ]);
    d = { cre, btns, scroll, device, browser, os, source };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Analitika</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const maxScroll = Math.max(...d.scroll.map((s) => s.users), 1);
  const bestCr = Math.max(...d.cre.map((c) => c.cr), 0);

  return (
    <>
      <h1 className="a-h1">Analitika</h1>
      <p className="a-sub">Qaysi kreativ pul olib kelayotganini shu yerda ko’rasiz</p>

      <div className="a-row">
        <RangePicker base="/admin/analytics" hours={hours} />
      </div>

      {/* ── Kreativlar ── */}
      <div className="a-panel">
        <div className="a-panel-h">
          <span>Instagram kreativlari bo’yicha konversiya</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
            kamida 3 sessiya bo’lganlar
          </span>
        </div>
        {d.cre.length ? (
          <div className="a-tw">
            <table className="a-t">
              <thead>
                <tr>
                  <th>utm_content (kreativ)</th>
                  <th>Kampaniya</th>
                  <th className="num">Sessiya</th>
                  <th className="num">Botga o’tdi</th>
                  <th className="num">CR</th>
                  <th style={{ width: 160 }} />
                </tr>
              </thead>
              <tbody>
                {d.cre.map((c, i) => (
                  <tr key={`${c.utmContent}-${c.utmCampaign}-${i}`}>
                    <td>
                      <span className="a-tag ig">{c.utmContent ?? 'utm yo’q'}</span>
                    </td>
                    <td className="muted">{c.utmCampaign ?? '—'}</td>
                    <td className="num">{c.sessions}</td>
                    <td className="num">{c.conv}</td>
                    <td className="num" style={{ fontWeight: 700, color: c.cr >= bestCr && bestCr > 0 ? '#34d399' : undefined }}>
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
            <code>https://milliyjamosimiz.uz/?utm_source=instagram&amp;utm_content=reel_01</code>
          </div>
        )}
      </div>

      <div className="a-grid-2">
        {/* ── Tugmalar ── */}
        <div className="a-panel">
          <div className="a-panel-h">Tugmalar reytingi</div>
          {d.btns.length ? (
            <div className="a-tw">
              <table className="a-t">
                <thead>
                  <tr>
                    <th>Tugma</th>
                    <th>Matn</th>
                    <th className="num">Bosish</th>
                    <th className="num">Foydalanuvchi</th>
                  </tr>
                </thead>
                <tbody>
                  {d.btns.map((b, i) => (
                    <tr key={`${b.elId}-${i}`}>
                      <td>
                        <span className="a-tag">{b.elId ?? '—'}</span>
                      </td>
                      <td className="muted">{b.elText ?? '—'}</td>
                      <td className="num">{b.clicks}</td>
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

        {/* ── Scroll voronka ── */}
        <div className="a-panel">
          <div className="a-panel-h">Scroll voronkasi</div>
          <div className="a-panel-b">
            {d.scroll.length ? (
              d.scroll.map((s) => (
                <div className="a-bar" key={s.scrollPct}>
                  <span className="muted">{s.scrollPct}%</span>
                  <span className="a-bar-t">
                    <span
                      className="a-bar-f"
                      style={{ width: `${Math.round((s.users / maxScroll) * 100)}%` }}
                    />
                  </span>
                  <span className="a-bar-n">{s.users}</span>
                </div>
              ))
            ) : (
              <div className="a-empty">Ma’lumot yo’q</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Taqsimotlar ── */}
      <div className="a-grid-2">
        <Breakdown title="Qurilma" rows={d.device} />
        <Breakdown title="Brauzer" rows={d.browser} note="instagram — in-app WebView" />
        <Breakdown title="OS" rows={d.os} />
        <Breakdown title="Trafik manbasi (utm_source)" rows={d.source} />
      </div>
    </>
  );
}

function Breakdown({
  title,
  rows,
  note,
}: {
  title: string;
  rows: { label: string; n: number }[];
  note?: string;
}) {
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;
  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>{title}</span>
        {note && <span style={{ fontSize: 12, fontWeight: 400, color: '#59637a' }}>{note}</span>}
      </div>
      <div className="a-panel-b">
        {rows.length ? (
          rows.map((r) => (
            <div className="a-bar" key={r.label} style={{ gridTemplateColumns: '104px 1fr 78px' }}>
              <span className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.label}
              </span>
              <span className="a-bar-t">
                <span className="a-bar-f" style={{ width: `${Math.round((r.n / total) * 100)}%` }} />
              </span>
              <span className="a-bar-n">
                {r.n} · {Math.round((r.n / total) * 100)}%
              </span>
            </div>
          ))
        ) : (
          <div className="a-empty">Ma’lumot yo’q</div>
        )}
      </div>
    </div>
  );
}
