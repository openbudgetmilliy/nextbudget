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
  /** Qaysi kadrdagi tugma bosilgan — lentaning eng foydali ustuni */
  page: string | null;
  utmContent: string | null;
  device: string | null;
};

export async function recentCta(limit = 12): Promise<RecentCta[]> {
  return prisma.$queryRaw<RecentCta[]>`
    SELECT e.ts, e."elId", e."elText", e."sessionId", e.page, s."utmContent", s.device
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

/**
 * Sahifalar (reklama kadrlari) bo'yicha kesim — analitikaning ASOSIY jadvali.
 *
 * Yettita kadr yettita alohida reklama joyidan yuritiladi, shuning uchun
 * birinchi savol doim bitta: qaysi kadrdan qancha odam keldi va qaysisining
 * tugmasi necha marta bosildi. Ikkalasi ikki xil jadvalda yotadi:
 *
 *   · kim kelgani  — `Session.landedAt` (odam tushgan birinchi sahifa)
 *   · tugma bosishi — `Event.page` (type = 'cta')
 *
 * Shuning uchun FULL JOIN: kadr ochilgan-u, tugmasi bosilmagan bo'lishi
 * mumkin (yoki teskarisi — eski sessiya, yangi klik). INNER JOIN bo'lsa
 * aynan eng yomon kadr jadvaldan tushib qolardi.
 *
 * `rtrim(path, '/')` — `/7` va `/7/` bitta qator bo'lsin; ildiz uchun
 * natija bo'sh satr bo'ladi, uni `NULLIF` orqali `/` ga qaytaramiz.
 */
export type PageRow = {
  page: string;
  sessions: number;
  conv: number;
  clicks: number;
  clickUsers: number;
  cr: number;
};

export async function pageStats(hours = 168): Promise<PageRow[]> {
  return prisma.$queryRaw<PageRow[]>`
    WITH s AS (
      SELECT CASE WHEN "landedAt" IS NULL THEN '—'
                  ELSE COALESCE(NULLIF(rtrim("landedAt", '/'), ''), '/') END AS page,
             count(*)::int                          AS sessions,
             count(*) FILTER (WHERE converted)::int AS conv
      FROM "Session"
      WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
      GROUP BY 1
    ),
    c AS (
      SELECT CASE WHEN page IS NULL THEN '—'
                  ELSE COALESCE(NULLIF(rtrim(page, '/'), ''), '/') END AS page,
             count(*)::int                    AS clicks,
             count(DISTINCT "sessionId")::int AS users
      FROM "Event"
      WHERE type = 'cta' AND ts >= now() - (${hours}::int * interval '1 hour')
      GROUP BY 1
    )
    SELECT COALESCE(s.page, c.page)                          AS page,
           COALESCE(s.sessions, 0)                           AS sessions,
           COALESCE(s.conv, 0)                               AS conv,
           COALESCE(c.clicks, 0)                             AS clicks,
           COALESCE(c.users, 0)                              AS "clickUsers",
           COALESCE(round(100.0 * s.conv / NULLIF(s.sessions, 0), 2), 0)::float8 AS cr
    FROM s FULL JOIN c ON c.page = s.page
    ORDER BY sessions DESC, clicks DESC
  `;
}

/**
 * Sahifa × tugma — bitta kadrda bir nechta tugma bo'lganda kerak.
 *
 * `/5` da ikkita CTA bor («Botda ovoz olish» va «Pulni olish»), `/6`–`/7` da
 * bittadan. `elId` ular orasida takrorlanadi (`bot`, `cta`), shuning uchun
 * faqat `elId` bo'yicha guruhlash kadrlarni bir-biriga qo'shib yuborardi —
 * bu yerda sahifa ham guruhga kiradi.
 */
export type PageButtonRow = {
  page: string;
  elId: string | null;
  elText: string | null;
  clicks: number;
  users: number;
};

export async function pageButtons(hours = 168, limit = 40): Promise<PageButtonRow[]> {
  return prisma.$queryRaw<PageButtonRow[]>`
    SELECT CASE WHEN page IS NULL THEN '—'
                ELSE COALESCE(NULLIF(rtrim(page, '/'), ''), '/') END AS page,
           "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= now() - (${hours}::int * interval '1 hour')
    GROUP BY 1, "elId", "elText"
    ORDER BY clicks DESC
    LIMIT ${limit}::int
  `;
}

/**
 * BITTA kadr kesimi — /admin/kadr/[slug] sahifasi uchun.
 *
 * `landedAt` ham, `Event.page` ham xom yo'l sifatida yoziladi, shuning
 * uchun taqqoslash `rtrim(..., '/')` normalizatsiyasi bilan: `/7` va `/7/`
 * bitta kadr. Ildiz uchun rtrim bo'sh satr beradi — ${'$'}{path} ham xuddi
 * shu ko'rinishga keltirilib solishtiriladi.
 */
const norm = (path: string) => (path === '/' ? '' : path.replace(/\/+$/, ''));

export type PageOverview = {
  sessions: number;
  conv: number;
  clicks: number;
  clickUsers: number;
  crPct: number;
};

export async function pageOverview(path: string, hours = 168): Promise<PageOverview> {
  const target = norm(path);

  const [se] = await prisma.$queryRaw<{ sessions: number; conv: number }[]>`
    SELECT count(*)::int                          AS sessions,
           count(*) FILTER (WHERE converted)::int AS conv
    FROM "Session"
    WHERE "createdAt" >= now() - (${'$'}{hours}::int * interval '1 hour')
      AND rtrim(COALESCE("landedAt", ''), '/') = ${'$'}{target}
  `;

  const [cl] = await prisma.$queryRaw<{ clicks: number; users: number }[]>`
    SELECT count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= now() - (${'$'}{hours}::int * interval '1 hour')
      AND rtrim(COALESCE(page, ''), '/') = ${'$'}{target}
  `;

  const sessions = se?.sessions ?? 0;
  const conv = se?.conv ?? 0;
  return {
    sessions,
    conv,
    clicks: cl?.clicks ?? 0,
    clickUsers: cl?.users ?? 0,
    crPct: sessions ? Math.round((10000 * conv) / sessions) / 100 : 0,
  };
}

/** Kadr bo'yicha soatlik trafik — TrafficChart bilan bir shaklda */
export async function pageHourly(path: string, hours = 168): Promise<HourRow[]> {
  const target = norm(path);
  return prisma.$queryRaw<HourRow[]>`
    SELECT to_char(date_trunc('hour', "createdAt"), 'DD.MM HH24:00') AS h,
           count(*)::int                                             AS sessions,
           count(*) FILTER (WHERE converted)::int                    AS conv
    FROM "Session"
    WHERE "createdAt" >= now() - (${'$'}{hours}::int * interval '1 hour')
      AND rtrim(COALESCE("landedAt", ''), '/') = ${'$'}{target}
    GROUP BY date_trunc('hour', "createdAt")
    ORDER BY date_trunc('hour', "createdAt")
  `;
}

/** Kadr ichidagi tugmalar kesimi */
export async function pageButtonsOf(path: string, hours = 168): Promise<ButtonRow[]> {
  const target = norm(path);
  return prisma.$queryRaw<ButtonRow[]>`
    SELECT "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= now() - (${'$'}{hours}::int * interval '1 hour')
      AND rtrim(COALESCE(page, ''), '/') = ${'$'}{target}
    GROUP BY "elId", "elText"
    ORDER BY clicks DESC
  `;
}

/** Kadrning oxirgi CTA bosishlari */
export async function pageRecentCta(path: string, limit = 12): Promise<RecentCta[]> {
  const target = norm(path);
  return prisma.$queryRaw<RecentCta[]>`
    SELECT e.ts, e."elId", e."elText", e."sessionId", e.page, s."utmContent", s.device
    FROM "Event" e
    JOIN "Session" s ON s.id = e."sessionId"
    WHERE e.type = 'cta' AND rtrim(COALESCE(e.page, ''), '/') = ${'$'}{target}
    ORDER BY e.ts DESC
    LIMIT ${'$'}{limit}::int
  `;
}
