/**
 * Muhit o'zgaruvchilari. Server tomonda ishlaydi.
 * Build paytida DB/Redis bo'lmasa ham yiqilmasin — shuning uchun hech narsa throw qilmaydi.
 */

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
  JWT_SECRET: process.env.JWT_SECRET ?? '',

  CF_ZONE_ID: process.env.CF_ZONE_ID ?? '',
  CF_API_TOKEN: process.env.CF_API_TOKEN ?? '',

  /** Turnstile (fondagi tekshiruv) */
  TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET_KEY ?? '',

  SITE_URL: process.env.SITE_URL ?? 'https://milliyjamoasi.uz',
  BOT: process.env.NEXT_PUBLIC_BOT ?? 'OpenBudgetBot',

  /** Redis key prefiksi — bitta Redis'ni ikki brend baham ko'radi */
  KEY_PREFIX: process.env.REDIS_KEY_PREFIX ?? 'sp',

  IS_PROD: process.env.NODE_ENV === 'production',
} as const;

/**
 * Cookie'ga `Secure` bayrog'i qo'yiladimi?
 *
 * `NODE_ENV=production` BO'LMAYDI bu yerda mezon: prod'da ham sayt vaqtincha
 * oddiy HTTP orqali berilayotgan bo'lishi mumkin (domen hali ulanmagan, IP
 * orqali kirilyapti). Brauzer HTTP ustida `Secure` cookie'ni butunlay rad
 * etadi — u holda darvozadan muvaffaqiyatli o'tgan foydalanuvchining `gt`
 * cookie'si saqlanmaydi, `/l` middleware uni topmaydi va odam yana darvozaga
 * qaytariladi. Tashqaridan bu "tasdiqladim, lekin ichkariga kirmayapti" bo'lib
 * ko'rinadi va curl bilan sezilmaydi — curl bu bayroqni brauzerdek qo'llamaydi.
 *
 * Shuning uchun mezon — saytning HAQIQIY sxemasi. HTTPS ulanib `SITE_URL`
 * https bo'lgach, cookie'lar avtomatik yana Secure bo'ladi.
 */
export const SECURE_COOKIES = env.SITE_URL.startsWith('https://');

/**
 * Fondagi Turnstile tekshiruvi yoqilganmi?
 *
 * `GATE_ENABLED=0` — o'chirish tugmasi (kalitlar yo'q bo'lsa ham o'chadi).
 * Yoqilgan bo'lsa `TurnstileGuard` sahifa ortida ishlaydi va `/api/lead`
 * `gt` cookie'sini talab qiladi.
 */
export const GATE_ON =
  process.env.GATE_ENABLED !== '0' &&
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

/** Analitika navbati */
export const EV_QUEUE = `${env.KEY_PREFIX}:ev`;
