import 'server-only';
import { prisma } from './prisma';
import { LANDING_PAGES, pageOf } from './pages';
import type { Range } from './range';

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
 *
 * ─── VAQT ──────────────────────────────────────────────────────────────
 *
 * Hamma funksiya `Range` oladi (`lib/range.ts`) — «necha soat orqaga»
 * emas, ANIQ ORALIQ. Shu sabab «kecha 09:00–18:00» kabi savollarga javob
 * bera oladi.
 *
 * Filtr HAR DOIM `>= sqlFrom::timestamp AND < sqlTo::timestamp` shaklida:
 * ustunlar `timestamp WITHOUT time zone` va ichida UTC devor-soati yotibdi,
 * shuning uchun solishtiruv sof timestamp bilan ketadi va server
 * TimeZone'iga BOG'LIQ EMAS. Sabablari `lib/range.ts` da batafsil.
 *
 * Soatlik guruhlashda esa teskarisi kerak — UTC devor-soatini Toshkentga
 * o'tkazamiz: `+ interval '5 hours'`. Busiz grafikdagi «09:00» aslida
 * Toshkent vaqti bilan 14:00 bo'lardi.
 */

export type Overview = {
  sessions: number;
  conversions: number;
  crPct: number;
  events: number;
  avgDwellSec: number;
};

