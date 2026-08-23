import AutoRefresh from '@/components/admin/AutoRefresh';
import ButtonStats from '@/components/admin/ButtonStats';
import CreativeStats from '@/components/admin/CreativeStats';
import DbDown from '@/components/admin/DbDown';
import PageStats from '@/components/admin/PageStats';
import RangePicker from '@/components/admin/RangePicker';
import RecentCta from '@/components/admin/RecentCta';
import ScrollFunnel from '@/components/admin/ScrollFunnel';
import StatCards from '@/components/admin/StatCards';
import TrafficChart from '@/components/admin/TrafficChart';

import { env } from '@/lib/env';
import { parseRange, type RangeParams } from '@/lib/range';
import {
  breakdown,
  creatives,
  hourly,
  mergePageRows,
  onlineNow,
  overview,
  pageButtons,
  pageStats,
  recentCta,
  scrollFunnel,
} from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analitika' };

/**
 * ANALITIKA — to'liq kesim.
 *
 * Dashboard bilan bir xil bloklarni (ko'rsatkichlar, soatlik grafik, oxirgi
 * bosishlar, scroll voronkasi) ko'rsatadi va USTIGA o'zinikilarni qo'shadi:
 * reklama havolalari bilan sahifalar jadvali, kreativlar, tugmalar reytingi,
 * qurilma/brauzer/OS/manba taqsimotlari.
 *
 * Bloklar takrorlanmasin deb umumiy komponentlarga chiqarilgan
 * (`StatCards`, `RecentCta`, `ScrollFunnel`) — ilgari ular ikki sahifada
 * ikki nusxada yotardi va biri o'zgarganda ikkinchisi eskirib qolardi.
 *
 * Dashboarddan farqi: bu yerda standart davr 7 kun (u yerda 24 soat) —
 * kreativ va kadr solishtiruvi uchun bir kun kam.
 *
 * Sahifa faqat ma'lumot yig'adi va joylashtiradi; jadvallarning saralashi
 * mijoz tomonida (`useSort`).
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<RangeParams>;
}) {
  const r = parseRange(await searchParams, 168);

  let d;
  try {
    const [ov, online, hrs, cre, btns, pages, cta, scroll, device, browser, os, source] =
      await Promise.all([
        overview(r),
        onlineNow(),
        hourly(r),
        creatives(r),
        pageButtons(r),
        pageStats(r),
        recentCta(r, 12),
        scrollFunnel(r),
        breakdown('device', r),
        breakdown('browser', r),
        breakdown('os', r),
        breakdown('utmSource', r),
      ]);
    d = { ov, online, hrs, cre, btns, pages, cta, scroll, device, browser, os, source };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Analitika</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  return (
    <>
      <h1 className="a-h1">Analitika</h1>
      <p className="a-sub">
        Qaysi sahifa va qaysi kreativ pul olib kelayotganini shu yerda ko’rasiz · ustun nomini
        bosib saralang
      </p>

      <div className="a-row">
        <RangePicker base="/admin/analytics" range={r} />
        <span style={{ marginLeft: 'auto' }} />
        <AutoRefresh seconds={30} />
      </div>

      <StatCards ov={d.ov} online={d.online} range={r} />

      {/* Har sahifa alohida reklama qilinadi — havolasi ham, raqami ham shu yerda */}
      <PageStats rows={mergePageRows(d.pages)} siteUrl={env.SITE_URL} showLinks />

      <div className="a-panel">
        <div className="a-panel-h">
          <span>Soatlar bo’yicha trafik</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>Toshkent vaqti</span>
        </div>
        <div className="a-panel-b">
          <TrafficChart data={d.hrs} />
        </div>
      </div>

      <CreativeStats rows={d.cre} />

      <div className="a-grid-2">
        <ButtonStats rows={d.btns} />
        <ScrollFunnel rows={d.scroll} />
      </div>

      <div className="a-grid-2">
        <RecentCta rows={d.cta} />
        <Breakdown title="Trafik manbasi (utm_source)" rows={d.source} />
      </div>

      <div className="a-grid-2">
        <Breakdown title="Qurilma" rows={d.device} />
        <Breakdown title="Brauzer" rows={d.browser} note="instagram — in-app WebView" />
        <Breakdown title="OS" rows={d.os} />
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
            <div className="a-bar" key={r.label} style={{ gridTemplateColumns: '104px 1fr 96px' }}>
              <span className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.label}
              </span>
              <span className="a-bar-t">
                <span className="a-bar-f" style={{ width: `${Math.round((r.n / total) * 100)}%` }} />
              </span>
              <span className="a-bar-n">
                {r.n.toLocaleString('ru-RU')} · {Math.round((r.n / total) * 100)}%
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
