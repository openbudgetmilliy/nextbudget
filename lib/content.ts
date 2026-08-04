/**
 * Landing matnlari va zaxira narxlar.
 *
 * Nega zaxira narx kerak: `npm run build` paytida Postgres yetib bo'lmasa
 * build yiqilmasligi kerak. Shunda deploy hech qachon "DB ko'tarilmadi" deb
 * to'xtamaydi — sahifa zaxira narx bilan chiqadi, keyingi revalidate'da
 * bazadagi haqiqiy narx o'rnini oladi.
 */

export type PriceItem = {
  id: string;
  sku: string;
  title: string;
  amount: number;
  priceUzs: number;
  oldPriceUzs: number | null;
  badge: string | null;
  order: number;
};

/**
 * SKU prefiksi bo'yicha landing tabi:
 *  - `ovoz_*`   → Ovoz paketlari (asosiy)
 *  - `xizmat_*` → Qo'shimcha xizmatlar (SMS tasdiq, tezkor ovoz va h.k.)
 */
export type PriceKind = 'ovoz' | 'xizmat';

export function kindOf(sku: string): PriceKind {
  return sku.startsWith('xizmat_') ? 'xizmat' : 'ovoz';
}

/** Emoji yo'q — yorliqlar mono, katta harfda va keng oraliqda teriladi */
export const PRICE_TABS: { kind: PriceKind; inputId: string; label: string }[] = [
  { kind: 'ovoz', inputId: 't-ovoz', label: 'Ovoz paketlari' },
  { kind: 'xizmat', inputId: 't-xizmat', label: 'Qo’shimcha xizmatlar' },
];

/**
 * Zaxira narxlar — 1 ovoz = 30 000 so'm asosida.
 * Katta paketlarda bir ovoz narxi kamayadi (miqdor chegirmasi).
 * Admin panel bularni haqiqiy qiymatlar bilan almashtiradi.
 */
export const FALLBACK_PRICES: PriceItem[] = [
  { id: 'f1', sku: 'ovoz_1',  title: '1 ovoz',  amount: 1,  priceUzs: 30000,   oldPriceUzs: null,    badge: null,           order: 10 },
  { id: 'f2', sku: 'ovoz_3',  title: '3 ovoz',  amount: 3,  priceUzs: 85000,   oldPriceUzs: 90000,   badge: null,           order: 20 },
  { id: 'f3', sku: 'ovoz_5',  title: '5 ovoz',  amount: 5,  priceUzs: 135000,  oldPriceUzs: 150000,  badge: 'Ommabop',      order: 30 },
  { id: 'f4', sku: 'ovoz_10', title: '10 ovoz', amount: 10, priceUzs: 260000,  oldPriceUzs: 300000,  badge: null,           order: 40 },
  { id: 'f5', sku: 'ovoz_25', title: '25 ovoz', amount: 25, priceUzs: 620000,  oldPriceUzs: 750000,  badge: 'Eng foydali',  order: 50 },
  { id: 'f6', sku: 'ovoz_50', title: '50 ovoz', amount: 50, priceUzs: 1200000, oldPriceUzs: 1500000, badge: 'Chegirma',     order: 60 },
  { id: 'f7', sku: 'xizmat_sms',    title: 'SMS tasdiqlash', amount: 1, priceUzs: 8000,  oldPriceUzs: null, badge: null,  order: 70 },
  { id: 'f8', sku: 'xizmat_tezkor', title: 'Tezkor ovoz',    amount: 1, priceUzs: 25000, oldPriceUzs: null, badge: 'Tez', order: 80 },
];

export const SITE = {
  brand: 'MilliyJamoasimiz',
  domain: 'milliyjamoasimiz.uz',
  title: 'MilliyJamoasimiz — Tashabbusli budjet tashabbuslarini targ‘ib qilish',
  description:
    "Tashabbusli budjet loyihalari uchun ovoz paketlari. Aniq narxlar, mahalliy kartalar (Humo, Uzcard, Payme) va Telegram bot orqali qulay tanlov.",
  tgline: "Botga o'ting, ovoz sonini tanlang va to'lang",
} as const;

