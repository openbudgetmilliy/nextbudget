import AutoRefresh from '@/components/admin/AutoRefresh';
import DbDown from '@/components/admin/DbDown';
import PageStats from '@/components/admin/PageStats';
import RangePicker from '@/components/admin/RangePicker';
import RecentCta from '@/components/admin/RecentCta';
import ScrollFunnel from '@/components/admin/ScrollFunnel';
import StatCards from '@/components/admin/StatCards';
import TrafficChart from '@/components/admin/TrafficChart';
import { hourly, mergePageRows, onlineNow, overview, pageStats, recentCta, scrollFunnel } from '@/lib/stats';
import { parseRange, type RangeParams } from '@/lib/range';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<RangeParams>;
}) {
  const r = parseRange(await searchParams, 24);

  let data;
  try {
    const [ov, online, hrs, cta, scroll, pages] = await Promise.all([
      overview(r),
      onlineNow(),
      hourly(r),
      recentCta(r, 12),
      scrollFunnel(r),
      pageStats(r),
    ]);
    data = { ov, online, hrs, cta, scroll, pages };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Dashboard</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const { ov, online, hrs, cta, scroll, pages } = data;

  return (
    <>
      <h1 className="a-h1">Dashboard</h1>
      <p className="a-sub">Instagram trafigi va konversiya — real vaqtda</p>

      <div className="a-row">
        <RangePicker base="/admin" range={r} />
        <span style={{ marginLeft: 'auto' }} />
        <AutoRefresh seconds={30} />
      </div>

      <StatCards ov={ov} online={online} range={r} />

      {/* Asosiy kesim: har kadr alohida reklama qilinadi, shuning uchun
          «qaysi kadrdan qancha odam keldi va tugmasi nechta bosildi» —
          birinchi ko'rinadigan jadval. Reklama havolalari bu yerda YO'Q —
          ular Analitika va Reklama tablarida */}
      <PageStats rows={mergePageRows(pages)} />

      <div className="a-panel">
        <div className="a-panel-h">
          <span>Soatlar bo’yicha trafik</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>Toshkent vaqti</span>
        </div>
        <div className="a-panel-b">
          <TrafficChart data={hrs} />
        </div>
      </div>

      <div className="a-grid-2">
        <RecentCta rows={cta} />
        <ScrollFunnel rows={scroll} />
      </div>
    </>
  );
}
