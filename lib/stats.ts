import 'server-only';
import { prisma } from './prisma';

/**
 * Analitika so'rovlari — xom SQL.
 *
 * Nega xom SQL: `count(*) FILTER (WHERE ...)`, `NULLIF`, `date_trunc` kabi
 * narsalarni Prisma API bilan yozib bo'lmaydi, agregatsiya esa Postgres
 * tomonida bir marta bajarilishi kerak.
 *
 * `::int` cast'lar MUHIM — Postgres `count()` bigint qaytaradi, u JSON'ga
 * serializatsiya bo'lmaydi.
 *
 * Bu so'rovlar faqat admin panelda ishlaydi (kuniga bir necha o'n so'rov),
 * shuning uchun cho'qqi trafikka ta'siri yo'q.
 */

export type Overview = {
  sessions: number;
  conversions: number;
  crPct: number;
  events: number;
  avgDwellSec: number;
};

export async function overview(hours = 24): Promise<Overview> {
  const [row] = await prisma.$queryRaw<
    { sessions: number; conversions: number; cr_pct: number }[]
  >`
    SELECT
      count(*)::int                                        AS sessions,
      count(*) FILTER (WHERE converted)::int               AS conversions,
      COALESCE(round(100.0 * count(*) FILTER (WHERE converted)
            / NULLIF(count(*), 0), 2), 0)::float8          AS cr_pct
    FROM "Session"
    WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
  `;

  const [ev] = await prisma.$queryRaw<{ events: number; dwell: number }[]>`
    SELECT
      count(*)::int                                                       AS events,
      COALESCE(round(avg("dwellMs") FILTER (WHERE type = 'exit') / 1000.0), 0)::float8 AS dwell
    FROM "Event"
    WHERE ts >= now() - (${hours}::int * interval '1 hour')
  `;

  return {
    sessions: row?.sessions ?? 0,
    conversions: row?.conversions ?? 0,
    crPct: row?.cr_pct ?? 0,
    events: ev?.events ?? 0,
    avgDwellSec: ev?.dwell ?? 0,
  };
}

/** Hozir onlayn: oxirgi 5 daqiqada eventi bo'lgan sessiyalar */
export async function onlineNow(): Promise<number> {
  const [row] = await prisma.$queryRaw<{ n: number }[]>`
    SELECT count(DISTINCT "sessionId")::int AS n
    FROM "Event" WHERE ts >= now() - interval '5 minutes'
  `;
  return row?.n ?? 0;
}

/** Qaysi tugma ko'p bosilgan */
export type ButtonRow = { elId: string | null; elText: string | null; clicks: number; users: number };

export async function topButtons(hours = 168, limit = 20): Promise<ButtonRow[]> {
  return prisma.$queryRaw<ButtonRow[]>`
    SELECT "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= now() - (${hours}::int * interval '1 hour')
    GROUP BY "elId", "elText"
    ORDER BY clicks DESC
    LIMIT ${limit}::int
  `;
}

/** Instagram kreativlari bo'yicha konversiya */
export type CreativeRow = {
  utmContent: string | null;
  utmCampaign: string | null;
  sessions: number;
  conv: number;
  cr: number;
};

export async function creatives(hours = 168, source = 'instagram'): Promise<CreativeRow[]> {
  return prisma.$queryRaw<CreativeRow[]>`
    SELECT "utmContent", "utmCampaign",
           count(*)::int                                    AS sessions,
           count(*) FILTER (WHERE converted)::int           AS conv,
           COALESCE(round(100.0 * count(*) FILTER (WHERE converted)
                 / NULLIF(count(*), 0), 2), 0)::float8      AS cr
    FROM "Session"
    WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
      AND ("utmSource" = ${source} OR browser = 'instagram')
    GROUP BY "utmContent", "utmCampaign"
    HAVING count(*) >= 3
    ORDER BY sessions DESC
    LIMIT 40
  `;
}

/** Scroll voronkasi — qayerda tashlab ketishadi */
export type ScrollRow = { scrollPct: number; users: number };

