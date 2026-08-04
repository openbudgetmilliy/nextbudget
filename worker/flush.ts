import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { EV_QUEUE, env } from '../lib/env';
import { parseUa } from '../lib/ua';

/**
 * Redis → Postgres batch yozuvchi.
 *
 * Cho'qqi paytida web process'lar faqat Redis'ga yozadi. Bu worker ularni
 * 10 sekundda bir marta yig'ib, Postgres'ga guruh bo'lib yozadi. Natijada
 * 60 req/s trafik → 6 ta INSERT/10s ga aylanadi.
 *
 * ── Spec'dagi uchta muammo shu yerda tuzatilgan ──
 *
 * 1. `converted` yangilanmasligi.
 *    Sessiya bir necha batch'da keladi. `createMany({ skipDuplicates: true })`
 *    ikkinchi marta HECH NARSA yozmaydi — ya'ni CTA keyingi batch'da kelsa,
 *    `converted` bazada `false` bo'lib qolardi va konversiya statistikasi
 *    past ko'rinardi. Yechim: sessiyalarni yozgandan keyin alohida
 *    `updateMany` bilan `converted = true` qo'yamiz.
 *
 * 2. Ma'lumot yo'qolishi.
 *    `LPOP` elementni Redis'dan olib tashlaydi. Postgres o'sha payt o'lgan
 *    bo'lsa, batch butunlay yo'qolardi. Yechim: xatoda elementlarni
 *    `LPUSH` bilan navbat boshiga qaytaramiz — DB ko'tarilgach yoziladi.
 *
 * 3. Navbat cheksiz o'sishi.
 *    Worker o'lgan bo'lsa Redis 256MB limitiga urilib, `allkeys-lru` butun
 *    navbatni o'chirib yuborishi mumkin. Yechim: har tickda `LTRIM` bilan
 *    navbatni MAX_QUEUE ga cheklaymiz (eng yangilarini saqlaymiz).
 */

const TICK_MS = 10_000;
const CHUNK = 200; // bitta LPOP da nechta
const MAX_PER_TICK = 2000; // orqada qolgan bo'lsa ham event loop'ni ushlamaymiz
const MAX_QUEUE = 100_000; // ~50 MB
const DEAD_QUEUE = `${EV_QUEUE}:dead`;

const EV_TYPES = new Set(['view', 'scroll', 'cta', 'click', 'exit']);
const DAY_MS = 86_400_000;

type Meta = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  referrer?: string | null;
  ua?: string | null;
  page?: string | null;
};

type RawEvent = {
  type?: string;
  elId?: string;
  elText?: string;
  scrollPct?: number;
  dwellMs?: number;
};

type SessionRow = {
  id: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrer: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  landedAt: string | null;
  converted: boolean;
};

type EventRow = {
  sessionId: string;
  type: string;
  elId: string | null;
  elText: string | null;
  page: string | null;
  scrollPct: number | null;
  dwellMs: number | null;
};

// ── Yordamchilar ──

const s = (v: unknown, n: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, n) : null;
};

const i = (v: unknown, min: number, max: number): number | null => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(Math.round(n), min), max);
};

/** Prisma xatolari ko'p qatorli va bo'sh qatordan boshlanadi — log'ni qisqartiramiz */
const firstLine = (err: unknown): string => {
  const m = err instanceof Error ? err.message : String(err);
  return m.split('\n').map((l) => l.trim()).find(Boolean) ?? 'noma’lum xato';
};

// ── Bitta batch'ni qayta ishlash ──

function build(items: string[]) {
  const sessions = new Map<string, SessionRow>();
  const events: EventRow[] = [];
  const converted = new Set<string>();
  const bad: string[] = [];

  for (const raw of items) {
    let payload: { sid?: unknown; events?: unknown; meta?: unknown };
    try {
      payload = JSON.parse(raw);
    } catch {
      bad.push(raw);
      continue;
    }

    const sid = s(payload.sid, 40);
    if (!sid || !Array.isArray(payload.events)) {
      bad.push(raw);
      continue;
    }

    const meta = (payload.meta ?? {}) as Meta;
    const page = s(meta.page, 120);

    if (!sessions.has(sid)) {
      const ua = s(meta.ua, 300);
      sessions.set(sid, {
        id: sid,
        utmSource: s(meta.utmSource, 60),
        utmMedium: s(meta.utmMedium, 60),
        utmCampaign: s(meta.utmCampaign, 80),
        utmContent: s(meta.utmContent, 80),
        referrer: s(meta.referrer, 300),
        landedAt: page,
        converted: false,
        ...parseUa(ua),
      });
    }

    for (const e of (payload.events as RawEvent[]).slice(0, 60)) {
      const type = s(e?.type, 20);
      if (!type || !EV_TYPES.has(type)) continue;

      events.push({
        sessionId: sid,
        type,
        elId: s(e.elId, 60),
        elText: s(e.elText, 80),
        page,
        scrollPct: e.scrollPct === undefined ? null : i(e.scrollPct, 0, 100),
        dwellMs: e.dwellMs === undefined ? null : i(e.dwellMs, 0, DAY_MS),
      });

      if (type === 'cta') {
        converted.add(sid);
        const row = sessions.get(sid);
        if (row) row.converted = true;
      }
    }
  }

  return { sessions: [...sessions.values()], events, converted: [...converted], bad };
}

// ── Yozish ──

