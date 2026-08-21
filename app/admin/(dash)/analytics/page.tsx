import ButtonStats from '@/components/admin/ButtonStats';
import CreativeStats from '@/components/admin/CreativeStats';
import DbDown from '@/components/admin/DbDown';
import PageStats from '@/components/admin/PageStats';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import { breakdown, creatives, mergePageRows, pageButtons, pageStats, scrollFunnel } from '@/lib/stats';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analitika' };

/**
 * Jadvallar (kadrlar, kreativlar, tugmalar) alohida komponentlarda —
 * ularning ustun sarlavhalari saralash tugmasi va shuning uchun mijoz
 * tomonida ishlaydi. Bu sahifa faqat ma'lumot yig'adi va joylashtiradi.
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const hours = parseHours((await searchParams).h, 168);

  let d;
  try {
    const [cre, btns, pages, scroll, device, browser, os, source] = await Promise.all([
      creatives(hours),
      pageButtons(hours),
      pageStats(hours),
      scrollFunnel(hours),
      breakdown('device', hours),
      breakdown('browser', hours),
      breakdown('os', hours),
      breakdown('utmSource', hours),
    ]);
    d = { cre, btns, pages, scroll, device, browser, os, source };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Analitika</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const maxScroll = Math.max(...d.scroll.map((s) => s.users), 1);

  return (
    <>
      <h1 className="a-h1">Analitika</h1>
      <p className="a-sub">
        Qaysi sahifa va qaysi kreativ pul olib kelayotganini shu yerda ko’rasiz · ustun nomini
        bosib saralang
      </p>

      <div className="a-row">
        <RangePicker base="/admin/analytics" hours={hours} />
      </div>

      {/* Har sahifa alohida reklama qilinadi — havolasi ham, raqami ham shu yerda */}
      <PageStats rows={mergePageRows(d.pages)} siteUrl={env.SITE_URL} showLinks />

      {/* ── Kreativlar ── */}
      <CreativeStats rows={d.cre} />

      <div className="a-grid-2">
        {/* ── Tugmalar ── */}
        <ButtonStats rows={d.btns} />

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
