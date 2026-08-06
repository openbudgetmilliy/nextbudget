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
  hero_badge: 'Tashabbusli budjet mavsumi ochilgan',
  /**
   * `{narx}` — o'rin egallovchi. Landing render paytida `price_one_vote`
   * qiymatiga almashadi, ya'ni narx BITTA joyda o'zgartiriladi
   * (`/admin/prices`), matnlarni qayta yozish shart emas.
   */
  price_one_vote: '30 000',

  // Brend nomi bu yerda ATAYIN yo'q: «Open Budget» — davlat portalining nomi,
  // bizniki emas. Sarlavha xizmatni tasvirlaydi, brend esa logotipda turadi.
  hero_title: 'Tashabbusli budjet ovozi',
  /**
   * Narx bu matnda TAKRORLANMAYDI: u sahifada alohida, katta ko'rsatiladi.
   * Bir xil raqamni ikki marta aytish urg'uni kuchaytirmaydi, bo'ladi.
   */
  hero_sub: 'Humo, Uzcard yoki Payme bilan to‘lang. Yashirin komissiya yo‘q.',
  cta_primary: 'Botda ovoz olish',
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
