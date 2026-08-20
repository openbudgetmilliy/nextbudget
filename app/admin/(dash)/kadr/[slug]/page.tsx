import Link from 'next/link';
import { notFound } from 'next/navigation';

import AutoRefresh from '@/components/admin/AutoRefresh';
import DbDown from '@/components/admin/DbDown';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import TrafficChart from '@/components/admin/TrafficChart';
import { LANDING_PAGES } from '@/lib/pages';
import { pageButtonsOf, pageHourly, pageOverview, pageRecentCta } from '@/lib/stats';

export const dynamic = 'force-dynamic';

/**
 * Bitta kadr analitikasi — Dashboard'dagi qatordan ochiladi.
 *
 * Savollar oddiy va ikkitagina: shu kadrga qancha odam keldi va tugmasi
 * necha marta (nechta odam tomonidan) bosildi. Qolgani — o'sha ikkisining
 * kesimlari: soatlar grafigi, tugmalar taqsimoti, oxirgi bosishlar.
 */
export default async function KadrPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ h?: string }>;
}) {
  const { slug } = await params;
  const page = LANDING_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const hours = parseHours((await searchParams).h, 168);

  let data;
  try {
    const [ov, hrs, buttons, recent] = await Promise.all([
      pageOverview(page.path, hours),
      pageHourly(page.path, hours),
      pageButtonsOf(page.path, hours),
      pageRecentCta(page.path, 12),
    ]);
    data = { ov, hrs, buttons, recent };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">{page.name}</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const { ov, hrs, buttons, recent } = data;

  return (
    <>
      <p style={{ marginBottom: 10 }}>
        <Link href="/admin" className="a-tag">
          ← Dashboard
        </Link>
      </p>

      <h1 className="a-h1">
        {page.name}{' '}
        <a
          href={page.path}
          target="_blank"
          rel="noopener"
          className="a-tag"
          style={{ verticalAlign: 'middle' }}
        >
          {page.path} ↗
        </a>
      </h1>
      <p className="a-sub">
        {page.note} · reklama belgisi <code>{page.slug}</code>
      </p>

      <div className="a-row">
        <RangePicker base={`/admin/kadr/${page.slug}`} hours={hours} />
        <span style={{ marginLeft: 'auto' }} />
        <AutoRefresh seconds={30} />
      </div>

      <div className="a-cards">
        <div className="a-card">
          <div className="a-card-k">Kirdi</div>
          <div className="a-card-v">{ov.sessions.toLocaleString('ru-RU')}</div>
          <div className="a-card-n">sessiya · {hours} soat</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Tugma bosildi</div>
          <div className="a-card-v tg">{ov.clicks.toLocaleString('ru-RU')}</div>
          <div className="a-card-n">jami bosishlar</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Bosgan odam</div>
          <div className="a-card-v tg">{ov.clickUsers.toLocaleString('ru-RU')}</div>
          <div className="a-card-n">takrorsiz sessiya</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Konversiya</div>
          <div className="a-card-v gold">{ov.crPct}%</div>
          <div className="a-card-n">kirdi → bosdi</div>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-h">Soatlar bo’yicha — shu kadr</div>
        <div className="a-panel-b">
          <TrafficChart data={hrs} />
        </div>
      </div>

      <div className="a-grid-2">
        <div className="a-panel">
          <div className="a-panel-h">Kadr ichidagi tugmalar</div>
          {buttons.length ? (
            <div className="a-tw">
              <table className="a-t">
                <thead>
                  <tr>
                    <th>Tugma</th>
                    <th>Matn</th>
                    <th className="num">Bosishlar</th>
                    <th className="num">Odam</th>
                  </tr>
                </thead>
                <tbody>
                  {buttons.map((b, i) => (
                    <tr key={`${b.elId}-${i}`}>
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
            <div className="a-empty">Bu oraliqda tugma bosilmagan</div>
          )}
        </div>

        <div className="a-panel">
          <div className="a-panel-h">Oxirgi bosishlar</div>
          {recent.length ? (
            <div className="a-tw">
              <table className="a-t">
                <thead>
                  <tr>
                    <th>Vaqt</th>
                    <th>Tugma</th>
                    <th>Kreativ</th>
                    <th>Qurilma</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c, i) => (
                    <tr key={`${c.sessionId}-${i}`}>
                      <td className="muted">
                        {new Date(c.ts).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="muted">{c.elId ?? '—'}</td>
                      <td className="muted">{c.utmContent ?? '—'}</td>
                      <td className="muted">{c.device ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="a-empty">Hozircha bosish yo’q</div>
          )}
        </div>
      </div>
    </>
  );
}
