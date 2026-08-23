/**
 * ANALITIKA VAQT ORALIG'I — yagona manba.
 *
 * Admin paneldagi hamma sahifa (Dashboard, Analitika, Reklama, Sessiyalar,
 * kadr kesimi) vaqtni SHU YERDAN oladi. Ilgari har biri `?h=` (necha soat
 * orqaga) bilan ishlardi va «kecha nima bo'ldi» degan savolga javob bera
 * olmasdi: 24 soat orqaga — bu kecha emas, oxirgi 24 soat.
 *
 * ─── VAQT MINTAQASI ───────────────────────────────────────────────────
 *
 * Kun — TOSHKENT kuni: 00:00:00 dan 23:59:59 gacha. O'zbekiston UTC+5,
 * yozgi vaqt YO'Q (1992 yildan buyon), shuning uchun ofset qat'iy 5 soat.
 * Bu tzdata'ga bog'liq bo'lmagan eng ishonchli yo'l.
 *
 * ─── BAZADAGI HOLAT (juda muhim) ──────────────────────────────────────
 *
 * `Event.ts` va `Session.createdAt` — `timestamp WITHOUT time zone`,
 * Postgres sessiyasining TimeZone'i esa `Etc/UTC`. Ya'ni ustunlarda UTC
 * DEVOR-SOATI yotibdi (ofsetsiz). Shuning uchun:
 *
 *   · JS `Date` ni to'g'ridan-to'g'ri parametr qilib berish XAVFLI —
 *     u timestamptz sifatida ketadi va solishtiruv server TimeZone'iga
 *     bog'lanib qoladi. Bugun UTC, ertaga kimdir o'zgartirsa — jim
 *     buziladi va buni hech kim sezmaydi.
 *   · Shuning uchun bu yerda NAIVE UTC SATR tayyorlanadi
 *     (`sqlFrom`/`sqlTo`) va so'rovda `::timestamp` bilan cast qilinadi.
 *     Solishtiruv sof matn → sof timestamp, hech qanday mintaqa ishtirok
 *     etmaydi.
 *
 * Soatlik grafiklarda esa teskarisi kerak — UTC devor-soatini Toshkentga
 * o'tkazish: `ts + interval '5 hours'` (`lib/stats.ts`).
 *
 * ─── URL SHARTNOMASI ──────────────────────────────────────────────────
 *
 *   ?h=24                   oxirgi 24 soat (tayyor tugmalar)
 *   ?d=2026-08-22           o'sha kun, 00:00–23:59 (Toshkent)
 *   ?d=2026-08-20&d2=…-22   kunlar oralig'i
 *   ?t=9-18                 soat oynasi: 09:00:00 dan 18:59:59 gacha
 *
 * `t` ikkala uchi ham QO'SHIB hisoblanadi: `0-23` — to'liq kun. Buyurtma
 * shunday aytilgan: «00 00 dan 23 59 — 1 kun degani».
 *
 * Bu fayl `server-only` EMAS va prisma'ni import qilmaydi — `RangePicker`
 * (mijoz komponenti) ham shu qoidalarni o'qiy oladi, ya'ni sana matni
 * ikki joyda ikki xil hisoblanmaydi.
 */

/** Toshkent = UTC+5, yil bo'yi */
export const TZ_OFFSET_MIN = 300;
export const TZ_LABEL = 'Toshkent';

const HOUR = 3_600_000;
const DAY = 86_400_000;
const TZ_MS = TZ_OFFSET_MIN * 60_000;

/** Eng uzun ruxsat etilgan oraliq — bexosdan butun bazani so'rab qolmaslik uchun */
const MAX_DAYS = 366;

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

export type Range = {
  /** Boshlanish — absolyut payt, QO'SHIB hisoblanadi */
  from: Date;
  /** Tugash — absolyut payt, QO'SHILMAYDI (`< to`) */
  to: Date;
  /** Postgres uchun naive UTC satr: `2026-08-22 04:00:00.000` */
  sqlFrom: string;
  sqlTo: string;
  /** Oraliq uzunligi soatda — «o'rtacha» hisoblar va matnlar uchun */
  hours: number;
  /** Ekrandagi nom: «22-avgust · 09:00–18:59» */
  label: string;
  /** Tayyor tugma tanlanganmi (24/72/168/720) — pickerdagi faol holat */
  preset: number | null;
  /** Tanlangan kun(lar), `YYYY-MM-DD`; preset rejimida `null` */
  day: string | null;
  day2: string | null;
  /** Soat oynasi, ikkala uchi ham qo'shiladi */
  h1: number;
  h2: number;
  /** Shu oraliqni bildiruvchi URL parametrlari */
  q: Record<string, string>;
};

export type RangeParams = { h?: string; d?: string; d2?: string; t?: string };

