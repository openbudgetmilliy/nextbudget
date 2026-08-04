import Link from 'next/link';
import DbDown from '@/components/admin/DbDown';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import { sessionList, sessionTimeline } from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sessiyalar' };

const EV_LABEL: Record<string, string> = {
  view: 'Sahifani ochdi',
  scroll: 'Scroll',
  cta: 'CTA bosdi',
  click: 'Klik',
  exit: 'Chiqdi',
};

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string; id?: string; conv?: string }>;
}) {
  const sp = await searchParams;
  const hours = parseHours(sp.h, 24);
  const onlyConv = sp.conv === '1';

  let rows;
  let detail: Awaited<ReturnType<typeof sessionTimeline>> | null = null;
  try {
    rows = await sessionList(hours, 80, onlyConv);
    if (sp.id) detail = await sessionTimeline(sp.id);
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Sessiyalar</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams({ h: String(hours) });
    if (onlyConv) p.set('conv', '1');
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    return `/admin/sessions?${p}`;
  };

  return (
    <>
      <h1 className="a-h1">Sessiyalar</h1>
      <p className="a-sub">Har bir foydalanuvchi nima qilganini qadam-baqadam ko’rish</p>

      <div className="a-row">
        <RangePicker base="/admin/sessions" hours={hours} />
        <span style={{ marginLeft: 'auto' }} />
        <Link className={onlyConv ? 'a-btn p sm' : 'a-btn sm'} href={onlyConv ? qs({ conv: undefined }) : `${qs({})}&conv=1`}>
          Faqat konversiyalar
        </Link>
      </div>

      {detail?.session && (
        <div className="a-panel">
          <div className="a-panel-h">
            <span>
              Sessiya <code style={{ color: '#7fd0f7' }}>{detail.session.id.slice(0, 8)}</code>
              {detail.session.converted ? (
                <span className="a-tag ok" style={{ marginLeft: 10 }}>
                  konversiya
                </span>
              ) : null}
            </span>
            <Link className="a-btn sm" href={qs({ id: undefined })}>
              Yopish ✕
            </Link>
          </div>
          <div className="a-panel-b">
            <div style={{ display: 'flex', gap: '6px 22px', flexWrap: 'wrap', fontSize: 13, color: '#93a1b8', marginBottom: 16 }}>
              <span>Manba: {detail.session.utmSource ?? '—'}</span>
              <span>Kreativ: {detail.session.utmContent ?? '—'}</span>
              <span>Qurilma: {detail.session.device ?? '—'}</span>
              <span>Brauzer: {detail.session.browser ?? '—'}</span>
              <span>OS: {detail.session.os ?? '—'}</span>
              <span>Referrer: {detail.session.referrer || '—'}</span>
            </div>

            <div className="a-tl">
              {detail.events.map((e, i) => (
                <div className="a-tl-i" key={i}>
                  <span className="a-tl-t">
                    {new Date(e.ts).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span>
                    <span className={e.type === 'cta' ? 'a-tag ok' : 'a-tag'}>
                      {EV_LABEL[e.type] ?? e.type}
                    </span>
                  </span>
                  <span style={{ color: '#93a1b8' }}>
                    {e.elId && <code style={{ color: '#7fd0f7' }}>{e.elId}</code>}
                    {e.elText ? ` · ${e.elText}` : ''}
                    {e.scrollPct != null ? `${e.scrollPct}% gacha` : ''}
                    {e.dwellMs != null ? ` · ${Math.round(e.dwellMs / 1000)} sekund turdi` : ''}
                  </span>
                </div>
              ))}
              {!detail.events.length && <div className="a-empty">Event yo’q</div>}
            </div>
          </div>
        </div>
      )}

      <div className="a-panel">
        <div className="a-panel-h">
          <span>Oxirgi sessiyalar ({rows.length})</span>
        </div>
        {rows.length ? (
          <div className="a-tw">
            <table className="a-t">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>ID</th>
                  <th>Manba</th>
                  <th>Kreativ</th>
                  <th>Qurilma</th>
                  <th>Brauzer</th>
                  <th className="num">Event</th>
                  <th className="num">Scroll</th>
                  <th className="num">Vaqt</th>
                  <th>Natija</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="muted">
                      {new Date(s.createdAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <Link href={qs({ id: s.id })} style={{ color: '#7fd0f7' }}>
                        <code>{s.id.slice(0, 8)}</code>
                      </Link>
                    </td>
                    <td className="muted">{s.utmSource ?? '—'}</td>
                    <td>{s.utmContent ? <span className="a-tag ig">{s.utmContent}</span> : <span className="muted">—</span>}</td>
                    <td className="muted">{s.device ?? '—'}</td>
                    <td className="muted">{s.browser ?? '—'}</td>
                    <td className="num">{s.events}</td>
                    <td className="num">{s.maxScroll ? `${s.maxScroll}%` : '—'}</td>
                    <td className="num">{s.dwellSec ? `${s.dwellSec}s` : '—'}</td>
                    <td>
                      <span className={s.converted ? 'a-tag ok' : 'a-tag no'}>
                        {s.converted ? 'botga o’tdi' : 'ketdi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="a-empty">Bu davrda sessiya yo’q</div>
        )}
      </div>
    </>
  );
}