async function write(batch: ReturnType<typeof build>): Promise<void> {
  if (batch.sessions.length) {
    await prisma.session.createMany({ data: batch.sessions, skipDuplicates: true });
  }

  // (1) Allaqachon bazada bo'lgan sessiyalar uchun konversiyani belgilaymiz.
  //     createMany skipDuplicates buni o'zi qilmaydi.
  if (batch.converted.length) {
    await prisma.session.updateMany({
      where: { id: { in: batch.converted }, converted: false },
      data: { converted: true },
    });
  }

  if (batch.events.length) {
    // Sessiyalar yozilgani uchun FK buzilmaydi. Katta massivni bo'lib yozamiz —
    // bitta gigant INSERT Postgres'ni uzoq ushlab turmasin.
    for (let k = 0; k < batch.events.length; k += 500) {
      await prisma.event.createMany({ data: batch.events.slice(k, k + 500) });
    }
  }
}

// ── Navbatdan batch olish ──

/**
 * `LPOP key count` faqat Redis >= 6.2 da bor. docker-compose'da redis:7 turadi,
 * lekin lokal/eski o'rnatmada 5.x bo'lishi mumkin va o'sha yerda
 * "ERR wrong number of arguments for 'lpop'" chiqadi.
 *
 * MULTI + LRANGE + LTRIM har qanday versiyada ishlaydi, atomik va bitta
 * round-trip — ya'ni LPOP count'dan yomon emas.
 */
async function popBatch(count: number): Promise<string[]> {
  const res = await redis.multi().lrange(EV_QUEUE, 0, count - 1).ltrim(EV_QUEUE, count, -1).exec();
  if (!res) return []; // MULTI uzildi

  const [lrange] = res;
  if (lrange?.[0]) throw lrange[0]; // Redis xatosi
  return (lrange?.[1] as string[] | null) ?? [];
}

/**
 * Batch'ni navbat BOSHIGA qaytarish (Postgres javob bermaganda).
 * `LPUSH key a b c` ro'yxatni `c b a` qilib qo'yadi — shuning uchun
 * asl tartibni saqlash uchun teskari yuboramiz.
 */
async function pushBack(items: string[]): Promise<void> {
  await redis.lpush(EV_QUEUE, ...[...items].reverse()).catch(() => {});
}

// ── Tick ──

let running = false;
let stopping = false;
let ticks = 0;
let totalEvents = 0;
let totalSessions = 0;

async function tick(): Promise<void> {
  if (running || stopping) return;
  running = true;

  try {
    // (3) Navbat hajmini cheklaymiz — eng yangi MAX_QUEUE ta qoladi
    await redis.ltrim(EV_QUEUE, -MAX_QUEUE, -1).catch(() => {});

    let processed = 0;

    while (processed < MAX_PER_TICK && !stopping) {
      const items = await popBatch(CHUNK);
      if (!items.length) break;
      processed += items.length;

      const batch = build(items);

      if (batch.bad.length) {
        // Buzilgan payload'lar asosiy navbatni to'sib qo'ymasin
        await redis.rpush(DEAD_QUEUE, ...batch.bad).catch(() => {});
        await redis.ltrim(DEAD_QUEUE, -1000, -1).catch(() => {});
      }

      try {
        await write(batch);
        totalSessions += batch.sessions.length;
        totalEvents += batch.events.length;
      } catch (err) {
        // (2) Postgres o'lgan bo'lsa — navbat boshiga qaytaramiz, yo'qotmaymiz.
        // Buzuq payload'lar qaytarilMAYDI: ular allaqachon dead-letter'da va
        // qaytarilsa har retry'da yana nusxalanib, navbatda abadiy qolardi.
        const bad = new Set(batch.bad);
        const retry = bad.size ? items.filter((x) => !bad.has(x)) : items;
        console.error(
          `[worker] yozish xatosi, ${retry.length} payload navbatga qaytarildi:`,
          firstLine(err),
        );
        if (retry.length) await pushBack(retry);
        break; // shu tickda davom etmaymiz, keyingisida qayta urinadi
      }
    }

    ticks++;
    if (processed > 0 && ticks % 6 === 0) {
      const len = await redis.llen(EV_QUEUE).catch(() => -1);
      console.log(
        `[worker] ${totalSessions} sessiya · ${totalEvents} event yozildi · navbatda ${len}`,
      );
    }
  } catch (err) {
    console.error('[worker] tick:', firstLine(err));
  } finally {
    running = false;
  }
}

// ── Ishga tushirish ──

console.log(`[worker] ishga tushdi · navbat: ${EV_QUEUE} · interval: ${TICK_MS}ms`);

const timer = setInterval(() => {
  void tick();
}, TICK_MS);

// PM2 `reload`/`restart` SIGINT/SIGTERM yuboradi — joriy batch'ni tugatib chiqamiz
async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  console.log(`[worker] ${signal} — to'xtatilmoqda…`);
  clearInterval(timer);

  const deadline = Date.now() + 8000;
  while (running && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 100));
  }

  await prisma.$disconnect().catch(() => {});
  redis.disconnect();
  console.log('[worker] to‘xtadi');
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (r) => console.error('[worker] unhandledRejection:', r));

// Redis'ni oldindan ulaymiz (lazyConnect yoqilgan)
redis.connect().catch(() => {
  console.error(`[worker] Redis'ga ulanmadi: ${env.REDIS_URL} — qayta urinishda davom etadi`);
});