/** `YYYY-MM-DD` shaklidami va haqiqiy sanami */
function validDay(v: string | undefined): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const ms = Date.parse(`${v}T00:00:00.000Z`);
  if (!Number.isFinite(ms)) return null;
  // `2026-02-31` Date.parse'da NaN bermaydi — teskari aylantirib tekshiramiz
  return new Date(ms).toISOString().slice(0, 10) === v ? v : null;
}

/** Toshkent kunining 00:00 i — absolyut ms */
function dayStartMs(day: string): number {
  return Date.parse(`${day}T00:00:00.000Z`) - TZ_MS;
}

/** Absolyut ms → Postgres uchun naive UTC satr */
function sqlNaive(ms: number): string {
  return new Date(ms).toISOString().slice(0, 23).replace('T', ' ');
}

/** Toshkent bo'yicha bugungi kun, `YYYY-MM-DD` */
export function tashkentToday(now: number = Date.now()): string {
  return new Date(now + TZ_MS).toISOString().slice(0, 10);
}

/** Toshkent bo'yicha kecha */
export function tashkentYesterday(now: number = Date.now()): string {
  return tashkentToday(now - DAY);
}

/** `2026-08-22` → `22-avgust` */
export function dayLabel(day: string): string {
  const [, m, d] = day.split('-');
  return `${Number(d)}-${MONTHS[Number(m) - 1]}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `?t=` ni o'qiydi. Noto'g'ri bo'lsa — to'liq kun */
function parseHourWindow(v: string | undefined): [number, number] {
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(v ?? '');
  if (!m) return [0, 23];
  let a = Math.min(Math.max(Number(m[1]), 0), 23);
  let b = Math.min(Math.max(Number(m[2]), 0), 23);
  // Teskari yozilgan bo'lsa almashtiramiz: admin xatosi bo'sh jadval
  // bermasin, u «ma'lumot yo'q» bo'lib ko'rinardi
  if (a > b) [a, b] = [b, a];
  return [a, b];
}

/** Tayyor tugmalar uchun soat: 1 dan 90 kungacha */
export function clampHours(v: string | undefined, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), 1), 24 * 90);
}

const PRESETS = new Set([24, 72, 168, 720]);

function presetLabel(hours: number): string {
  if (hours === 24) return '24 soat';
  if (hours === 72) return '3 kun';
  if (hours === 168) return '7 kun';
  if (hours === 720) return '30 kun';
  return hours % 24 === 0 ? `${hours / 24} kun` : `${hours} soat`;
}

/**
 * URL parametrlaridan oraliq yasaydi.
 *
 * `?d=` bo'lsa — KUN rejimi (soat oynasi bilan yoki busiz). Bo'lmasa —
 * tayyor tugma rejimi (`?h=`, standart `fallbackHours`).
 */
export function parseRange(sp: RangeParams, fallbackHours = 24): Range {
  const now = Date.now();
  const day = validDay(sp.d);

  if (day) {
    const [h1, h2] = parseHourWindow(sp.t);
    let a = day;
    let b = validDay(sp.d2) ?? day;
    if (a > b) [a, b] = [b, a];

    // Juda uzun oraliqni kesamiz
    if ((dayStartMs(b) - dayStartMs(a)) / DAY > MAX_DAYS) {
      b = new Date(dayStartMs(a) + MAX_DAYS * DAY + TZ_MS).toISOString().slice(0, 10);
    }

    const fromMs = dayStartMs(a) + h1 * HOUR;
    // `h2` QO'SHIB hisoblanadi, shuning uchun +1 soat: `23` → ertangi 00:00
    const toMs = dayStartMs(b) + (h2 + 1) * HOUR;

    const whole = h1 === 0 && h2 === 23;
    const days = a === b ? dayLabel(a) : `${dayLabel(a)} – ${dayLabel(b)}`;
    const label = whole ? days : `${days} · ${pad(h1)}:00–${pad(h2)}:59`;

    const q: Record<string, string> = { d: a };
    if (b !== a) q.d2 = b;
    if (!whole) q.t = `${h1}-${h2}`;

    return {
      from: new Date(fromMs),
      to: new Date(toMs),
      sqlFrom: sqlNaive(fromMs),
      sqlTo: sqlNaive(toMs),
      hours: Math.max(1, Math.round((toMs - fromMs) / HOUR)),
      label,
      preset: null,
      day: a,
      day2: b === a ? null : b,
      h1,
      h2,
      q,
    };
  }

  const hours = clampHours(sp.h, fallbackHours);
  const fromMs = now - hours * HOUR;
  return {
    from: new Date(fromMs),
    to: new Date(now),
    sqlFrom: sqlNaive(fromMs),
    sqlTo: sqlNaive(now),
    hours,
    label: presetLabel(hours),
    preset: PRESETS.has(hours) ? hours : null,
    day: null,
    day2: null,
    h1: 0,
    h2: 23,
    q: { h: String(hours) },
  };
}

/** Oraliq + qo'shimcha parametrlardan so'rov satri yasaydi */
export function rangeQuery(r: Range, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams({ ...r.q, ...extra });
  const s = p.toString();
  return s ? `?${s}` : '';
}
