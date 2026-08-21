import { env } from './env';

/**
 * Telegram deep link.
 *
 * SSG sahifa foydalanuvchining UTM'ini bilmaydi, shuning uchun server
 * bazaviy `start` qiymatini qo'yadi. Sahifa yuklangach `lib/track.ts`
 * ichidagi `stampTelegramLinks()` uning ustiga trafik manbasini qo'shadi.
 * JS ishlamasa ham havola ishlaydi.
 *
 * Havola HAMMA kadrda bitta manbadan keladi — `bot_username` sozlamasi
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

/** Telegram `start` uchun ruxsat: A-Za-z0-9_- va 64 belgi */
function cleanStart(v: string): string {
  return v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

/**
 * Sozlamadagi qiymatda QAT'IY `start` bormi.
 *
 * Admin bot maydoniga to'liq havolani `?start=abu1` bilan yozsa — bu
 * «hamma kadr aynan shu kod bilan botga borsin» degani (bot o'sha kod
 * bo'yicha nechta odam kelganini sanaydi). Shunda kadr slug'i ham, UTM
 * qo'shimchasi ham qo'yilmaydi: kod botga TOZA yetib borishi kerak.
 *
 * Havolada `start` bo'lmasa — har kadr o'z slug'ini yuboradi (`p1`…`p10`)
 * va ustiga trafik manbasi yopishadi (`p6-instagram`).
 *
 * Kadr kesimidagi o'z statistikamiz bunga BOG'LIQ EMAS — u `landedAt` va
 * `Event.page` ustiga qurilgan, ya'ni admin paneldagi jadval ikkala
 * rejimda ham to'liq ishlaydi.
 */
export function fixedStart(bot: string): string | null {
  const m = (bot || '').match(/[?&]start=([^&#\s]+)/i);
  if (!m) return null;
  let raw = m[1];
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* xom holicha ishlatamiz */
  }
  return cleanStart(raw) || null;
}

/**
 * @param bot   sozlamadagi xom qiymat (`@Bot`, `Bot` yoki to'liq havola)
 * @param start qaysi kadrdan kelgani — `lib/pages.ts` dagi `slug` (`p1`…`p10`).
 *              Sozlamada qat'iy `?start=` bo'lsa BU parametr e'tiborsiz
 *              qoladi va hamma kadr bitta kod bilan botga boradi.
 */
export function tgLink(bot: string, start = 'web'): string {
  // Uch qavatli zaxira. Sozlamaga bo'sh joy yoki `@` yozib qo'yilsa
  // `botUsername` bo'sh qaytaradi — busiz havola `https://t.me/?start=p1`
  // bo'lib, Telegram BOSH SAHIFASIGA olib borardi va butun voronka
  // hamma kadrda bir vaqtda jim o'lardi (hech qayerda xato ko'rinmay).
  const b = botUsername(bot) || botUsername(env.BOT) || 'OpenBudgetBot';
  const s = fixedStart(bot) ?? (cleanStart(start) || 'web');
  return `https://t.me/${b}?start=${s}`;
}

/** Brauzer ocha oladigan manzil. `javascript:`, `data:` va h.k. shu yerda kesiladi. */
const SAFE_URL = /^https?:\/\//i;

/**
 * KADR TUGMASINING manzili — umumiy bot sozlamasining kadrga xos ustuni.
 *
 * `/admin/settings` da har kadr uchun alohida havola maydoni bor
 * (`link_p1`…`link_p10`). Bo'sh bo'lsa — hech narsa o'zgarmaydi, kadr
 * umumiy `bot_username` sozlamasiga boradi. To'ldirilsa — FAQAT o'sha kadr
 * boshqa manzilga ketadi (boshqa bot, kanal yoki butunlay boshqa sayt).
 *
 * Qiymat uch xil bo'lishi mumkin:
 *
 *   · Telegram bot nomi yoki havolasi (`@Bot`, `Bot`, `https://t.me/Bot`)
 *     — umumiy maydondagi qoidalar bilan ishlanadi: kadr slug'i `?start=`
 *     ga tushadi va ustiga trafik manbasi yopishadi. Havolada qat'iy
 *     `?start=abu1` bo'lsa — kod toza ketadi, hech narsa qo'shilmaydi.
 *   · Har qanday boshqa `http(s)` havola (kanal taklifi `t.me/+…`, tashqi
 *     sayt) — XOM HOLICHA. UTM yopishtirilmaydi: bu Telegram `start` kodi
 *     emas, begona manzilga tegishimiz noto'g'ri bo'lardi.
 *   · Tushunarsiz qiymat (sxemasiz matn, `javascript:` va h.k.) — e'tiborsiz
 *     qoldiriladi va kadr umumiy botga qaytadi. Tugma HECH QACHON o'lik
 *     qolmasligi kerak: admin xato yozgani butun voronkani to'xtatmasin.
 *
 * @returns `href` — tugmaning manzili; `stamp` — `data-tg` qo'yiladimi,
 *          ya'ni `lib/track.ts` UTM'ni ustiga yopishtiradimi.
 */
export function ctaLink(raw: string, bot: string, slug: string): { href: string; stamp: boolean } {
  const viaBot = (v: string) => ({ href: tgLink(v, slug), stamp: fixedStart(v) === null });

  const v = (raw || '').trim();
  if (!v) return viaBot(bot);
  if (botUsername(v)) return viaBot(v);
  if (SAFE_URL.test(v)) return { href: v, stamp: false };
  return viaBot(bot);
}