export async function scrollFunnel(hours = 24): Promise<ScrollRow[]> {
  return prisma.$queryRaw<ScrollRow[]>`
    SELECT "scrollPct", count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'scroll' AND ts >= now() - (${hours}::int * interval '1 hour')
    GROUP BY "scrollPct"
    ORDER BY "scrollPct"
  `;
}

/** Qurilma / brauzer / manba taqsimoti */
export type BreakdownRow = { label: string; n: number };

export async function breakdown(
  field: 'device' | 'browser' | 'os' | 'utmSource',
  hours = 24,
): Promise<BreakdownRow[]> {
  const col =
    field === 'utmSource' ? '"utmSource"' : field === 'device' ? 'device' : field === 'os' ? 'os' : 'browser';

  // Ustun nomi qat'iy ro'yxatdan olinadi — SQL injection imkoni yo'q
  return prisma.$queryRawUnsafe<BreakdownRow[]>(
    `SELECT COALESCE(${col}, '—') AS label, count(*)::int AS n
     FROM "Session"
     WHERE "createdAt" >= now() - ($1::int * interval '1 hour')
     GROUP BY 1 ORDER BY n DESC LIMIT 12`,
    hours,
  );
}

/** Soatlar bo'yicha trafik — grafik uchun */
export type HourRow = { h: string; sessions: number; conv: number };

export async function hourly(hours = 24): Promise<HourRow[]> {
  return prisma.$queryRaw<HourRow[]>`
    SELECT to_char(date_trunc('hour', "createdAt"), 'DD.MM HH24:00') AS h,
           count(*)::int                                             AS sessions,
           count(*) FILTER (WHERE converted)::int                    AS conv
    FROM "Session"
    WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
    GROUP BY date_trunc('hour', "createdAt")
    ORDER BY date_trunc('hour', "createdAt")
  `;
}

/** Oxirgi CTA bosishlar — real-time lenta */
export type RecentCta = {
  ts: Date;
  elId: string | null;
  elText: string | null;
  sessionId: string;
  utmContent: string | null;
  device: string | null;
};

export async function recentCta(limit = 12): Promise<RecentCta[]> {
  return prisma.$queryRaw<RecentCta[]>`
    SELECT e.ts, e."elId", e."elText", e."sessionId", s."utmContent", s.device
    FROM "Event" e
    JOIN "Session" s ON s.id = e."sessionId"
    WHERE e.type = 'cta'
    ORDER BY e.ts DESC
    LIMIT ${limit}::int
  `;
}

/** Sessiyalar ro'yxati */
export type SessionRow = {
  id: string;
  createdAt: Date;
  utmSource: string | null;
  utmContent: string | null;
  device: string | null;
  browser: string | null;
  converted: boolean;
  events: number;
  dwellSec: number;
  maxScroll: number;
};

export async function sessionList(hours = 24, limit = 60, onlyConverted = false): Promise<SessionRow[]> {
  return prisma.$queryRaw<SessionRow[]>`
    SELECT s.id, s."createdAt", s."utmSource", s."utmContent", s.device, s.browser, s.converted,
           count(e.id)::int                                                  AS events,
           COALESCE(round(max(e."dwellMs") / 1000.0), 0)::int                AS "dwellSec",
           COALESCE(max(e."scrollPct"), 0)::int                              AS "maxScroll"
    FROM "Session" s
    LEFT JOIN "Event" e ON e."sessionId" = s.id
    WHERE s."createdAt" >= now() - (${hours}::int * interval '1 hour')
      AND (${onlyConverted}::boolean = false OR s.converted)
    GROUP BY s.id
    ORDER BY s."createdAt" DESC
    LIMIT ${limit}::int
  `;
}

/** Bitta sessiyaning timeline'i */
export async function sessionTimeline(id: string) {
  const [session, events] = await Promise.all([
    prisma.session.findUnique({ where: { id } }),
    prisma.event.findMany({
      where: { sessionId: id },
      orderBy: { ts: 'asc' },
      take: 300,
      select: { type: true, elId: true, elText: true, scrollPct: true, dwellMs: true, ts: true },
    }),
  ]);
  return { session, events };
}
