import { prisma } from './prisma';
import { env } from './env';
import { FALLBACK_PRICES, type PriceItem } from './content';

/**
 * Landing uchun ma'lumot o'qish.
 *
 * Bu funksiyalar FAQAT build va revalidate paytida chaqiriladi — foydalanuvchi
 * so'rovida emas. Shu sabab Prisma cho'qqi trafikda ishtirok etmaydi.
 * DB yetib bo'lmasa zaxira qiymat qaytadi va build davom etadi.
 */

const PRICE_SELECT = {
  id: true,
  sku: true,
  title: true,
  amount: true,
  priceUzs: true,
  oldPriceUzs: true,
  badge: true,
  order: true,
} as const;

export async function getPrices(): Promise<PriceItem[]> {
  if (!env.DATABASE_URL) return FALLBACK_PRICES;
  try {
    const rows = await prisma.price.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { priceUzs: 'asc' }],
      select: PRICE_SELECT,
    });
    return rows.length ? rows : FALLBACK_PRICES;
  } catch (err) {
    console.warn('[build] narxlar DB dan olinmadi, zaxira ishlatiladi:', (err as Error).message);
    return FALLBACK_PRICES;
  }
}

export const DEFAULT_SETTINGS = {
  bot_username: env.BOT,
  hero_badge: 'Tashabbusli budjet mavsumi ochilgan',
  // Brend nomi bu yerda ATAYIN yo'q: «Open Budget» — davlat portalining nomi,
  // bizniki emas. Sarlavha xizmatni tasvirlaydi, brend esa logotipda turadi.
  hero_title: "Tashabbusli budjet ovozi|1 ovoz 30 000 so'mdan",
  hero_sub:
    "Humo, Uzcard yoki Payme bilan to'lang — 1 ovoz 30 000 so'mdan boshlanadi. Katta paketda arzonroq: 25 ovoz ≈ 24 800 so'm/dona.",
  cta_primary: 'Botda ovoz olish',
  cta_secondary: 'Narxlarni ko’rish',
  tg_channel: 'openbudget_uz',
  support_username: 'openbudget_help',
  reviews_count: '8 000+',
} as const;

export type Settings = Record<keyof typeof DEFAULT_SETTINGS, string>;

export async function getSettings(): Promise<Settings> {
  const out: Settings = { ...DEFAULT_SETTINGS };
  if (!env.DATABASE_URL) return out;
  try {
    const rows = await prisma.setting.findMany();
    for (const r of rows) {
      if (r.key in out && r.value) out[r.key as keyof Settings] = r.value;
    }
  } catch (err) {
    console.warn('[build] sozlamalar DB dan olinmadi:', (err as Error).message);
  }
  return out;
}