export const STEPS = [
  {
    n: '1',
    title: 'Botni ochasiz',
    text: "Pastdagi tugma orqali Telegram botga o'tasiz. Ro'yxatdan o'tish shart emas.",
  },
  {
    n: '2',
    title: 'Ovoz paketini tanlaysiz',
    text: 'Kerakli ovoz sonini yoki qo\'shimcha xizmatni tanlaysiz. Bot qadam-baqadam yo\'l ko\'rsatadi.',
  },
  {
    n: '3',
    title: 'To’laysiz va tasdiqlaysiz',
    text: "Humo/Uzcard yoki Payme orqali to'lov. Ovozlar botdagi jarayon orqali yetkaziladi.",
  },
] as const;

export const ADVANTAGES = [
  { icon: 'bolt',   title: 'Tez jarayon',        text: "To'lovdan keyin botda status yangilanadi. Uzoq navbat kutish shart emas." },
  { icon: 'card',   title: 'Mahalliy kartalar',  text: "Humo, Uzcard, Payme, Click. So'mda, VPN va xalqaro karta talab qilinmaydi." },
  { icon: 'shield', title: 'Aniq narxlar',       text: "Saytdagi va botdagi narxlar bir xil. Yashirin komissiya qo'shilmaydi." },
  { icon: 'tag',    title: 'Ovoz paketlari',     text: "1 dan 50+ gacha ovoz — bir martalik yoki katta hajm uchun chegirmali paketlar." },
  { icon: 'chat',   title: "24/7 qo’llab-quvvatlash", text: "Savol tug'ilsa botdagi «Yordam» orqali operator bilan bog'lanasiz." },
  { icon: 'users',  title: '8 000+ foydalanuvchi',    text: "Mavsumlar davomida minglab mijozlar xizmatdan foydalangan." },
] as const;

export const FAQ = [
  {
    q: 'Ovoz narxi qanday hisoblanadi?',
    a: "Har bir paketda nechta ovoz borligi va jami narx ko'rsatilgan. Katta paketlarda bitta ovoz narxi arzonroq — kartochkada «1 ovoz ≈ … so'm» qatorini qarang.",
  },
  {
    q: 'Qanday to’lov usullari bor?',
    a: "Humo, Uzcard, Payme, Click. Barchasi so'mda, xalqaro karta talab qilinmaydi.",
  },
  {
    q: 'Qo‘shimcha xizmatlar nima?',
    a: "«Qo'shimcha xizmatlar» tabida SMS tasdiqlash, tezkor ovoz kabi bir martalik xizmatlar bo'ladi. SKU prefiksi `xizmat_*`.",
  },
  {
    q: 'Ovoz qancha vaqtda yetkaziladi?',
    a: "Odatda to'lovdan keyin 10–30 daqiqa ichida. Tezkor xizmat tanlansa — 5 daqiqagacha.",
  },
  {
    q: 'Rasmiy Open Budget portali bilan aloqangiz bormi?',
    a: "Yo'q — biz mustaqil vositachi xizmat ko'rsatamiz. Ovoz berish qoidalari va loyiha ro'yxati uchun openbudget.uz rasmiy manbasiga murojaat qiling.",
  },
  {
    q: 'Muammo bo‘lsa nima qilaman?',
    a: "Botdagi «Yordam» tugmasi yoki saytdagi qo'llab-quvvatlash havolasidan yozing. To'lov cheki va vaqtini yuboring — tekshirib javob beramiz.",
  },
] as const;

/**
 * Matndagi `{narx}` o'rin egallovchisini haqiqiy qiymatga almashtiradi.
 *
 * Nega kerak: narx bir nechta joyda takrorlanadi (hero sarlavhasi, tavsif).
 * Admin uni BITTA maydonda o'zgartirsin — matnlarni qo'lda tahrirlamasin.
 */
export function applyVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => vars[key] ?? whole);
}

/** Narxni "27 900 so'm" ko'rinishida — Intl'siz, tez */
export function uzs(n: number): string {
  const s = String(Math.round(n));
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ' ';
    out += s[i];
  }
  return out;
}

export function priceUnitLine(kind: PriceKind, amount: number): string {
  if (kind === 'ovoz') return `${amount} ta ovoz`;
  return amount > 1 ? `${amount} birlik xizmat` : 'Bir martalik xizmat';
}

export function pricePerLine(kind: PriceKind, per: number): string {
  if (kind === 'ovoz') return `1 ovoz ≈ ${uzs(per)} so'm`;
  return `≈ ${uzs(per)} so'm`;
}
