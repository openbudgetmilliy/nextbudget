import { prisma } from './prisma';
import { env } from './env';
import { ctaLink } from './tg';

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
  pixel_p10: '',
  pixel_p11: '',
  pixel_p12: '',

  /**
   * Kadr havolalari — «tugma bosilganda qayerga ketadi», har kadrga alohida.
   * Bo'sh bo'lsa kadr umumiy `bot_username` ga boradi (odatdagi holat).
   * To'ldirilsa faqat O'SHA kadr boshqa manzilga ketadi: boshqa bot, kanal
   * yoki tashqi sayt. Qabul qilinadigan ko'rinishlar — `lib/tg.ts` →
   * `ctaLink`. Admin /admin/settings dan yozadi, deploy shart emas.
   */
  link_p1: '',
  link_p2: '',
  link_p3: '',
  link_p4: '',
  link_p5: '',
  link_p6: '',
  link_p7: '',
  link_p8: '',
  link_p9: '',
  link_p10: '',
  link_p11: '',
  link_p12: '',
} as const;

export type Settings = Record<keyof typeof DEFAULT_SETTINGS, string>;

export async function getSettings(): Promise<Settings> {
  const out: Settings = { ...DEFAULT_SETTINGS };
  if (!env.DATABASE_URL) return out;

  /**
   * Uch marta urinamiz. Nega: sahifalar `force-static` + `revalidate = 60`,
   * ya'ni ISR yangilanishi paytidagi BIR LAHZALIK DB uzilishi zaxira
   * qiymatlarni (boshqa bot, boshqa narx) statik HTML'ga muhrlab qo'yardi
   * va u keyingi muvaffaqiyatli revalidate'gacha shu holda tarqalardi.
   * Xato hech qayerda ko'rinmasdi — 200, tugma joyida, faqat manzil boshqa.
   */
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const rows = await prisma.setting.findMany();
      for (const r of rows) {
        if (r.key in out && r.value.trim()) out[r.key as keyof Settings] = r.value;
      }
      return out;
    } catch (err) {
      if (attempt === 3) {
        console.warn('[build] sozlamalar DB dan olinmadi:', (err as Error).message);
        break;
      }
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
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

/**
 * Kadr tugmasining manzili — `link_<slug>` bo'lsa o'sha, bo'lmasa umumiy bot.
 *
 * Hamma kadr SHU yagona funksiyani chaqiradi: qoida bitta joyda tursin,
 * aks holda o'nta sahifada o'nta xil xulq paydo bo'lardi. Qaror mantig'i —
 * `lib/tg.ts` → `ctaLink`.
 */
export function pageCta(s: Settings, slug: string): { href: string; stamp: boolean } {
  const raw = (s as Record<string, string>)[`link_${slug}`] ?? '';
  return ctaLink(raw, s.bot_username || env.BOT, slug);
}
