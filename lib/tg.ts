import { env } from './env';

/**
 * Telegram deep link.
 *
 * SSG sahifa foydalanuvchining UTM'ini bilmaydi, shuning uchun server
 * bazaviy `start` qiymatini qo'yadi. Sahifa yuklangach `lib/track.ts`
 * ichidagi `stampTelegramLinks()` uning ustiga trafik manbasini qo'shadi.
 * JS ishlamasa ham havola ishlaydi.
 *
 * Havola YETTALA kadrda bitta manbadan keladi — `bot_username` sozlamasi
 * (`/admin/settings`). Admin uni o'zgartirsa, `refreshLanding()` hamma
 * kadrni qayta build qiladi va tugmalar birdek yangi botga ketadi.
 */

/**
 * Sozlamadagi qiymatdan toza username ajratadi.
 *
 * Admin u yerga nima yozishini oldindan bilib bo'lmaydi: kimdir `@Bot`,
 * kimdir `Bot`, kimdir brauzerdan nusxa olib to'liq `https://t.me/Bot?start=x`
 * ni qo'yadi. Uchalasi ham ishlashi kerak — aks holda tugma butun saytda
 * buzuq havolaga aylanadi va buni faqat mijoz sezadi.
 */
/** Telegram qoidasi: 5–32 belgi, harf bilan boshlanadi, faqat harf/raqam/`_` */
const VALID_USERNAME = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

export function botUsername(raw: string): string {
  const v = (raw || '').trim();
  if (!v) return '';

  let name = v;

  // Qiymat havolaga o'xshasa — FAQAT t.me yo'lidan olamiz. Ilgari bunday
  // emasdi va tanimagan havoladan «nom» yasab qo'yardi: `https://t.me/`
  // → `httpstme`, Telegram Web havolasi → `httpswebtelegramorgk...`.
  // Ya'ni havola ko'rinishida, lekin butunlay boshqa manzil.
  if (/[/.:]/.test(v)) {
    const m = v.match(/(?:^|\/\/|\s)(?:t(?:elegram)?\.me|telegram\.dog)\/([^/?#\s]+)/i);
    if (!m) return '';
    name = m[1];
    // `t.me/+AbCd` — bu taklif havolasi, bot nomi emas
    if (name.startsWith('+')) return '';
  }

  const clean = name.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
  // Qoidaga tushmasa — YO'Q deb hisoblaymiz. Yarim tozalangan nomni
  // qaytarish eng yomoni edi: havola ishlaydigandek ko'rinib, hech qayerga
  // olib bormasdi.
  return VALID_USERNAME.test(clean) ? clean : '';
}

/**
 * @param bot   sozlamadagi xom qiymat (`@Bot`, `Bot` yoki to'liq havola)
 * @param start qaysi kadrdan kelgani — `lib/pages.ts` dagi `slug` (`p1`…`p7`).
 *              Bot tomonda «bu odam qaysi reklamadan keldi» shundan bilinadi.
 */
export function tgLink(bot: string, start = 'web'): string {
  // Uch qavatli zaxira. Sozlamaga bo'sh joy yoki `@` yozib qo'yilsa
  // `botUsername` bo'sh qaytaradi — busiz havola `https://t.me/?start=p1`
  // bo'lib, Telegram BOSH SAHIFASIGA olib borardi va butun voronka
  // to'qqizala kadrda bir vaqtda jim o'lardi (hech qayerda xato ko'rinmay).
  const b = botUsername(bot) || botUsername(env.BOT) || 'OpenBudgetBot';
  const s = start.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60) || 'web';
  return `https://t.me/${b}?start=${s}`;
}
