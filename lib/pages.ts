/**
 * Landing kadrlari — YAGONA ro'yxat.
 *
 * Sayt bitta emas, yettita bir ekranli slayddan iborat: har biri alohida
 * reklama kadri. Ro'yxat shu yerda turadi va uch joyda ishlatiladi:
 *
 *   · `lib/cf.ts`            — narx o'zgarganda hammasini revalidate qilish
 *   · `/admin/reklama`       — har kadr uchun tayyor reklama havolasi
 *   · `lib/stats.ts` + admin — statistikada yo'lni odam tushunadigan nom bilan
 *
 * Yangi kadr qo'shilsa (`app/8/page.tsx`) — SHU RO'YXATGA bitta qator
 * qo'shiladi, qolgani o'zi ishlaydi.
 *
 * `slug` — Telegram `?start=` qiymati va standart `utm_content`. Faqat
 * `A-Za-z0-9_` bo'lishi shart (`tgLink` qolganini kesib tashlaydi), shu
 * sabab qisqa: `p1`…`p7`. Bot tomonda ham, analitikada ham bitta til.
 */

export type LandingPage = {
  /** Sayt yo'li — `location.pathname` bilan bir xil yozilishi shart */
  path: string;
  /** `?start=` va `utm_content` uchun qisqa kalit */
  slug: string;
  /** Admin panelda ko'rinadigan nom */
  name: string;
  /** Kadr nimasi bilan farq qiladi — reklama sahifasidagi izoh */
  note: string;
};

// Eslatma: kadr pixellari endi bu yerda EMAS — admin sozlamalarida
// (`pixel_p1`…`pixel_p8`, lib/data.ts). Admin ularni deploy'siz o'zgartiradi.

export const LANDING_PAGES: LandingPage[] = [
  { path: '/', slug: 'p1', name: 'Milliy', note: 'Oq-moviy, bayroq lentasi' },
  { path: '/2', slug: 'p2', name: 'Energetik', note: 'Sariq, yuqori kontrast' },
  { path: '/3', slug: 'p3', name: 'Gradient', note: 'Quyosh botishi, stories uslubi' },
  { path: '/4', slug: 'p4', name: 'Zamonaviy', note: 'Qora-oq, minimal' },
  { path: '/5', slug: 'p5', name: 'Fintech', note: 'Bank ilovasi, push-xabar' },
  { path: '/6', slug: 'p6', name: 'Poster', note: 'Tayyor kreativ: tangali banka' },
  { path: '/7', slug: 'p7', name: 'Telegram', note: 'Tayyor kreativ: qora-yashil bot' },
  { path: '/8', slug: 'p8', name: 'Taymer', note: "Yorug' ko'k-firuza, muddat taymeri bilan" },
  { path: '/9', slug: 'p9', name: 'Banknota', note: "To'q fon, 100 ming so'mlik, qizil tugma" },
];

export const LANDING_PATHS = LANDING_PAGES.map((p) => p.path);

/** Yo'lni ro'yxatdagi ko'rinishga keltiradi: `/7/` → `/7`, `` → `/` */
export function normalizePath(raw: string | null | undefined): string {
  if (!raw) return '/';
  const p = raw.split('?')[0].split('#')[0];
  const trimmed = p.replace(/\/+$/, '');
  return trimmed || '/';
}

/** Statistikadagi xom yo'lga mos kadr (topilmasa — `undefined`) */
export function pageOf(path: string | null | undefined): LandingPage | undefined {
  const p = normalizePath(path);
  return LANDING_PAGES.find((x) => x.path === p);
}

/** Statistika jadvallari uchun yorliq: `/7 · Telegram` yoki xom yo'l */
export function pageLabel(path: string | null | undefined): string {
  return pageOf(path)?.name ?? normalizePath(path);
}

/**
 * Yo'l bo'yicha kadrni qaytaradi va topilmasa BUILD'ni yiqitadi.
 *
 * Ataylab qattiq: sahifa fayli bor, ro'yxatda esa yo'q bo'lsa — u kadr
 * reklama sahifasida ham, statistikada ham ko'rinmay qolardi va buni hech
 * kim sezmasdi. Build'da yiqilgani ming marta yaxshi.
 */
export function pageAt(path: string): LandingPage {
  const p = LANDING_PAGES.find((x) => x.path === path);
  if (!p) throw new Error(`lib/pages.ts: "${path}" kadri ro'yxatda yo'q`);
  return p;
}
