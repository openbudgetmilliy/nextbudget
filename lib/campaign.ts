/**
 * Kampaniya oynasi — BARCHA kadrlardagi taymerlar shu sanaga sanaydi.
 *
 * Muddat o'tsa kadrlarda «Ovoz berish muddati tugadi» chiqadi — yangi
 * kampaniya boshlanganda SHU QATORNI yangilash kifoya, hamma kadr
 * birdan yangi sanaga o'tadi.
 */
export const CAMPAIGN_END = new Date('2026-08-30T23:59:00+05:00').getTime();

/**
 * Aksiya matnlari — `/8` kabi kadrlar uchun.
 *
 * Qolgan kadrlar bitta ovoz narxini (`price_one_vote` sozlamasi)
 * ko'rsatadi; bu ikkisi esa aksiyaning yuqori chegarasini va sovrinni
 * aytadi. Boshqa gap bo'lgani uchun sozlamada emas, SHU YERDA — kadr
 * matni admin panelidan tasodifan o'zgarib ketmasin.
 */
export const CAMPAIGN = {
  /** Sarlavhadagi yuqori chegara */
  ceiling: '100 000 so‘mgacha',
  /** Qo'shimcha sovrin */
  prize: 'iPhone 17 Pro Max',
} as const;

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

/**
 * «30-avgust, 23:59» — Toshkent vaqtida.
 *
 * `getUTC*` ATAYIN: vaqtga +5 soat qo'shib UTC maydonlarini o'qiymiz.
 * Shunda natija build qayerda ketishiga bog'liq bo'lmaydi — serverda UTC,
 * noutbukda UTC+5 bo'lsa ham bir xil chiqadi.
 */
export function deadlineLabel(): string {
  const d = new Date(CAMPAIGN_END + 5 * 3_600_000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${d.getUTCDate()}-${MONTHS[d.getUTCMonth()]}, ${hh}:${mm}`;
}

/**
 * Qolgan millisekund — SERVER tomonda hisoblanadi.
 *
 * `components/landing/Countdown` ga boshlang'ich qiymat sifatida beriladi:
 * client birinchi renderda AYNAN shuni chizadi, ya'ni gidratatsiya mos
 * keladi. Kadrlar SSG va keshdan kelgani uchun bu qiymat bir necha daqiqa
 * eskirgan bo'lishi mumkin — client uni mount bo'lgan zahoti to'g'irlaydi.
 */
export function campaignLeft(): number {
  return Math.max(0, CAMPAIGN_END - Date.now());
}

/**
 * Muddat hali tugamaganmi.
 *
 * Tugagan bo'lsa kadr taymerni UMUMAN chizmaydi: nol turgan taymer
 * «aksiya tugadi» degan xabar bo'lib, reklama trafigini bekorga yoqib
 * yuborardi.
 */
export function isOpen(): boolean {
  return campaignLeft() > 0;
}
