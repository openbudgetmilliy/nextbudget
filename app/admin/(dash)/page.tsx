import AutoRefresh from '@/components/admin/AutoRefresh';
import DbDown from '@/components/admin/DbDown';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import TrafficChart from '@/components/admin/TrafficChart';
import { hourly, onlineNow, overview, recentCta, scrollFunnel } from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const hours = parseHours((await searchParams).h, 24);

  let data;
  try {
    const [ov, online, hrs, cta, scroll] = await Promise.all([
      overview(hours),
      onlineNow(),
      hourly(hours),
      recentCta(12),
      scrollFunnel(hours),
    ]);
    data = { ov, online, hrs, cta, scroll };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Dashboard</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const { ov, online, hrs, cta, scroll } = data;
  const maxScroll = Math.max(...scroll.map((s) => s.users), 1);

  return (
    <>
      <h1 className="a-h1">Dashboard</h1>
      <p className="a-sub">Instagram trafigi va konversiya — real vaqtda</p>

      <div className="a-row">
        <RangePicker base="/admin" hours={hours} />
        <span style={{ marginLeft: 'auto' }} />
        <AutoRefresh seconds={30} />
      </div>

      <div className="a-cards">
        <div className="a-card">
          <div className="a-card-k">Onlayn</div>
          <div className="a-card-v up">
            <span className="a-dot" />
            {online}
          </div>
          <div className="a-card-n">oxirgi 5 daqiqa</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Sessiyalar</div>
          <div className="a-card-v">{ov.sessions.toLocaleString('ru-RU')}</div>
          <div className="a-card-n">{hours} soat ichida</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Botga o’tish</div>
          <div className="a-card-v tg">{ov.conversions.toLocaleString('ru-RU')}</div>
          <div className="a-card-n">CTA bosilgan</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Konversiya</div>
          <div className="a-card-v gold">{ov.crPct}%</div>
          <div className="a-card-n">sessiya → bot</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">O’rtacha vaqt</div>
          <div className="a-card-v">{ov.avgDwellSec}s</div>
          <div className="a-card-n">sahifada</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Eventlar</div>
          <div className="a-card-v">{ov.events.toLocaleString('ru-RU')}</div>
          <div className="a-card-n">yozilgan</div>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-h">Soatlar bo’yicha trafik</div>
        <div className="a-panel-b">
          <TrafficChart data={hrs} />
        </div>
      </div>

      <div className="a-grid-2">
        <div className="a-panel">
          <div className="a-panel-h">Oxirgi CTA bosishlar</div>
          {cta.length ? (
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
                  {cta.map((c, i) => (
                    <tr key={`${c.sessionId}-${i}`}>
                      <td className="muted">
                        {new Date(c.ts).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <span className="a-tag">{c.elId ?? '—'}</span>
                      </td>
                      <td className="muted">{c.utmContent ?? '—'}</td>
                      <td className="muted">{c.device ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="a-empty">Hozircha CTA bosilmagan</div>
          )}
        </div>

        <div className="a-panel">
          <div className="a-panel-h">Scroll voronkasi</div>
          <div className="a-panel-b">
            {scroll.length ? (
              scroll.map((s) => (
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
            <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 14, lineHeight: 1.6 }}>
              Har bosqichda qancha foydalanuvchi qolgani. 25% dan 50% ga keskin tushish — hero
              bo’limidan keyin qiziqish yo’qolganini ko’rsatadi.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