export async function overview(r: Range): Promise<Overview> {
  const [row] = await prisma.$queryRaw<
    { sessions: number; conversions: number; cr_pct: number }[]
  >`
    SELECT
      count(*)::int                                        AS sessions,
      count(*) FILTER (WHERE converted)::int               AS conversions,
      COALESCE(round(100.0 * count(*) FILTER (WHERE converted)
            / NULLIF(count(*), 0), 2), 0)::float8          AS cr_pct
    FROM "Session"
    WHERE "createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
  `;

  const [ev] = await prisma.$queryRaw<{ events: number; dwell: number }[]>`
    SELECT
      count(*)::int                                                       AS events,
      COALESCE(round(avg("dwellMs") FILTER (WHERE type = 'exit') / 1000.0), 0)::float8 AS dwell
    FROM "Event"
    WHERE ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
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

export async function topButtons(r: Range, limit = 20): Promise<ButtonRow[]> {
  return prisma.$queryRaw<ButtonRow[]>`
    SELECT "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
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

export async function creatives(r: Range, source = 'instagram'): Promise<CreativeRow[]> {
  return prisma.$queryRaw<CreativeRow[]>`
    SELECT "utmContent", "utmCampaign",
           count(*)::int                                    AS sessions,
           count(*) FILTER (WHERE converted)::int           AS conv,
           COALESCE(round(100.0 * count(*) FILTER (WHERE converted)
                 / NULLIF(count(*), 0), 2), 0)::float8      AS cr
    FROM "Session"
    WHERE "createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
      AND ("utmSource" = ${source} OR browser = 'instagram')
    GROUP BY "utmContent", "utmCampaign"
    HAVING count(*) >= 3
    ORDER BY sessions DESC
    LIMIT 40
  `;
}

/** Scroll voronkasi — qayerda tashlab ketishadi */
export type ScrollRow = { scrollPct: number; users: number };

export async function scrollFunnel(r: Range): Promise<ScrollRow[]> {
  return prisma.$queryRaw<ScrollRow[]>`
    SELECT "scrollPct", count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'scroll' AND ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
    GROUP BY "scrollPct"
    ORDER BY "scrollPct"
  `;
}

/** Qurilma / brauzer / manba taqsimoti */
export type BreakdownRow = { label: string; n: number };

export async function breakdown(
  field: 'device' | 'browser' | 'os' | 'utmSource',
  r: Range,
): Promise<BreakdownRow[]> {
  const col =
    field === 'utmSource' ? '"utmSource"' : field === 'device' ? 'device' : field === 'os' ? 'os' : 'browser';

  // Ustun nomi qat'iy ro'yxatdan olinadi — SQL injection imkoni yo'q.
  // Oraliq esa pozitsion parametr: satr so'rovga yopishtirilmaydi.
  return prisma.$queryRawUnsafe<BreakdownRow[]>(
    `SELECT COALESCE(${col}, '—') AS label, count(*)::int AS n
     FROM "Session"
     WHERE "createdAt" >= $1::timestamp AND "createdAt" < $2::timestamp
     GROUP BY 1 ORDER BY n DESC LIMIT 12`,
    r.sqlFrom,
    r.sqlTo,
  );
}

/** Soatlar bo'yicha trafik — grafik uchun */
export type HourRow = { h: string; sessions: number; conv: number };

export async function hourly(r: Range): Promise<HourRow[]> {
  return prisma.$queryRaw<HourRow[]>`
    SELECT to_char(date_trunc('hour', "createdAt" + interval '5 hours'), 'DD.MM HH24:00') AS h,
           count(*)::int                                                          AS sessions,
           count(*) FILTER (WHERE converted)::int                                 AS conv
    FROM "Session"
    WHERE "createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
    GROUP BY date_trunc('hour', "createdAt" + interval '5 hours')
    ORDER BY date_trunc('hour', "createdAt" + interval '5 hours')
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

export async function recentCta(r: Range, limit = 12): Promise<RecentCta[]> {
  return prisma.$queryRaw<RecentCta[]>`
    SELECT e.ts, e."elId", e."elText", e."sessionId", e.page, s."utmContent", s.device
    FROM "Event" e
    JOIN "Session" s ON s.id = e."sessionId"
    WHERE e.type = 'cta'
      AND e.ts >= ${r.sqlFrom}::timestamp AND e.ts < ${r.sqlTo}::timestamp
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

export async function sessionList(r: Range, limit = 60, onlyConverted = false): Promise<SessionRow[]> {
  return prisma.$queryRaw<SessionRow[]>`
    SELECT s.id, s."createdAt", s."utmSource", s."utmContent", s.device, s.browser, s.converted,
           count(e.id)::int                                                  AS events,
           COALESCE(round(max(e."dwellMs") / 1000.0), 0)::int                AS "dwellSec",
           COALESCE(max(e."scrollPct"), 0)::int                              AS "maxScroll"
    FROM "Session" s
    LEFT JOIN "Event" e ON e."sessionId" = s.id
    WHERE s."createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
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
  /** Sessiya aynan shu sahifadan boshlangan — «Kirdi» */
  page: string;
  sessions: number;
  /** Sahifani ochgan NOYOB foydalanuvchilar — «Ko'rdi» */
  viewers: number;
  conv: number;
  /** Shu sahifadagi tugma necha marta bosilgan — «Bosildi» */
  clicks: number;
  /** Tugmani bosgan NOYOB foydalanuvchilar — «Bosgan odam» */
  clickUsers: number;
  /** `Bosgan odam / Ko'rdi` — sahifani ko'rganlarning qanchasi bosgani */
  cr: number;
};

export async function pageStats(r: Range): Promise<PageRow[]> {
  return prisma.$queryRaw<PageRow[]>`
    WITH s AS (
      SELECT CASE WHEN "landedAt" IS NULL THEN '—'
                  ELSE COALESCE(NULLIF(rtrim("landedAt", '/'), ''), '/') END AS page,
             count(*)::int                          AS sessions,
             count(*) FILTER (WHERE converted)::int AS conv
      FROM "Session"
      WHERE "createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
      GROUP BY 1
    ),
    c AS (
      SELECT CASE WHEN page IS NULL THEN '—'
                  ELSE COALESCE(NULLIF(rtrim(page, '/'), ''), '/') END AS page,
             count(DISTINCT "sessionId") FILTER (WHERE type = 'view')::int AS viewers,
             count(*) FILTER (WHERE type = 'cta')::int                     AS clicks,
             count(DISTINCT "sessionId") FILTER (WHERE type = 'cta')::int  AS users
      FROM "Event"
      WHERE type IN ('view', 'cta') AND ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
      GROUP BY 1
    )
    SELECT COALESCE(s.page, c.page)                          AS page,
           COALESCE(s.sessions, 0)                           AS sessions,
           COALESCE(c.viewers, 0)                            AS viewers,
           COALESCE(s.conv, 0)                               AS conv,
           COALESCE(c.clicks, 0)                             AS clicks,
           COALESCE(c.users, 0)                              AS "clickUsers",
           COALESCE(round(100.0 * c.users / NULLIF(c.viewers, 0), 2), 0)::float8 AS cr
    FROM s FULL JOIN c ON c.page = s.page
    ORDER BY COALESCE(c.viewers, 0) DESC, COALESCE(s.sessions, 0) DESC
  `;
}

/**
 * `pageStats()` qatorlarini kadr ro'yxati bilan birlashtiradi.
 *
 * Komponentda emas, shu yerda: uni server sahifalar chaqiradi, jadval
 * komponenti esa endi mijoz tomonida (saralash uchun) va `server-only`
 * modulini qiymat sifatida import qila olmaydi.
 *
 * MUHIM: statistikasi NOL bo'lgan kadr ham qatorda qoladi. Nol — bu
 * ma'lumot yo'qligi emas, «bu kadrga reklama umuman kelmayapti» degani,
 * aynan shuni ko'rish kerak. Faqat bazadagi qatorlarni chizsak, o'lik kadr
 * jadvaldan yo'qolib ketardi.
 *
 * Tartib — `LANDING_PAGES` bo'yicha, ro'yxatda yo'q yo'llar oxirida. Bu
 * BOSHLANG'ICH tartib, xolos: jadvalda foydalanuvchi ustun sarlavhasini
 * bosib o'zi saralaydi (`components/admin/useSort.tsx`).
 */
export type MergedRow = PageRow & { name: string; note: string; known: boolean; slug?: string };

export function mergePageRows(rows: PageRow[]): MergedRow[] {
  const byPath = new Map(rows.map((r) => [r.page, r]));

  const known: MergedRow[] = LANDING_PAGES.map((p) => {
    const r = byPath.get(p.path);
    byPath.delete(p.path);
    return {
      page: p.path,
      sessions: r?.sessions ?? 0,
      viewers: r?.viewers ?? 0,
      conv: r?.conv ?? 0,
      clicks: r?.clicks ?? 0,
      clickUsers: r?.clickUsers ?? 0,
      cr: r?.cr ?? 0,
      name: p.name,
      note: p.note,
      known: true,
      slug: p.slug,
    };
  });

  // Ro'yxatda yo'q yo'llar (o'chirilgan kadr, bot, `—`) — oxirida, alohida
  const rest: MergedRow[] = [...byPath.values()].map((r) => ({
    ...r,
    name: pageOf(r.page)?.name ?? '—',
    note: 'Ro’yxatda yo’q sahifa',
    known: false,
  }));

  return [...known, ...rest];
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

export async function pageButtons(r: Range, limit = 40): Promise<PageButtonRow[]> {
  return prisma.$queryRaw<PageButtonRow[]>`
    SELECT CASE WHEN page IS NULL THEN '—'
                ELSE COALESCE(NULLIF(rtrim(page, '/'), ''), '/') END AS page,
           "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
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
 * bitta kadr. Ildiz uchun rtrim bo'sh satr beradi — ${path} ham xuddi
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

export async function pageOverview(path: string, r: Range): Promise<PageOverview> {
  const target = norm(path);

  const [se] = await prisma.$queryRaw<{ sessions: number; conv: number }[]>`
    SELECT count(*)::int                          AS sessions,
           count(*) FILTER (WHERE converted)::int AS conv
    FROM "Session"
    WHERE "createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
      AND rtrim(COALESCE("landedAt", ''), '/') = ${target}
  `;

  const [cl] = await prisma.$queryRaw<{ clicks: number; users: number }[]>`
    SELECT count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
      AND rtrim(COALESCE(page, ''), '/') = ${target}
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
export async function pageHourly(path: string, r: Range): Promise<HourRow[]> {
  const target = norm(path);
  return prisma.$queryRaw<HourRow[]>`
    SELECT to_char(date_trunc('hour', "createdAt" + interval '5 hours'), 'DD.MM HH24:00') AS h,
           count(*)::int                                                          AS sessions,
           count(*) FILTER (WHERE converted)::int                                 AS conv
    FROM "Session"
    WHERE "createdAt" >= ${r.sqlFrom}::timestamp AND "createdAt" < ${r.sqlTo}::timestamp
      AND rtrim(COALESCE("landedAt", ''), '/') = ${target}
    GROUP BY date_trunc('hour', "createdAt" + interval '5 hours')
    ORDER BY date_trunc('hour', "createdAt" + interval '5 hours')
  `;
}

/** Kadr ichidagi tugmalar kesimi */
export async function pageButtonsOf(path: string, r: Range): Promise<ButtonRow[]> {
  const target = norm(path);
  return prisma.$queryRaw<ButtonRow[]>`
    SELECT "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= ${r.sqlFrom}::timestamp AND ts < ${r.sqlTo}::timestamp
      AND rtrim(COALESCE(page, ''), '/') = ${target}
    GROUP BY "elId", "elText"
    ORDER BY clicks DESC
  `;
}

/** Kadrning oxirgi CTA bosishlari */
export async function pageRecentCta(path: string, r: Range, limit = 12): Promise<RecentCta[]> {
  const target = norm(path);
  return prisma.$queryRaw<RecentCta[]>`
    SELECT e.ts, e."elId", e."elText", e."sessionId", e.page, s."utmContent", s.device
    FROM "Event" e
    JOIN "Session" s ON s.id = e."sessionId"
    WHERE e.type = 'cta' AND rtrim(COALESCE(e.page, ''), '/') = ${target}
      AND e.ts >= ${r.sqlFrom}::timestamp AND e.ts < ${r.sqlTo}::timestamp
    ORDER BY e.ts DESC
    LIMIT ${limit}::int
  `;
}
