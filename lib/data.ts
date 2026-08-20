import { prisma } from './prisma';
import { env } from './env';

/**
 * Landing uchun ma'lumot o'qish.
 *
 * Bu funksiyalar FAQAT build va revalidate paytida chaqiriladi — foydalanuvchi
 * so'rovida emas. Shu sabab Prisma cho'qqi trafikda ishtirok etmaydi.
 * DB yetib bo'lmasa zaxira qiymat qaytadi va build davom etadi.
 */



export const DEFAULT_SETTINGS = {
  bot_username: env.BOT,
  hero_badge: '',
  /**
   * `{narx}` — o'rin egallovchi. Landing render paytida `price_one_vote`
   * qiymatiga almashadi, ya'ni narx BITTA joyda o'zgartiriladi
   * (`/admin/prices`), matnlarni qayta yozish shart emas.
   */
  price_one_vote: '30 000',

  hero_title: 'Ovoz bering — pul ishlab oling!',
  hero_sub: "Faqat biz har bir ovoz uchun haqiqiy to'lov qilamiz.",
  cta_primary: 'Botda ovoz olish',
  tg_channel: 'openbudget_uz',
  support_username: 'openbudget_help',
  reviews_count: '8 000+',

  /**
   * Kadr pixellari — Meta Pixel ID, har kadrga alohida (reklama akkauntiga
   * qarab). Vergul bilan bir nechtasi ham bo'ladi. Bo'sh — kadr pixelsiz.
   * Admin /admin/settings dan ulaydi; saqlangach refreshLanding hamma
   * kadrni qayta build qiladi va pixel bir necha soniyada yonadi.
   */
  pixel_p1: '',
  pixel_p2: '',
  pixel_p3: '',
  pixel_p4: '',
  pixel_p5: '',
  pixel_p6: '',
  pixel_p7: '',
  pixel_p8: '',
  pixel_p9: '',
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

/** Sozlamadagi kadr pixellari — `MetaPixel` uchun massiv ko'rinishida */
export function pagePixels(s: Settings, slug: string): string[] {
  const raw = (s as Record<string, string>)[`pixel_${slug}`] ?? '';
  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}
